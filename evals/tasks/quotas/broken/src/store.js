// File-storage metadata service: users on a plan, files by path. Sizes are in bytes.
// Content lives in object storage; this module keeps the metadata and enforces the rules.
import { formatBytes, GiB } from './units.js';

const LIMITS = { free: 2 * GiB, pro: 200 * GiB, team: Infinity };

export class StoreError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'StoreError';
    this.code = code;
  }
}

export const PLANS = ['free', 'pro', 'team'];
const PATH = /^\/(?:[\w.-]+\/)*[\w.-]+$/;

export function createStore() {
  const users = new Map();
  let seq = 0;

  const userOf = (id) => {
    const u = users.get(id);
    if (!u) throw new StoreError('not_found', `unknown user ${id}`);
    return u;
  };
  const checkPlan = (plan) => {
    if (!PLANS.includes(plan)) throw new StoreError('invalid_input', `plan must be one of ${PLANS.join(', ')}`);
  };
  const checkPath = (path) => {
    if (typeof path !== 'string' || !PATH.test(path) || path.split('/').some((s) => s === '.' || s === '..')) {
      throw new StoreError('invalid_input', `bad path ${path}`);
    }
  };

  return {
    addUser({ name, plan = 'free' } = {}) {
      if (typeof name !== 'string' || !name.trim()) throw new StoreError('invalid_input', 'name is required');
      checkPlan(plan);
      const id = `u_${++seq}`;
      users.set(id, { id, name: name.trim(), plan, files: new Map() });
      return id;
    },

    user(id) {
      const { files, ...u } = userOf(id);
      return { ...u, files: files.size };
    },

    // Changing plan never deletes files.
    setPlan(id, plan) {
      const u = userOf(id);
      checkPlan(plan);
      u.plan = plan;
    },

    // Create or overwrite the file at `path`. Check order: unknown user, then bad input.
    put(id, { path, size } = {}) {
      const u = userOf(id);
      checkPath(path);
      if (!Number.isSafeInteger(size) || size < 0) throw new StoreError('invalid_input', 'size must be a non-negative integer');
      const used = [...u.files.values()].reduce((s, f) => s + f.size, 0);
      if (used + size >= LIMITS[u.plan]) throw new StoreError('over_quota', 'storage quota exceeded');
      const prev = u.files.get(path);
      const file = { path, size, version: (prev?.version ?? 0) + 1 };
      u.files.set(path, file);
      return { ...file };
    },

    usage(id) {
      const u = userOf(id);
      const used = [...u.files.values()].reduce((s, f) => s + f.size, 0);
      return { used, limit: LIMITS[u.plan], percent: Math.round((used / LIMITS[u.plan]) * 100) };
    },

    stat(id, path) {
      const f = userOf(id).files.get(path);
      if (!f) throw new StoreError('not_found', `no file at ${path}`);
      return { ...f };
    },

    remove(id, path) {
      const u = userOf(id);
      if (!u.files.delete(path)) throw new StoreError('not_found', `no file at ${path}`);
    },

    // Files under `prefix`, sorted by path.
    list(id, prefix = '/') {
      return [...userOf(id).files.values()]
        .filter((f) => f.path.startsWith(prefix))
        .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
        .map((f) => ({ ...f }));
    },

    // One line for the account page, e.g. "3 files, 1.5 MiB".
    summary(id) {
      const files = [...userOf(id).files.values()];
      const total = files.reduce((s, f) => s + f.size, 0);
      return `${files.length} file${files.length === 1 ? '' : 's'}, ${formatBytes(total)}`;
    },
  };
}
