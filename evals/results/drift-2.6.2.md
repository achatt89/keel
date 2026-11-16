# 2.6.2 drift fix: measurement (16 Nov 2026)

**Verdict: fail.** The pass rule was drift fails in at most 1 of 9 sessions. Two of the first three sessions failed, so I stopped the run after rep 1 to save the budget.

**Setup.**
- Task: v1 inventory (3 phases, one fresh `claude -p` session per phase), keel condition only.
- Docs: the committed 2.5.6 fixture, plus an overlay (`evals/tasks/inventory/keel-2.6.2-overlay`) with what `/keel upgrade` would install: 2.6.2 `doc-sync.js`, the doc-sync subagent and `.keel/check.mjs` (commit `adffcc0`).
- Models and judge: the same as v1 (agent `claude-sonnet-5-5`, judge `claude-opus-5-5`).
- Command: `run.mjs --tasks inventory --conds keel --reps 3 --keel-overlay … --out v262-drift`.

| session | tests | drift | what the drift judge found | agent $ | judge $ |
|---|---|---|---|---|---|
| r1-s1 | 5/5 | pass | — | 1.455 | 0.350 |
| r1-s2 | 11/11 | fail | ADR-002 Build deviation still says "Phase 2–3 methods not built"; root README lists the reserve error checks in a different order from the code | 1.325 | 0.431 |
| r1-s3 | 15/15 | fail | root README says the Phase 3 methods are not exported yet; same check-order mismatch | 1.207 | 0.474 |

**Spend:** USD 5.242 recorded. Rep 2 session 1 was stopped mid-run: its cost was charged but not recorded, since no transcript or result event was written. **Estimate: about USD 0.3–0.6.** It ran about 1–2 minutes of a session that takes about 4–5 minutes (rep 1 sessions: 222–292 s at USD 1.21–1.46). The hard upper bound is USD 5, its `--max-budget-usd`. For budget accounting, count it as USD 0.6. That leaves at most about USD 9.7 of the 15 cap, minus that unrecorded part.

## What improved against 2.5.6 (rep 1 only, n=1: an indication, not a result)

- **ADR status.** After session 3, every ADR's Status reads Built with a commit, and `.keel/check.mjs` is clean. The 2.5.6 runs had 4 to 6 stale-ADR findings at the same point, on the new check run against the saved v1 folders.
- **Data shapes.** No ARCHITECTURE or LLD data-shape contradiction in any session. On 2.5.6, rep 2 had one in each of its three sessions and rep 3 had one in session 3.

## Why it still failed

1. **Timing.** Doc sync runs on the phase branch, before the merge. At that moment the plan row says "on `<branch>`", so the 2.6.2 check did not count that phase as built, and the stale ADR-002 deviation in s2 went unflagged. The next session's sync fixed it.
2. **Root README.md.** The project README is a phase deliverable, written by task agents. Doc sync compared only `docs/README.md`, so README text written before the code was finished stayed wrong.

## Fixes on the branch (not measured)

- `keel-check.mjs`: a plan row that says "on `<branch>`" counts as built. Self-test case added; the mutant is killed.
- `doc-sync.js` Step 7 and the caller review compare the root README.md as well, including the order of error checks. They also treat this branch's code as built.

**Re-measuring** 3 reps × 3 sessions costs about USD 16 (about 1.75 per session including judges). That does not fit the remaining cap: it needs a new spend OK. A single rep (about USD 5.3) fits, but it cannot meet the 9-session pass rule.

---

# Re-run at `6a2d409` (founder-approved, up to USD 16)

**Verdict: fail again.** Drift failed in 2 of the 6 sessions that ran; the rule allows at most 1 in 9. The run stopped at the second failure. Per the founder's instruction, there is no more spend.

| session | tests | drift | what the drift judge found | agent $ | judge $ |
|---|---|---|---|---|---|
| r1-s1 | 5/5 | pass | — | 1.069 | 0.343 |
| r1-s2 | 11/11 | fail | root README error table: `not_found` on release/fulfil described as "no item with that SKU"; the code raises it for an unknown order id | 1.471 | 0.433 |
| r1-s3 | 15/15 | pass | — | 1.223 | 0.493 |
| r2-s1 | 5/5 | pass | — | 1.062 | 0.339 |
| r2-s2 | 11/11 | pass | — | 1.114 | 0.409 |
| r2-s3 | 15/15 | fail | root README History example numbers `seq` as if an earlier ship were not recorded (the reserve is seq 3 in the code, 2 in the example) | 1.482 | 0.482 |

**Spend.**
- Recorded: USD 9.920 (agent `claude-sonnet-5-5` 7.421, judge `claude-opus-5-5` 2.499).
- Rep 3 session 1 ran about 20 s before it was killed. Its cost is not recorded; the estimate is under USD 0.15.
- 2.6.2 measurement total: 5.242 + 9.920 recorded, plus about 0.75 estimated, so about USD 15.9.
- Eval v1 total: 33.764 + 15.162 recorded, so about USD 49.7 including the estimates.

**Process note.** The plan was to stop at the second failure. It did not work as built: the watcher ran inside the sandbox, which cannot signal other processes, and the driver's integer test misread colour-coded output. I stopped the run by hand about 20 s into rep 3.

## What the 2.6.2 doc sync fixed (2 reps = 6 sessions; n is small, so this is an indication)

| drift source | 2.5.6 (v1, 9 sessions) | 2.6.2 first fix (3 sessions) | 2.6.2 at `6a2d409` (6 sessions) |
|---|---|---|---|
| ADR Status / Build deviation says "not built" | in 2 of 6 failures; check finds stale ADRs in 8 of 9 | 1 session | 0 (check clean in all 6) |
| ARCHITECTURE / LLD data shape or layout | 4 sessions | 0 | 0 |
| Root README wrong against the code | 1 session (r1-s3) | 2 sessions | 2 sessions |
| Drift verdict fail | 6 of 9 | 2 of 3 | 2 of 6 |

## What is left: root README examples and error-table meanings

- Both failures are fine-grained statements in the project README: what an error code means on a given method, and the numbers in a worked example.
- Task agents write the README as a phase deliverable. Doc sync is told to compare it with the code, and it caught the coarse cases ("not exported yet"). It still misses per-method meanings and example values.
- The drift judge holds every document to "no statement contradicts the code". Nothing in Keel's records was stale in either failure.

## Options (not built, no spend)

1. **Make README examples checkable.** The phase scripts' README task writes examples as runnable snippets with their expected output (for example a `node --test` doc test or `examples/*.mjs` run by Verify). Then a wrong example fails a test instead of waiting for a judge. This is a phase-template change (generation), with no per-session cost.
2. **A doc-sync README pass only when the README changed in the diff:** re-derive each error-table row and example value from the code. This costs model time on every such sync.
3. **Ship 2.6.2 as it is.** It removes the ADR and design-doc drift it was built for, and states that README accuracy is not covered. The pass rule as set is not met, so this needs the founder's call.
