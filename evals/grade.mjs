#!/usr/bin/env node
// Grade one submission: hidden tests (deterministic) + a rubric judge (a different model from the agent).
//   node evals/grade.mjs <task> <submissionDir> [--judge opus] [--no-judge]
//   node evals/grade.mjs --selftest [task...]   proves both graders pass the reference and fail the broken copy
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, existsSync, mkdtempSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { readTask, claude, CLEAN, EVALS } from './lib.mjs';

export function runTests(task, dir) {
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', join(task.dir, task.tests)], {
    env: { ...process.env, SUBMISSION: resolve(dir) }, encoding: 'utf8', timeout: 120000,
  });
  const num = (k) => Number((r.stdout.match(new RegExp(`^# ${k} (\\d+)`, 'm')) ?? [])[1] ?? 0);
  const failed = [...r.stdout.matchAll(/^not ok \d+ - (.*)$/gm)].map((m) => m[1]);
  return { total: num('tests'), pass: num('pass'), fail: num('fail'), failed };
}

// Source files the judge sees. Keel/agent docs are left out on purpose: the judge grades the product, not the docs.
const SKIP = /^(node_modules|\.git|\.claude|\.keel|docs|almanac)(\/|$)|^(AGENTS|CLAUDE|CHANGELOG|PRODUCT)\.md$|\.json$(?<!package\.json)/;
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
  const r = await claude(['--model', model, '--output-format', 'json', '--tools', '', ...CLEAN],
    { cwd: mkdtempSync(join(tmpdir(), 'keel-judge-')), timeoutMs: 300000, input: prompt });
  let out, items = [];
  try { out = JSON.parse(r.stdout); items = JSON.parse(out.result.match(/\{[\s\S]*\}/)[0]).items; } catch {}
  const must = mustIds(rubric);
  const byId = new Map(items.map((i) => [i.id, i]));
  const missing = allIds(rubric).filter((id) => !byId.has(id));
  // The verdict is computed here from the MUST items, never taken from the model.
  const verdict = items.length && !missing.length && must.every((id) => byId.get(id)?.pass === true) ? 'pass' : 'fail';
  return { model, verdict, items, missing, costUsd: out?.total_cost_usd ?? 0, error: out ? null : (r.stderr || r.stdout).slice(0, 500) };
}

export async function grade(taskId, dir, { judgeModel = 'opus', noJudge = false } = {}) {
  const task = readTask(taskId);
  const tests = runTests(task, dir);
  const j = noJudge ? null : await judge(task, dir, judgeModel);
  const success = tests.total > 0 && tests.fail === 0 && (noJudge || j.verdict === 'pass');
  return { task: taskId, tests, judge: j, success };
}

async function selftest(ids) {
  let ok = true;
  for (const id of ids) {
    for (const [variant, want] of [['reference', true], ['broken', false]]) {
      const dir = join(EVALS, 'tasks', id, variant);
      const g = await grade(id, dir);
      const testsOk = want ? g.tests.fail === 0 && g.tests.total > 0 : g.tests.fail > 0;
      const judgeOk = (g.judge.verdict === 'pass') === want;
      ok &&= testsOk && judgeOk;
      const failedItems = g.judge.items.filter((i) => !i.pass).map((i) => i.id).join(',') || '-';
      console.log(`${testsOk && judgeOk ? 'OK  ' : 'FAIL'} ${id}/${variant}: tests ${g.tests.pass}/${g.tests.total}, judge ${g.judge.verdict} (failed: ${failedItems}) $${g.judge.costUsd.toFixed(3)}`);
    }
  }
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = process.argv.slice(2);
  if (a[0] === '--selftest') {
    const ids = a.slice(1).length ? a.slice(1) : readdirSync(join(EVALS, 'tasks')).filter((t) => existsSync(join(EVALS, 'tasks', t, 'broken')));
    await selftest(ids);
  } else {
    const [task, dir] = a;
    if (!task || !dir) { console.error('usage: grade.mjs <task> <dir> [--judge model] [--no-judge] | --selftest [task...]'); process.exit(2); }
    const ji = a.indexOf('--judge');
    console.log(JSON.stringify(await grade(task, dir, { judgeModel: ji > -1 ? a[ji + 1] : 'opus', noJudge: a.includes('--no-judge') }), null, 2));
  }
}
