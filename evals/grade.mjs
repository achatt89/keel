#!/usr/bin/env node
// Grade one submission: hidden tests (deterministic) + a rubric judge (a different model from the agent).
//   node evals/grade.mjs <task> <submissionDir> [--judge opus] [--no-judge]
//   node evals/grade.mjs --selftest [task...]   proves both graders pass the reference and fail the broken copy
//   node evals/grade.mjs --drift-selftest <task>  proves the drift judge: Keel docs + no code = no drift; + final code = drift
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, existsSync, mkdtempSync, cpSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { readTask, claude, models, CLEAN, EVALS } from './lib.mjs';

// Tests named "decision: ..." check a founder decision the prompt does not state; they are counted apart.
export function runTests(task, dir, tests = task.tests) {
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', join(task.dir, tests)], {
    env: { ...process.env, SUBMISSION: resolve(dir) }, encoding: 'utf8', timeout: 120000,
  });
  const num = (k) => Number((r.stdout.match(new RegExp(`^# ${k} (\\d+)`, 'm')) ?? [])[1] ?? 0);
  const failed = [...r.stdout.matchAll(/^not ok \d+ - (.*)$/gm)].map((m) => m[1]);
  const decisions = [...r.stdout.matchAll(/^(not )?ok \d+ - decision:/gm)];
  return { total: num('tests'), pass: num('pass'), fail: num('fail'), failed, decisionTotal: decisions.length, decisionPass: decisions.filter((m) => !m[1]).length };
}

// Source files the judge sees. Keel/agent docs are left out on purpose: the judge grades the product, not the docs.
const SKIP = /^(node_modules|\.git|\.claude|\.keel|docs|almanac)(\/|$)|^(AGENTS|CLAUDE|CHANGELOG|PRODUCT|founder-answers)\.md$|\.json$(?<!package\.json)/;
function collect(dir, cap = 150_000) {
  const out = [];
  let size = 0;
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name), rel = relative(dir, p);
      if (SKIP.test(rel)) continue;
      if (statSync(p).isDirectory()) { walk(p); continue; }
      const text = readFileSync(p, 'utf8');
      if (size + text.length > cap) { out.push(`=== ${rel} (omitted: size cap) ===`); continue; }
      size += text.length;
      out.push(`=== ${rel} ===\n${text}`);
    }
  };
  walk(dir);
  return out.join('\n\n');
}

const mustIds = (rubric) => [...rubric.matchAll(/^\d+\. MUST ([\w-]+):/gm)].map((m) => m[1]);
const allIds = (rubric) => [...rubric.matchAll(/^\d+\. (?:MUST )?([\w-]+):/gm)].map((m) => m[1]);

export async function judge(task, dir, model = 'opus') {
  const rubric = readFileSync(join(task.dir, 'rubric.md'), 'utf8');
  const spec = readFileSync(join(task.dir, 'prompt.md'), 'utf8');
  const prompt = `You are grading a software submission. Be strict and literal; do not run anything.

## Specification given to the developer
${spec}

## Rubric
${rubric}

## Submission files
${collect(dir)}

Answer with JSON only, no prose, exactly this shape:
{"items":[{"id":"<rubric id>","pass":true|false,"reason":"<one sentence>"}]}
Include every rubric id: ${allIds(rubric).join(', ')}.`;
  // The verdict is computed in judgeCall from the MUST items, never taken from the model.
  return judgeCall(prompt, rubric, model);
}

// The project's documents (not the code), for the drift judge. The interview transcript is left out.
function collectDocs(dir, cap = 250_000) {
  const out = [];
  let size = 0;
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name), rel = relative(dir, p);
      if (/^(node_modules|\.git|src|test|tests)(\/|$)|keel-transcript\.md$/.test(rel)) continue;
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!rel.endsWith('.md')) continue;
      const text = readFileSync(p, 'utf8');
      if (size + text.length > cap) { out.push(`=== ${rel} (omitted: size cap) ===`); continue; }
      size += text.length;
      out.push(`=== ${rel} ===\n${text}`);
    }
  };
  walk(dir);
  return out.join('\n\n');
}

// Drift: do the documents still match the code? Same verdict rule as the rubric judge (MUST items).
export async function driftJudge(task, dir, model = 'opus') {
  const rubric = readFileSync(join(task.dir, task.drift), 'utf8');
  const code = existsSync(join(dir, 'src')) ? collect(dir) : '(no code yet)';
  const prompt = `You are checking a software project for drift between its documents and its code. Be strict and literal; do not run anything.

## Drift rubric
${rubric}

## Documents
${collectDocs(dir)}

## Code and tests
${code}

Answer with JSON only, no prose, exactly this shape:
{"items":[{"id":"<rubric id>","pass":true|false,"reason":"<one sentence>"}]}
Include every rubric id: ${allIds(rubric).join(', ')}.`;
  return judgeCall(prompt, rubric, model);
}

async function judgeCall(prompt, rubric, model) {
  const r = await claude(['--model', model, '--output-format', 'json', '--tools', '', ...CLEAN],
    { cwd: mkdtempSync(join(tmpdir(), 'keel-judge-')), timeoutMs: 300000, input: prompt });
  let out, items = [];
  try { out = JSON.parse(r.stdout); items = JSON.parse(out.result.match(/\{[\s\S]*\}/)[0]).items; } catch {}
  const must = mustIds(rubric);
  const byId = new Map(items.map((i) => [i.id, i]));
  const missing = allIds(rubric).filter((id) => !byId.has(id));
  const verdict = items.length && !missing.length && must.every((id) => byId.get(id)?.pass === true) ? 'pass' : 'fail';
  return { model, verdict, items, missing, costUsd: out?.total_cost_usd ?? 0, models: models(out), error: out ? null : (r.stderr || r.stdout).slice(0, 500) };
}

// Multi-session tasks (task.sessions) are graded after session k on the hidden tests of phases 1..k;
// they have no rubric judge. Single-session tasks: hidden tests + rubric judge, as in v0.
export async function grade(taskId, dir, { judgeModel = 'opus', noJudge = false, session } = {}) {
  const task = readTask(taskId);
  if (task.sessions) {
    const phases = task.sessions.slice(0, session ?? task.sessions.length).map((s, i) => ({ phase: i + 1, ...runTests(task, dir, s.tests) }));
    const sum = (k) => phases.reduce((a, p) => a + p[k], 0);
    const tests = { total: sum('total'), pass: sum('pass'), fail: sum('fail'), failed: phases.flatMap((p) => p.failed), decisionTotal: 0, decisionPass: 0, phases };
    return { task: taskId, tests, judge: null, success: tests.total > 0 && tests.fail === 0 };
  }
  const tests = runTests(task, dir);
  const j = noJudge ? null : await judge(task, dir, judgeModel);
  const success = tests.total > 0 && tests.fail === 0 && (noJudge || j.verdict === 'pass');
  return { task: taskId, tests, judge: j, success };
}

const tok = (ms) => Object.entries(ms ?? {}).map(([m, u]) => `${m} in ${u.input} out ${u.output} cacheR ${u.cacheRead} cacheW ${u.cacheWrite}`).join('; ') || 'no usage';

// Drift judge self-test: the Keel fixture with no code has no drift; the fixture with the final reference code does
// (the plan says nothing is built while all phases are).
async function driftSelftest(id) {
  const task = readTask(id);
  let ok = true;
  for (const [label, withCode, want] of [['keel docs + no code', false, 'pass'], ['keel docs + final reference code', true, 'fail']]) {
    const d = mkdtempSync(join(tmpdir(), 'keel-drift-'));
    cpSync(join(task.dir, 'keel'), d, { recursive: true });
    if (withCode) cpSync(join(task.dir, 'reference', 'src'), join(d, 'src'), { recursive: true });
    const j = await driftJudge(task, d);
    ok &&= j.verdict === want;
    const failedItems = j.items.filter((i) => !i.pass).map((i) => `${i.id}: ${i.reason}`).join(' | ') || '-';
    console.log(`${j.verdict === want ? 'OK  ' : 'FAIL'} ${id}/drift ${label}: verdict ${j.verdict} (want ${want}; failed: ${failedItems}) ${j.costUsd.toFixed(3)} [${tok(j.models)}]`);
  }
  process.exit(ok ? 0 : 1);
}

async function selftest(ids) {
  let ok = true;
  for (const id of ids) {
    for (const [variant, want] of [['reference', true], ['broken', false]]) {
      const dir = join(EVALS, 'tasks', id, variant);
      const g = await grade(id, dir);
      const testsOk = want ? g.tests.fail === 0 && g.tests.total > 0 : g.tests.fail > 0;
      if (!g.judge) { // multi-session task: tests only, per phase
        ok &&= testsOk;
        console.log(`${testsOk ? 'OK  ' : 'FAIL'} ${id}/${variant}: tests ${g.tests.pass}/${g.tests.total} (${g.tests.phases.map((p) => `phase ${p.phase} ${p.pass}/${p.total}`).join(', ')}), no rubric judge`);
        continue;
      }
      const decOk = want ? g.tests.decisionPass === g.tests.decisionTotal : g.tests.decisionPass < g.tests.decisionTotal;
      const judgeOk = (g.judge.verdict === 'pass') === want && decOk;
      ok &&= testsOk && judgeOk;
      const failedItems = g.judge.items.filter((i) => !i.pass).map((i) => i.id).join(',') || '-';
      console.log(`${testsOk && judgeOk ? 'OK  ' : 'FAIL'} ${id}/${variant}: tests ${g.tests.pass}/${g.tests.total} (decision ${g.tests.decisionPass}/${g.tests.decisionTotal}), judge ${g.judge.verdict} (failed: ${failedItems}) ${g.judge.costUsd.toFixed(3)} [${tok(g.judge.models)}]`);
    }
  }
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = process.argv.slice(2);
  if (a[0] === '--drift-selftest') await driftSelftest(a[1]);
  else if (a[0] === '--selftest') {
    const ids = a.slice(1).length ? a.slice(1) : readdirSync(join(EVALS, 'tasks')).filter((t) => existsSync(join(EVALS, 'tasks', t, 'broken')));
    await selftest(ids);
  } else {
    const [task, dir] = a;
    if (!task || !dir) { console.error('usage: grade.mjs <task> <dir> [--judge model] [--no-judge] | --selftest [task...]'); process.exit(2); }
    const ji = a.indexOf('--judge');
    console.log(JSON.stringify(await grade(task, dir, { judgeModel: ji > -1 ? a[ji + 1] : 'opus', noJudge: a.includes('--no-judge') }), null, 2));
  }
}
