# Keel evaluation v0: baseline

Run 16 Nov 2026. 3 tasks x 3 conditions x 3 reps = 27 runs. Keel 2.5.6 fixtures (prototype tier). Claude Code 2.1.325.
Tested model `claude-sonnet-5-5`, judge `claude-opus-5-5`. Spend USD 7.48 (agent 4.72, judge 2.76). Records: `baseline/summary.json`, `baseline/summary.md`; tokens per run in `token-usage.md`.

## Headline

**The tasks hit a ceiling. Hidden tests pass 100% in every condition, so on v0 tests alone cannot separate the conditions.** Ledger is 17/17 in all 9 runs with no docs, minimal docs or Keel docs, which confirms the pilot. Shortlinks (6/6) and booking (7/7) are at the ceiling too.
What does differ is cost: the Keel condition costs about 2.4x as much per run, takes about 2x as many turns and about 2x the wall time, with no measured gain in quality.

## Results per condition (all tasks)

| condition | success | tests | mean agent $ | median agent $ | mean output tok | mean turns | mean wall s |
|---|---|---|---|---|---|---|---|
| none | 9/9 | 100% | 0.122 | 0.121 | 6,223 | 3.9 | 40 |
| min | 8/9 | 100% | 0.115 | 0.118 | 5,727 | 3.2 | 36 |
| keel | 9/9 | 100% | 0.287 | 0.225 | 12,238 | 6.7 | 81 |

The one failure (shortlinks-min-r1) was judge only: a concurrency race in the rate limiter. The check comes before an awaited body read, so parallel POSTs from one IP can get past the limit. A second judge call gave the same verdict and reason. A single failure in 9 runs is not evidence against the minimal docs.

## Per task and condition (medians, n=3)

| task / cond | success | tests | agent $ | judge $ | turns | wall s | output tok | cache read | doc reads (main) |
|---|---|---|---|---|---|---|---|---|---|
| ledger / none | 3/3 | 17/17 x3 | 0.128 | 0.092 | 6 | 45 | 6,334 | 101,975 | 0 |
| ledger / min | 3/3 | 17/17 x3 | 0.105 | 0.095 | 2 | 33 | 5,204 | 29,952 | 0 |
| ledger / keel | 3/3 | 17/17 x3 | 0.535 | 0.126 | 10 | 146 | 21,852 | 564,653 | 3 |
| shortlinks / none | 3/3 | 6/6 x3 | 0.110 | 0.093 | 2 | 37 | 5,786 | 29,474 | 0 |
| shortlinks / min | 2/3 | 6/6 x3 | 0.123 | 0.106 | 2 | 41 | 6,538 | 29,959 | 0 |
| shortlinks / keel | 3/3 | 6/6 x3 | 0.161 | 0.103 | 3 | 41 | 6,908 | 59,897 | 1 |
| booking / none | 3/3 | 7/7 x3 | 0.128 | 0.098 | 5 | 39 | 6,131 | 102,639 | 0 |
| booking / min | 3/3 | 7/7 x3 | 0.118 | 0.091 | 6 | 34 | 5,387 | 106,086 | 0 |
| booking / keel | 3/3 | 7/7 x3 | 0.225 | 0.116 | 7 | 63 | 10,250 | 201,810 | 1 |

The judge failed the non-MUST `clarity` item in 6 of 27 runs, spread across all conditions (none 1, min 2, keel 3). No pattern.

## Where the Keel extra cost comes from

- **The doc-sync step.** Keel's AGENTS.md has the agent hand doc upkeep to a `doc-sync` subagent before it finishes. 3 of the 9 Keel runs did this (ledger r1 and r2, booking r3). Those runs averaged **$0.49 and 140 s**. The other 6 Keel runs averaged **$0.19 and 52 s**, against $0.12 and 38 s for none/min. Doc-sync alone accounts for most of the gap, and its work is upkeep of the execution documents (IMPLEMENTATION_PLAN, AGENTS.md), not product code.
- **The rest of the gap** (about +$0.07 a run) is reading the docs, a larger prompt-cache footprint (AGENTS.md is 7 to 7.8 KB, loaded into every turn through CLAUDE.md), and Verify-stage evidence files (`.keel/evidence/`).

## Which docs the agents opened

AGENTS.md and CLAUDE.md are loaded automatically, so they are not counted. Counted: explicit Read calls plus doc paths named in Bash commands (agents mostly read with `sed`/`grep`); subagent reads are counted separately.

| task | main agent opened (over 3 runs) | doc-sync subagent |
|---|---|---|
| ledger | ARCHITECTURE x3, BRD x3, adr/README x3, IMPLEMENTATION_PLAN x1 | 2 runs: AGENTS, IMPLEMENTATION_PLAN, adr/README, ADR-004, ADR-005 |
| shortlinks | PRD x3 | none |
| booking | ARCHITECTURE x2, COMMANDS x1 | 1 run: 4 files |

IMPLEMENTATION_PLAN (about 10 KB, execution tier) was opened by the building agent in 1 of 9 runs. COMMANDS was opened once. The record documents read for the build were PRD, BRD, ARCHITECTURE and the ADR index: the spec content.

## Recommendations (execution tier only)

Under the founder rule, these cover execution-tier documents only. No record document gets shorter, and no document type is dropped.

1. **Make the doc-sync hand-off in AGENTS.md proportional for prototype-tier work**: for example, sync inline when the change touches only the plan's status lines, and delegate only when record documents change. It is the largest measured cost (+$0.30 and +90 s per run when it fires) and showed no gain in code quality at this scale. What doc-sync produces (documents kept current for the next session) is not graded by v0, so its value is unmeasured, not zero.
2. **Shorten AGENTS.md for prototype tier.** It is loaded into every turn (7 to 7.8 KB). Moving procedure detail (Verify stage, evidence ladder, delegation) behind links to on-demand files would cut cache-read volume without losing any rule.
3. **IMPLEMENTATION_PLAN can be slimmer for a single-phase prototype.** It was rarely opened (1 in 9). Its surrounding prose could move behind the plan index; each phase's scope and done contract stay word for word (doc-tiers rule).

These are candidates to re-measure, not proven gains: v0 cannot show whether the same docs help on harder work.

## Limits

- 3 small tasks, n=3 per cell, one agent model (`claude-sonnet-5-5`), one judge (`claude-opus-5-5`).
- **Ceiling:** every run passed every hidden test, so quality differences cannot show here. Separating the conditions needs harder tasks or tasks that need the docs' decisions (to be agreed with Keel; none added).
- Fixtures were generated once at prototype tier; a fuller tier was not measured.
- The judge sees source only, not docs; `clarity` verdicts vary between calls.
- Single-session tasks only. What the docs are for (decisions carried across sessions, drift, upkeep) is not exercised: no run starts from earlier work, and no grader checks the docs.
- The pilot and its generation spend from the earlier temp are lost (see `token-usage.md`).

## Harness fixes made during this run

- A run that waits on a background subagent emits one `result` event per resumed segment; the old record took turns and tokens from the last segment only (the pilot's keel run showed 2 turns and 900 output tokens instead of 11 and 21,993). Tokens now come from cumulative `modelUsage`, turns are summed, wall time is recorded, and `--rescore` recomputes a summary from saved transcripts.
- Doc reads now include Bash reads and split main agent from subagents.
- Each row now keeps the judge's reason for every failed item (added after the baseline began, so it is missing from baseline rows; the one MUST failure was re-judged by hand).
