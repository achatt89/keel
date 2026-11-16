# Keel evaluation v1: harder tasks

Run 16 Nov 2026. Keel 2.5.6 fixtures (MVP tier, generated from tag `keel--v2.5.6`). Claude Code 2.1.325.
Tested model `claude-sonnet-5-5`, judge `claude-opus-5-5` (rubric and drift). Full run: USD 23.41 (agent 17.23, judge 6.18); v1 in total USD 33.76 of the USD 60 approved.
Records: `v1-full/summary.json`, `v1-full/summary.md`; tokens per run in `token-usage.md` (v1 section). Raw logs: `~/HarnessAgents/eval-raw/keel-eval-v1/full/`.

**Design.**
- **A (follow-up feature):** invoices and quotas. Each starts from a small working codebase; the prompt is a short request. Hidden tests check 9 to 11 decisions that only the founder answers (and so the Keel docs) hold. 2 tasks x 4 conditions x 3 reps = 24 runs.
- **B (multi-session):** inventory, three phases. Session 1 gets the full three-phase spec plus "build phase 1 only; later sessions will not see this message". Sessions 2 and 3 get only "Do the next phase." Each session is a fresh `claude -p` in the same folder. 3 reps x 3 sessions per condition.
- **Conditions:** `none` (empty), `min` (6-line AGENTS.md), `answers` (min + raw `founder-answers.md`), `keel` (full Keel set). Added during this run, for B only: `spec` (answers + the founder's own written spec, `idea.md`). Why it was added is under B.

## Headline

1. **On these follow-up features (A), having the founder's answers in the repo is what counted; Keel's structure added nothing measurable on top.** `answers` and `keel` both pass 100% of hidden and decision tests (6/6 runs each). `none` and `min` fail every run and pass only 11 to 27% of decision tests. Keel costs 1.7x (invoices) to 4.5x (quotas) as much as `answers` for the same result.
2. **On this multi-session task (B), what counted was having the spec written in the repo.** `keel` and `spec` both pass every phase in every session (9/9 sessions each), with no regressions. `none`, `min` and `answers` pass phase 1 and then fail phases 2 and 3 in every rep, because the phase 2 and 3 spec existed only in session 1's prompt and none of those agents wrote it down.
3. **Keel's B cost is about 12x `spec`'s for the same test result:** USD 3.70 per 3-session run (agent) plus USD 1.29 of drift judging, against USD 0.31 for `spec`. Wall time per session about 240 s against about 28 s. The cost comes from Keel's generated phase workflow (multi-agent, with doc-sync), which every `keel` session ran.
4. **Doc drift: 6 of 9 `keel` sessions fail the drift check**, always on one item (`no-contradiction`). Plan status and changelog stay correct in 9/9. The stale statements are in ADR Status cells and Build-deviation rows (doc-sync wrote "Phase 2–3 methods not built" in session 1 and did not update it when later sessions built them) and in ARCHITECTURE/LLD (a data shape and file layout the code did not follow), which doc-sync did not reconcile.
5. **The 2.5.6 MVP fixtures do not hold the full document set.** HLD, DEPLOYMENT and DESIGN are missing in all three; RUNBOOK, THREAT_MODEL and COMPLIANCE are missing in two of three. Keel 2.5.6 omitted them "with triggers" (for example "HLD: one module, folded into ARCHITECTURE"). This conflicted with the founder rule that Keel always generates the full set. **Fixed in Keel 2.6.1** (shipped 16 Nov): every document type is now present in every project, as a short stub where it does not apply yet; these results are for the 2.5.6 sets.

## A: follow-up features (n = 3 per cell)

| task / condition | success | hidden tests | decision tests | agent $ / run | judge $ / run | turns | wall s | doc reads |
|---|---|---|---|---|---|---|---|---|
| invoices / none | 0/3 | 14/39 | 8/33 | 0.089 | 0.094 | 5.0 | 23 | 0.0 |
| invoices / min | 0/3 | 15/39 | 9/33 | 0.099 | 0.096 | 5.3 | 26 | 0.0 |
| invoices / answers | 3/3 | 39/39 | 33/33 | 0.118 | 0.102 | 7.0 | 30 | 1.0 |
| invoices / keel | 3/3 | 39/39 | 33/33 | 0.197 | 0.100 | 7.3 | 45 | 3.7 |
| quotas / none | 0/3 | 9/33 | 3/27 | 0.105 | 0.086 | 5.7 | 28 | 0.0 |
| quotas / min | 0/3 | 9/33 | 3/27 | 0.087 | 0.086 | 5.0 | 23 | 0.0 |
| quotas / answers | 3/3 | 33/33 | 27/27 | 0.093 | 0.094 | 4.0 | 22 | 1.0 |
| quotas / keel | 3/3 | 33/33 | 27/27 | 0.423 | 0.113 | 10.3 | 96 | 4.0 |

**Having the answers vs Keel structure.** The difference between `min` and `answers` is the whole effect: 0/6 to 6/6. Keel adds no measured quality on top of `answers` and costs more (invoices 1.7x, quotas 4.5x agent cost; in quotas/keel r1 a subagent opened 5 docs). The judge passed every run; its one non-MUST item, `errors`, failed in all 24 runs and all conditions (for example `exportCsv(null)` throws a TypeError, not the domain error), so it does not separate conditions.

## B: multi-session (inventory, n = 3 reps per condition)

Phase pass counts after each session (all 3 reps identical within each condition):

| condition | after s1 (P1) | after s2 (P1, P2) | after s3 (P1, P2, P3) | sessions passing | regressions | drift (keel only) |
|---|---|---|---|---|---|---|
| none | 5/5 | 5/5, 0/6 | 5/5, 0/6, 0/4 | 3/9 | 0 | - |
| min | 5/5 | 5/5, 0/6 | 5/5, 0/6, 0/4 | 3/9 | 0 | - |
| answers | 5/5 | 5/5, 0/6 | 5/5, 0/6, 0/4 | 3/9 | 0 | - |
| spec | 5/5 | 5/5, 6/6 | 5/5, 6/6, 4/4 | 9/9 | 0 | - |
| keel | 5/5 | 5/5, 6/6 | 5/5, 6/6, 4/4 | 9/9 | 0 | 3 pass / 6 fail |

Cost per session (mean):

| condition | agent $ s1 / s2 / s3 | turns s1 / s2 / s3 | wall s s1 / s2 / s3 | per 3-session run, agent $ | drift judge $ per run |
|---|---|---|---|---|---|
| none | 0.077 / 0.072 / 0.053 | 4.0 / 5.0 / 4.0 | 21 / 21 / 19 | 0.20 | - |
| min | 0.073 / 0.045 / 0.043 | 3.0 / 3.0 / 4.0 | 19 / 13 / 17 | 0.16 | - |
| answers | 0.081 / 0.045 / 0.025 | 3.0 / 3.3 / 3.0 | 21 / 10 / 10 | 0.15 | - |
| spec | 0.089 / 0.113 / 0.111 | 3.3 / 4.0 / 5.7 | 22 / 31 / 31 | 0.31 | - |
| keel | 1.305 / 1.294 / 1.104 | 6.7 / 6.0 / 9.3 | 260 / 248 / 218 | 3.70 | 1.29 |

**What the failing conditions did** (final messages read for rep 1 only). In session 2, `none` and `min` invented a "phase 2" (reservations, from a README line) with their own API, which fails the hidden tests. `answers` stopped and said the spec was missing: `founder-answers.md` refers to "the full specification above", which is not in the repo. Nobody regressed phase 1: all regressions are 0.

**Why `spec` was added.** Without it, B could not separate "Keel's structure" from "the founder's spec is in the repo": the Keel fixture holds the spec by construction, and `answers` does not. `spec` adds only the founder's own `idea.md` (the spec without the session-1 line). It cost USD 0.94 for 9 sessions. With it, on this task, the written spec carried the continuity; Keel's structure added no measured test gain, at about 12x the cost.

**Drift outcome (`keel`, 9 sessions).** `plan-status` 9/9 pass, `changelog` 9/9 pass, `no-contradiction` 3/9 pass.
- r1 (s2, s3 fail): ADR-002, ADR-003 and ADR-005 still say order methods are "not built" after the code builds them (in their Status cells and Build-deviation rows); docs/README says no build evidence exists. Doc-sync wrote those cells in session 1 and did not revisit them in sessions 2 and 3. Keel's rule against rewriting ADR files covers their decision text, not the Status cell, which doc-sync owns.
- r2 (s1, s2, s3 fail): LLD §8 and ARCHITECTURE §2 describe a store shape (`{ sku, name, onHand, reorderPoint }`) and an export layout the code did not follow from session 1 on; doc-sync never reconciled them.
- r3 (s3 fails): the same ARCHITECTURE §2 store shape and validator list.
- In 8 of 9 sessions the agent ran the generated phase workflow (`Skill` + `Workflow`); in r3-s3 it worked directly (19 Bash calls and one subagent).

## Costs

| item | USD |
|---|---|
| Full run, agent | 17.226 |
| Full run, judge (rubric on A, drift on B/keel) | 6.179 |
| Full run total (incl. 9 `spec` sessions, 0.94) | 23.405 |
| Earlier v1 spend (judge self-tests, fixtures, pilot) | 10.359 |
| **v1 total** | **33.764** of 60 |

Per condition, agent only, full run: none 1.19, min 1.04, answers 1.09, spec 0.94 (B only), keel 12.97. Keel's drift judging adds 3.87. Exact input / output / cache tokens per run and per group: `token-usage.md`, "Full run (v1)".

## Recommendations (execution tier only)

- Keep the founder's decisions and the full phase spec in the repo where a fresh session reads them first. That is what moved every result here.
- The generated per-phase workflow is the main cost (about 12x a plain session on B, with no test gain on these tasks). Worth testing a lighter default execution path, with the workflow kept for larger phases.
- Doc-sync should check that status statements across all docs (including ADR status lines and ARCHITECTURE/LLD data shapes) match the code after each phase; today it keeps the plan and changelog right but not those.
- No recommendation here touches record-tier documents or document types. The missing HLD/DEPLOYMENT/RUNBOOK finding points the other way: the full set was not generated.

## Limits

- **Small n:** 3 reps per cell. A and B gave all-or-nothing results per cell, so the direction is clear, but rates are not precise.
- **One tested model** (`claude-sonnet-5-5`) and one judge (`claude-opus-5-5`); one Claude Code version (2.1.325).
- **Small tasks.** A codebases are 300 to 600 lines; B is one library. The tests check stated decisions and continuity, not design quality over time, so what record documents carry for a later human reader is not measured.
- **Tiers:** v0 used prototype-tier fixtures, v1 MVP tier. Not compared directly.
- **Keel version:** fixtures from 2.5.6. Keel 2.6.0 (shipped the same day) cut the always-loaded instructions by about a third and made doc sync proportional; its regression run (`regression-2.6.0.md`) covered single-session tasks only, so v1's multi-session cost and drift are not yet measured on 2.6.x.
- **Not measured:** whether the record documents help a later human reader or a larger codebase; these tasks reward stated decisions and continuity only.
- **Fixtures incomplete:** the 2.5.6 MVP fixtures lack HLD, DEPLOYMENT, DESIGN (all three) and RUNBOOK, THREAT_MODEL, COMPLIANCE (two of three). Results are for those generated sets. Keel 2.6.1 now writes every type (a stub where it does not apply); on these single-library tasks the missing types would mostly be stubs, which agents do not load, so the results are not expected to change, but that is not measured.
- **`spec` was added mid-run** (after the main batch, same harness, same cap) and run on B only; A did not need it, since `answers` already held every decision.
- **Drift judge** is one model's reading of docs vs code; the self-test proves it separates a clean from a drifted fixture, not that every flagged sentence matters.
- **Rubric item `errors`** failed in every A run; it is not MUST, so it does not change verdicts, but it means the rubric judge did not separate A conditions either.

## Harness changes in this run

- `run.mjs`: new condition `spec` (answers + `idea.md`, with one AGENTS.md line pointing at it); `idea.md` counts as a doc read.
- Worktree checkout: the sandbox blocks writing `.claude/agents/*.md`, so the fixtures' `doc-sync.md` files had to be restored outside the sandbox (`git checkout`) before the run. Check `git status` after creating a worktree for these fixtures.
