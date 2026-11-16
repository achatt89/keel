// Shared helpers for run.mjs and grade.mjs. Node stdlib only.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EVALS = dirname(fileURLToPath(import.meta.url));
export const REPO = dirname(EVALS);
// Raw logs live here. Set EVAL_RAW to a folder outside the worktree so a torn-down worktree keeps them.
export const RAW = process.env.EVAL_RAW || join(EVALS, 'results/raw');
export const taskDir = (id) => join(EVALS, 'tasks', id);
export const readTask = (id) => ({ ...JSON.parse(readFileSync(join(taskDir(id), 'task.json'), 'utf8')), dir: taskDir(id) });

// Flags that keep the measured session clean: no user settings, hooks, plugins or MCP servers.
// Project settings stay on, so a generated .claude/ in the work folder behaves as it would for a user.
export const CLEAN = ['--setting-sources', 'project', '--strict-mcp-config', '--no-session-persistence'];

// Run `claude -p` and resolve with { code, stdout, stderr, timedOut }.
// Prints a heartbeat line every 60 s so a watching agent is never idle while a long child run is silent.
export function claude(args, { cwd, timeoutMs, input, label = 'claude -p' } = {}) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const beat = setInterval(() => console.log(`[heartbeat] ${label}: ${Math.round((Date.now() - t0) / 1000)} s, ${stdout.length} bytes out`), Number(process.env.EVAL_HEARTBEAT_MS || 60000));
    const p = spawn('claude', ['-p', ...args], { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    p.stdout.on('data', (d) => (stdout += d));
    p.stderr.on('data', (d) => (stderr += d));
    const t = timeoutMs && setTimeout(() => { timedOut = true; p.kill('SIGTERM'); }, timeoutMs);
    p.on('close', (code) => { clearTimeout(t); clearInterval(beat); resolve({ code, stdout, stderr, timedOut, wallMs: Date.now() - t0 }); });
    p.stdin.end(input ?? '');
  });
}

// Per-model token use from a result event's modelUsage, keyed by the exact model id Claude Code reports.
export const models = (r) => Object.fromEntries(Object.entries(r?.modelUsage ?? {}).map(([id, u]) => [id, {
  input: u.inputTokens ?? 0, output: u.outputTokens ?? 0, cacheRead: u.cacheReadInputTokens ?? 0, cacheWrite: u.cacheCreationInputTokens ?? 0, costUsd: u.costUSD ?? 0,
}]));

// Every `result` event. A run that waits on a background subagent emits one per resumed turn:
// only the LAST carries cumulative cost and modelUsage; num_turns and usage are per segment.
export const resultEvents = (stdout) => stdout.split('\n').flatMap((l) => { try { const e = JSON.parse(l); return e.type === 'result' ? [e] : []; } catch { return []; } });

// The `result` event of a stream-json transcript, or of a single json output.
export function resultEvent(stdout) {
  const lines = stdout.trim().split('\n').reverse();
  for (const l of lines) { try { const e = JSON.parse(l); if (e.type === 'result') return e; } catch {} }
  return null;
}
