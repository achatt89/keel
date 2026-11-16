// Shared helpers for run.mjs and grade.mjs. Node stdlib only.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EVALS = dirname(fileURLToPath(import.meta.url));
export const REPO = dirname(EVALS);
export const taskDir = (id) => join(EVALS, 'tasks', id);
export const readTask = (id) => ({ ...JSON.parse(readFileSync(join(taskDir(id), 'task.json'), 'utf8')), dir: taskDir(id) });

// Flags that keep the measured session clean: no user settings, hooks, plugins or MCP servers.
// Project settings stay on, so a generated .claude/ in the work folder behaves as it would for a user.
export const CLEAN = ['--setting-sources', 'project', '--strict-mcp-config', '--no-session-persistence'];

// Run `claude -p` and resolve with { code, stdout, stderr, timedOut }.
export function claude(args, { cwd, timeoutMs, input } = {}) {
  return new Promise((resolve) => {
    const p = spawn('claude', ['-p', ...args], { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    p.stdout.on('data', (d) => (stdout += d));
    p.stderr.on('data', (d) => (stderr += d));
    const t = timeoutMs && setTimeout(() => { timedOut = true; p.kill('SIGTERM'); }, timeoutMs);
    p.on('close', (code) => { clearTimeout(t); resolve({ code, stdout, stderr, timedOut }); });
    p.stdin.end(input ?? '');
  });
}

// The `result` event of a stream-json transcript, or of a single json output.
export function resultEvent(stdout) {
  const lines = stdout.trim().split('\n').reverse();
  for (const l of lines) { try { const e = JSON.parse(l); if (e.type === 'result') return e; } catch {} }
  return null;
}
