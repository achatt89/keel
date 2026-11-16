#!/usr/bin/env node
// Run tasks x conditions x reps with `claude -p`, grade each, stop at the spend cap.
//   node evals/run.mjs --tasks ledger --conds none,min,keel --reps 1 --cap-usd 20
//   node evals/run.mjs --gen-keel ledger         one-off: generate the Keel doc set fixture for a task
//     --plugin-dir <dir>  the Keel plugin to generate with (default: this repo's plugins/keel); v1 pins tag keel--v2.5.6:
//     git archive keel--v2.5.6 plugins/keel | tar -x -C <dir>   then  --plugin-dir <dir>/plugins/keel
// Conditions: none, min, answers (min + founder-answers.md), spec (answers + idea.md), keel. A task with "base" starts every condition from that code.
// A task with "sessions" runs them in order in the same folder, one fresh `claude -p` each; one row per session.
// Options: --model sonnet (agent), --judge opus, --effort <level>, --out <dir under results/raw>,
//   --judge-reserve-usd <n> (default 0.6, held back from each session's budget for its judge calls), --keel-fixture <name> (default keel), --keel-overlay <dir> (files copied over the keel fixture), --rescore (with --out: recompute usage fields from saved transcripts, no model calls).
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { readTask, claude, resultEvent, resultEvents, models, CLEAN, EVALS, REPO, RAW } from './lib.mjs';
import { grade, driftJudge } from './grade.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const MODEL = arg('model', 'sonnet');
const JUDGE = arg('judge', 'opus');
const FIXTURE = arg('keel-fixture', 'keel'); // the keel condition's doc set under the task dir (generated there by --gen-keel)
const EFFORT = arg('effort');
const AGENT = ['--model', MODEL, ...(EFFORT ? ['--effort', EFFORT] : []), '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions', ...CLEAN];

// The work folder sits outside the repo so no parent CLAUDE.md or .git leaks in.
function workdir(name) {
  const d = mkdtempSync(join(tmpdir(), `keel-eval-${name}-`));
  spawnSync('git', ['init', '-q'], { cwd: d });
  return d;
}
const commit = (d, msg) => {
  spawnSync('git', ['add', '-A'], { cwd: d });
  spawnSync('git', ['-c', 'user.name=eval', '-c', 'user.email=eval@localhost', 'commit', '-q', '--allow-empty', '-m', msg], { cwd: d });
};

// Condition files first, then the task's starting code (code wins on a name clash, e.g. README.md), then one commit.
function setup(task, cond, d) {
  conditions[cond](task, d);
  if (task.base) cpSync(join(task.dir, task.base), d, { recursive: true, filter: (s) => !/\/\.claude(\/|$)/.test(s) });
  commit(d, 'starting point');
}

const conditions = {
  none: () => {},
  min: (task, d) => { cpSync(join(task.dir, 'AGENTS.min.md'), join(d, 'AGENTS.md')); cpSync(join(task.dir, 'CLAUDE.min.md'), join(d, 'CLAUDE.md')); },
  // min + the raw interview answers, with one line in AGENTS.md pointing at them.
  answers: (task, d) => {
    conditions.min(task, d);
    cpSync(join(task.dir, 'founder-answers.md'), join(d, 'founder-answers.md'));
    writeFileSync(join(d, 'AGENTS.md'), readFileSync(join(d, 'AGENTS.md'), 'utf8') + '- The founder\'s interview answers (product decisions): `founder-answers.md`.\n');
  },
  // answers + the founder's own written idea (idea.md): separates "the spec is written in the repo" from Keel's structure.
  spec: (task, d) => {
    conditions.answers(task, d);
    cpSync(join(task.dir, 'idea.md'), join(d, 'idea.md'));
    writeFileSync(join(d, 'AGENTS.md'), readFileSync(join(d, 'AGENTS.md'), 'utf8') + '- The founder\'s full specification, all phases (the "specification above" the answers refer to): `idea.md`.\n');
  },
  keel: (task, d) => {
    const fx = join(task.dir, FIXTURE);
    if (!existsSync(fx)) throw new Error(`no Keel fixture for ${task.id}: run --gen-keel ${task.id} first`);
    cpSync(fx, d, { recursive: true });
    const ov = arg('keel-overlay'); // files copied over the fixture, e.g. a newer doc-sync as /keel upgrade would install it
    if (ov) cpSync(resolve(ov), d, { recursive: true });
  },
};

// What the transcript says the agent did: turns, tool calls, which doc files it opened.
// docReads = main agent (Read, or a doc path named in a Bash command); subDocReads = subagents (e.g. Keel's doc-sync).
const DOC = /(^|\/)(AGENTS|CLAUDE|founder-answers|idea)\.md$|(^|\/)docs\//;
const DOC_IN_CMD = /(?:^|[\s'"=/])((?:docs\/[\w./-]+\.md)|AGENTS\.md|CLAUDE\.md|founder-answers\.md|idea\.md)/g;
export function profile(stdout) {
  const tools = {}, main = new Set(), sub = new Set();
  let modelId;
  for (const l of stdout.split('\n')) {
    let e; try { e = JSON.parse(l); } catch { continue; }
    if (e.type === 'system' && e.subtype === 'init') modelId ??= e.model;
    for (const c of e.message?.content ?? []) {
      if (c.type !== 'tool_use') continue;
      tools[c.name] = (tools[c.name] ?? 0) + 1;
      const into = e.parent_tool_use_id ? sub : main;
      const f = c.input?.file_path ?? '';
      if (c.name === 'Read' && DOC.test(f)) into.add(f.replace(/.*keel-eval-[^/]+\//, ''));
      if (c.name === 'Bash') for (const m of (c.input?.command ?? '').matchAll(DOC_IN_CMD)) into.add(m[1]);
    }
  }
  return { modelId, tools, docReads: [...main].sort(), subDocReads: [...sub].sort() };
}

// Tokens come from modelUsage (cumulative over the whole run, subagents included); turns are summed
// over all result events. The top-level `usage` covers only the last segment, so it is not used.
export const usage = (r, all = [r], wallMs) => {
  if (!r) return { costUsd: 0, isError: true, subtype: 'no-result', wallMs };
  const ms = models(r), sum = (k) => Object.values(ms).reduce((a, u) => a + u[k], 0);
  return {
    costUsd: r.total_cost_usd, turns: all.reduce((a, e) => a + (e.num_turns ?? 0), 0), segments: all.length, durationMs: r.duration_ms, wallMs,
    inputTokens: sum('input'), outputTokens: sum('output'), cacheRead: sum('cacheRead'), cacheWrite: sum('cacheWrite'),
    isError: r.is_error, subtype: r.subtype, models: ms,
  };
};

async function genKeel(id) {
  const task = readTask(id);
  const d = workdir(`gen-${id}`);
  const pluginDir = resolve(arg('plugin-dir', join(REPO, 'plugins/keel')));
  const skillVersion = readFileSync(join(pluginDir, 'skills/keel/SKILL.md'), 'utf8').match(/^\s*version:\s*"?([\d.]+)/m)?.[1];
  const idea = existsSync(join(task.dir, 'idea.md')) ? 'idea.md' : 'prompt.md'; // follow-up tasks describe the product in idea.md
  const prompt = `Use the keel skill to lay the full foundational documentation suite for a new project in the current directory.
This is a non-interactive run: nobody can answer questions. Do not ask; do not call AskUserQuestion. Every interview answer is below. Where a question is not answered, take your recommended default and mark it [ASSUMPTION] in the docs and the transcript. Accept your own document-set proposal as approved. Generate the documents only: write no application code and no tests.

## The founder's description
${readFileSync(join(task.dir, idea), 'utf8')}

## The founder's interview answers
${readFileSync(join(task.dir, 'founder-answers.md'), 'utf8')}`;
  console.log(`generating Keel fixture for ${id} in ${d}`);
  const r = await claude([...AGENT, '--plugin-dir', pluginDir, '--max-budget-usd', arg('gen-cap-usd', '15')], { cwd: d, timeoutMs: 60 * 60000, input: prompt, label: `gen ${id}` });
  const res = resultEvent(r.stdout);
  const raw = join(RAW, `gen-${id}-${Date.now()}`);
  mkdirSync(raw, { recursive: true });
  writeFileSync(join(raw, 'transcript.jsonl'), r.stdout);
  writeFileSync(join(raw, 'usage.json'), JSON.stringify({ ...usage(res, resultEvents(r.stdout), r.wallMs), ...profile(r.stdout), stderr: r.stderr.slice(-2000) }, null, 2));
  const fx = join(task.dir, FIXTURE);
  rmSync(fx, { recursive: true, force: true });
  cpSync(d, fx, { recursive: true, filter: (s) => !/\/\.git(\/|$)/.test(s) });
  const meta = join(fx, '.keel/meta.json');
  writeFileSync(join(task.dir, `${FIXTURE}-gen-usage.json`), JSON.stringify({ keelVersion: existsSync(meta) ? JSON.parse(readFileSync(meta, 'utf8')).keelVersion : null, pluginSkillVersion: skillVersion, pluginSource: arg('plugin-source', pluginDir), ...usage(res, resultEvents(r.stdout), r.wallMs), modelId: profile(r.stdout).modelId }, null, 2));
  console.log(JSON.stringify(usage(res, resultEvents(r.stdout), r.wallMs)), `\nfixture: ${readdirSync(fx).join(' ')}\nlog: ${raw}`);
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
  if (process.argv.includes('--rescore')) { // recompute usage fields from the saved transcripts; no model calls
    for (const [i, row] of rows.entries()) { const t = readFileSync(join(outDir, `${row.name}.jsonl`), 'utf8'); rows[i] = { ...row, ...usage(resultEvent(t), resultEvents(t), row.wallMs), ...profile(t) }; }
    writeFileSync(summaryFile, JSON.stringify(rows, null, 2));
    return finish(rows, outDir);
  }
  let spent = rows.reduce((s, r) => s + r.costUsd + (r.judgeCostUsd ?? 0), 0);

  for (let rep = 1; rep <= reps; rep++) for (const id of tasks) for (const cond of conds) {
    const task = readTask(id);
    const sessions = task.sessions ?? [{ prompt: 'prompt.md' }];
    const run = `${id}-${cond}-r${rep}`;
    const nameOf = (k) => (task.sessions ? `${run}-s${k}` : run);
    const done = sessions.map((_, i) => rows.find((r) => r.name === nameOf(i + 1)));
    if (done.every(Boolean)) continue; // resumable
    const d = workdir(run);
    const first = done.findIndex((r) => !r); // resume a multi-session run from the saved copy of its last finished session
    if (first === 0) setup(task, cond, d);
    else { cpSync(join(outDir, nameOf(first)), d, { recursive: true }); commit(d, `after session ${first} (restored)`); }
    for (let k = first + 1; k <= sessions.length; k++) {
      const name = nameOf(k);
      // Reserve the judge calls that run after the session (outside its --max-budget-usd), plus the small
      // overshoot claude allows past its own budget, so cap - spent never goes negative (2.6.3 run: +0.009).
      const judgeSeen = Math.max(0, ...rows.map((r) => r.judgeCostUsd ?? 0));
      const reserve = Math.max(Number(arg('judge-reserve-usd', '0.6')), judgeSeen * 1.25) + 0.05;
      const left = cap - spent - reserve;
      if (left < 0.5) { console.log(`STOP: spend cap ${cap} reached (${spent.toFixed(2)} spent)`); return finish(rows, outDir); }
      const prompt = readFileSync(join(task.dir, sessions[k - 1].prompt), 'utf8');
      process.stdout.write(`${name} ... `);
      const r = await claude([...AGENT, '--max-budget-usd', String(Math.min(left, Number(arg('run-cap-usd', '5'))).toFixed(2))],
        { cwd: d, timeoutMs: (task.timeoutMin ?? 20) * 60000, input: prompt, label: name });
      const res = resultEvent(r.stdout);
      writeFileSync(join(outDir, `${name}.jsonl`), r.stdout);
      cpSync(d, join(outDir, name), { recursive: true, filter: (s) => !/\/(\.git|node_modules)(\/|$)/.test(s) });
      const g = await grade(id, d, { judgeModel: JUDGE, session: k });
      const dj = task.drift && cond === 'keel' ? await driftJudge(task, d, JUDGE) : null;
      const j = g.judge ?? dj; // the cost of whichever judge ran is charged to the row
      const prev = rows.find((x) => x.name === nameOf(k - 1));
      const row = { name, run, task: id, cond, rep, ...(task.sessions ? { session: k } : {}), model: MODEL, ...usage(res, resultEvents(r.stdout), r.wallMs), timedOut: r.timedOut, ...profile(r.stdout),
        testsPass: g.tests.pass, testsTotal: g.tests.total, testsFailed: g.tests.failed,
        decisionPass: g.tests.decisionPass, decisionTotal: g.tests.decisionTotal,
        ...(g.tests.phases ? { phases: g.tests.phases.map(({ phase, pass, total, failed }) => ({ phase, pass, total, failed })),
          // a regression = a test of an earlier phase that passed after the previous session and fails now
          regressions: prev ? g.tests.phases.filter((p) => p.phase < k).flatMap((p) => p.failed).filter((t) => !prev.testsFailed.includes(t)).length : 0 } : {}),
        judge: g.judge?.verdict ?? null, judgeFailed: (g.judge?.items ?? []).filter((i) => !i.pass).map((i) => i.id),
        judgeReasons: Object.fromEntries((g.judge?.items ?? []).filter((i) => !i.pass).map((i) => [i.id, i.reason])),
        ...(dj ? { drift: dj.verdict, driftFailed: dj.items.filter((i) => !i.pass).map((i) => i.id), driftReasons: Object.fromEntries(dj.items.filter((i) => !i.pass).map((i) => [i.id, i.reason])) } : {}),
        judgeCostUsd: j?.costUsd ?? 0, judgeModels: j?.models ?? {}, success: g.success };
      rows.push(row);
      spent += row.costUsd + row.judgeCostUsd;
      writeFileSync(summaryFile, JSON.stringify(rows, null, 2));
      console.log(`${row.success ? 'PASS' : 'FAIL'} tests ${row.testsPass}/${row.testsTotal}${row.decisionTotal ? ` decision ${row.decisionPass}/${row.decisionTotal}` : ''} judge ${row.judge ?? '-'}${dj ? ` drift ${dj.verdict}` : ''} ${row.costUsd?.toFixed(2)} ${row.turns} turns (total ${spent.toFixed(2)})`);
    }
  }
  finish(rows, outDir);
}

function finish(rows, outDir) {
  const lines = ['| run | success | tests | decision tests | judge | drift | regressions | agent $ | judge $ | turns | wall s | out tok | cache read | doc reads (sub) |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|'];
  for (const r of rows) lines.push(`| ${r.name} | ${r.success ? 'yes' : 'no'} | ${r.testsPass}/${r.testsTotal} | ${r.decisionTotal ? `${r.decisionPass}/${r.decisionTotal}` : '-'} | ${r.judge ?? '-'}${r.judgeFailed.length ? ` (${r.judgeFailed.join(', ')})` : ''} | ${r.drift ?? '-'}${r.driftFailed?.length ? ` (${r.driftFailed.join(', ')})` : ''} | ${r.regressions ?? '-'} | ${r.costUsd?.toFixed(2)} | ${(r.judgeCostUsd ?? 0).toFixed(2)} | ${r.turns} | ${r.wallMs ? Math.round(r.wallMs / 1000) : '-'} | ${r.outputTokens} | ${r.cacheRead} | ${r.docReads.length} (${r.subDocReads?.length ?? 0}) |`);
  const spent = rows.reduce((s, r) => s + r.costUsd + (r.judgeCostUsd ?? 0), 0);
  lines.push('', `Total spend: agent ${rows.reduce((s, r) => s + r.costUsd, 0).toFixed(3)} + judge ${rows.reduce((s, r) => s + (r.judgeCostUsd ?? 0), 0).toFixed(3)} = ${spent.toFixed(3)}. Multi-session runs: the run total is the sum of its session rows.`);
  writeFileSync(join(outDir, 'summary.md'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
