#!/usr/bin/env node
// Run tasks x conditions x reps with `claude -p`, grade each, stop at the spend cap.
//   node evals/run.mjs --tasks ledger --conds none,min,keel --reps 1 --cap-usd 20
//   node evals/run.mjs --gen-keel ledger         one-off: generate the Keel doc set fixture for a task
// Options: --model sonnet (agent), --judge opus, --effort <level>, --out <dir under results/raw>.
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readTask, claude, resultEvent, models, CLEAN, EVALS, REPO, RAW } from './lib.mjs';
import { grade } from './grade.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const MODEL = arg('model', 'sonnet');
const JUDGE = arg('judge', 'opus');
const EFFORT = arg('effort');
const AGENT = ['--model', MODEL, ...(EFFORT ? ['--effort', EFFORT] : []), '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions', ...CLEAN];

// The work folder sits outside the repo so no parent CLAUDE.md or .git leaks in.
function workdir(name) {
  const d = mkdtempSync(join(tmpdir(), `keel-eval-${name}-`));
  spawnSync('git', ['init', '-q'], { cwd: d });
  return d;
}

const conditions = {
  none: () => {},
  min: (task, d) => { cpSync(join(task.dir, 'AGENTS.min.md'), join(d, 'AGENTS.md')); cpSync(join(task.dir, 'CLAUDE.min.md'), join(d, 'CLAUDE.md')); },
  keel: (task, d) => {
    const fx = join(task.dir, 'keel');
    if (!existsSync(fx)) throw new Error(`no Keel fixture for ${task.id}: run --gen-keel ${task.id} first`);
    cpSync(fx, d, { recursive: true });
  },
};

// What the transcript says the agent did: turns, tool calls, which doc files it opened.
function profile(stdout) {
  const tools = {}, docReads = new Set();
  let modelId;
  for (const l of stdout.split('\n')) {
    let e; try { e = JSON.parse(l); } catch { continue; }
    if (e.type === 'system' && e.subtype === 'init') modelId = e.model;
    for (const c of e.message?.content ?? []) {
      if (c.type !== 'tool_use') continue;
      tools[c.name] = (tools[c.name] ?? 0) + 1;
      const f = c.input?.file_path ?? '';
      if (c.name === 'Read' && /(^|\/)(AGENTS|CLAUDE)\.md$|\/docs\//.test(f)) docReads.add(f.replace(/.*keel-eval-[^/]+\//, ''));
    }
  }
  return { modelId, tools, docReads: [...docReads].sort() };
}

const usage = (r) => r ? {
  costUsd: r.total_cost_usd, turns: r.num_turns, durationMs: r.duration_ms,
  inputTokens: r.usage?.input_tokens, outputTokens: r.usage?.output_tokens,
  cacheRead: r.usage?.cache_read_input_tokens, cacheWrite: r.usage?.cache_creation_input_tokens,
  isError: r.is_error, subtype: r.subtype, models: models(r),
} : { costUsd: 0, isError: true, subtype: 'no-result' };

async function genKeel(id) {
  const task = readTask(id);
  const d = workdir(`gen-${id}`);
  const prompt = `Use the keel skill to lay the full foundational documentation suite for a new project in the current directory.
This is a non-interactive run: nobody can answer questions. Do not ask; do not call AskUserQuestion. Every interview answer is below. Where a question is not answered, take your recommended default and mark it [ASSUMPTION] in the docs and the transcript. Accept your own document-set proposal as approved. Generate the documents only: write no application code and no tests.

## The founder's description (prompt.md)
${readFileSync(join(task.dir, 'prompt.md'), 'utf8')}

## The founder's interview answers
${readFileSync(join(task.dir, 'founder-answers.md'), 'utf8')}`;
  console.log(`generating Keel fixture for ${id} in ${d}`);
  const r = await claude([...AGENT, '--plugin-dir', join(REPO, 'plugins/keel'), '--max-budget-usd', arg('gen-cap-usd', '15')], { cwd: d, timeoutMs: 60 * 60000, input: prompt, label: `gen ${id}` });
  const res = resultEvent(r.stdout);
  const raw = join(RAW, `gen-${id}-${Date.now()}`);
  mkdirSync(raw, { recursive: true });
  writeFileSync(join(raw, 'transcript.jsonl'), r.stdout);
  writeFileSync(join(raw, 'usage.json'), JSON.stringify({ ...usage(res), ...profile(r.stdout), stderr: r.stderr.slice(-2000) }, null, 2));
  const fx = join(task.dir, 'keel');
  rmSync(fx, { recursive: true, force: true });
  cpSync(d, fx, { recursive: true, filter: (s) => !/\/\.git(\/|$)/.test(s) });
  writeFileSync(join(task.dir, 'keel-gen-usage.json'), JSON.stringify({ keelVersion: JSON.parse(readFileSync(join(fx, '.keel/meta.json'), 'utf8')).keelVersion, ...usage(res), modelId: profile(r.stdout).modelId }, null, 2));
  console.log(JSON.stringify(usage(res)), `\nfixture: ${readdirSync(fx).join(' ')}\nlog: ${raw}`);
}

async function main() {
  if (arg('gen-keel')) return genKeel(arg('gen-keel'));
  const tasks = arg('tasks', readdirSync(join(EVALS, 'tasks')).join(',')).split(',');
  const conds = arg('conds', 'none,min,keel').split(',');
  const reps = Number(arg('reps', '1'));
  const cap = Number(arg('cap-usd', '10'));
  const outDir = join(RAW, arg('out', new Date().toISOString().replace(/[:.]/g, '-')));
  mkdirSync(outDir, { recursive: true });
  const summaryFile = join(outDir, 'summary.json');
  const rows = existsSync(summaryFile) ? JSON.parse(readFileSync(summaryFile, 'utf8')) : [];
  let spent = rows.reduce((s, r) => s + r.costUsd + (r.judgeCostUsd ?? 0), 0);

  for (let rep = 1; rep <= reps; rep++) for (const id of tasks) for (const cond of conds) {
    const name = `${id}-${cond}-r${rep}`;
    if (rows.some((r) => r.name === name)) continue; // resumable
    const left = cap - spent;
    if (left < 0.5) { console.log(`STOP: spend cap $${cap} reached ($${spent.toFixed(2)} spent)`); return finish(rows, outDir); }
    const task = readTask(id);
    const d = workdir(name);
    conditions[cond](task, d);
    const prompt = readFileSync(join(task.dir, 'prompt.md'), 'utf8');
    process.stdout.write(`${name} ... `);
    const r = await claude([...AGENT, '--max-budget-usd', String(Math.min(left, Number(arg('run-cap-usd', '5'))).toFixed(2))],
      { cwd: d, timeoutMs: (task.timeoutMin ?? 20) * 60000, input: prompt, label: name });
    const res = resultEvent(r.stdout);
    writeFileSync(join(outDir, `${name}.jsonl`), r.stdout);
    cpSync(d, join(outDir, name), { recursive: true, filter: (s) => !/\/(\.git|node_modules)(\/|$)/.test(s) });
    const g = await grade(id, d, { judgeModel: JUDGE });
    const row = { name, task: id, cond, rep, model: MODEL, ...usage(res), timedOut: r.timedOut, ...profile(r.stdout),
      testsPass: g.tests.pass, testsTotal: g.tests.total, testsFailed: g.tests.failed,
      judge: g.judge.verdict, judgeFailed: g.judge.items.filter((i) => !i.pass).map((i) => i.id), judgeCostUsd: g.judge.costUsd, judgeModels: g.judge.models, success: g.success };
    rows.push(row);
    spent += row.costUsd + row.judgeCostUsd;
    writeFileSync(summaryFile, JSON.stringify(rows, null, 2));
    console.log(`${row.success ? 'PASS' : 'FAIL'} tests ${row.testsPass}/${row.testsTotal} judge ${row.judge} $${row.costUsd?.toFixed(2)} ${row.turns} turns (total $${spent.toFixed(2)})`);
  }
  finish(rows, outDir);
}

function finish(rows, outDir) {
  const lines = ['| run | success | tests | judge | cost $ | turns | out tok | cache read | doc reads |', '|---|---|---|---|---|---|---|---|---|'];
  for (const r of rows) lines.push(`| ${r.name} | ${r.success ? 'yes' : 'no'} | ${r.testsPass}/${r.testsTotal} | ${r.judge}${r.judgeFailed.length ? ` (${r.judgeFailed.join(', ')})` : ''} | ${r.costUsd?.toFixed(2)} | ${r.turns} | ${r.outputTokens} | ${r.cacheRead} | ${r.docReads.length} |`);
  writeFileSync(join(outDir, 'summary.md'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
}

await main();
