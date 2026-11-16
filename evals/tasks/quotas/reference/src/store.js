// File-storage metadata service: users on a plan, files by path. Sizes are in bytes.
// Content lives in object storage; this module keeps the metadata and enforces the rules.
import { formatBytes } from './units.js';

export class StoreError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'StoreError';
    this.code = code;
  }
}

export const PLANS = ['free', 'pro', 'team'];
// Quota per plan in bytes, decimal GB as on the pricing page; null = unlimited.
export const GB = 1_000_000_000;
export const QUOTA = { free: 2 * GB, pro: 200 * GB, team: null };
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

  const usedOf = (u) => [...u.files.values()].reduce((s, f) => s + f.size, 0);

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
      const prev = u.files.get(path);
      // Only growth counts: a write that does not increase usage is always allowed.
      const limit = QUOTA[u.plan], used = usedOf(u), growth = size - (prev?.size ?? 0);
      if (limit !== null && growth > 0 && used + growth > limit) {
        const e = new StoreError('quota_exceeded', `quota of ${limit} bytes exceeded`);
        e.details = { limitBytes: limit, usedBytes: used, requestedBytes: size };
        throw e;
      }
      const file = { path, size, version: (prev?.version ?? 0) + 1 };
      u.files.set(path, file);
      return { ...file };
    },

    // percent is rounded down so 100 only shows when the user is full.
    usage(id) {
      const u = userOf(id);
      const usedBytes = usedOf(u), limitBytes = QUOTA[u.plan];
      return { usedBytes, limitBytes, percent: limitBytes === null ? null : Math.floor((usedBytes * 100) / limitBytes) };
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
