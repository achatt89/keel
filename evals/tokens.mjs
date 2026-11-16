#!/usr/bin/env node
// Cost and token tables from run records: per run, then totals per condition and per task.
//   node evals/tokens.mjs results/raw/<stamp>/summary.json [more summary.json or gen usage.json...]
// Tokens are as Claude Code's `modelUsage` reports them, keyed by exact model id:
// in = uncached input, out = output, cacheR / cacheW = prompt-cache read / write.
import { readFileSync } from 'node:fs';

const rows = process.argv.slice(2).flatMap((f) => {
  const j = JSON.parse(readFileSync(f, 'utf8'));
  return Array.isArray(j) ? j : [{ name: f.match(/gen-[^/]+/)?.[0] ?? f, task: '(fixture)', cond: 'gen', ...j }];
});
const n = (x) => (x ?? 0).toLocaleString('en-US');
const add = (a, u) => { for (const k of ['input', 'output', 'cacheRead', 'cacheWrite', 'costUsd']) a[k] = (a[k] ?? 0) + (u[k] ?? 0); return a; };
const line = (label, role, id, u, runs = '') => `| ${label} | ${role} | \`${id}\` | ${runs} | ${n(u.input)} | ${n(u.output)} | ${n(u.cacheRead)} | ${n(u.cacheWrite)} | ${u.costUsd.toFixed(3)} |`;
const head = (first) => [`| ${first} | role | model id | runs | input | output | cache read | cache write | cost $ |`, '|---|---|---|---|---|---|---|---|---|'];

const out = ['### Per run', '', ...head('run')];
const groups = {};
const bump = (key, role, id, u) => { const g = (groups[`${key}\u0000${role}\u0000${id}`] ??= { runs: 0 }); g.runs++; add(g, u); };
for (const r of rows) {
  for (const [role, ms] of [['agent', r.models], ['judge', r.judgeModels]]) for (const [id, u] of Object.entries(ms ?? {})) {
    out.push(line(r.name, role, id, u));
    bump(`cond ${r.cond}`, role, id, u); bump(`task ${r.task}`, role, id, u); bump(`${r.task} / ${r.cond}`, role, id, u); bump('ALL', role, id, u);
  }
}
out.push('', '### Totals', '', ...head('group'));
for (const [k, g] of Object.entries(groups).sort()) { const [key, role, id] = k.split('\u0000'); out.push(line(key, role, id, g, g.runs)); }
console.log(out.join('\n'));
