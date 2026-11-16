# 2.6.4 BRD sources and merge status: eval v2 (17 Nov 2026)

**Budget:** eval v2 line, USD 25, founder-approved 16 Nov (god conv-c64848, conv-c4c9cf). **Pass rule:** drift fails in at most 1 of 9 sessions. **Result: not met. Drift failed in 4 of 9 sessions.** All code tests passed in all 9 (5/5, 11/11, 15/15 per rep).

**What 2.6.4 was for, and whether it held:** no session had a BRD, risk-register or ADR contradiction (0 of 9). In 2.6.3 (n=1) the BRD caused all 3 failures. The merge-status fix also held: every session 2 and 3 started its phase without stalling, and no status line lagged.

## Attempt 1 (paused, kept for the record)

Fixture `evals/tasks/inventory/keel-2.6.4-a1`. Rep 1 only:
- **s1:** 5/5 tests, drift fail: `docs/README.md` said "no phase built yet".
- **s2, s3:** stopped in 1–2 turns to ask whether to close Phase 1 first. Phase 1 had merged at 3/5 gates, because Verify checks the "doc-sync commit present" gate before doc sync runs, and one gate needed a Node 20 run this machine cannot do. The generated AGENTS.md also said to stop before starting a phase while the previous one was unfinished.

I paused the run, and Keel fixed it in commit `18f17b3`: the Merge stage ticks the doc-sync gate and defers open gates, gates must be checkable here, and `status-lag` covers README status lines. Attempt 1 cost USD 3.341 recorded, plus a rep-2 session killed at start (estimated under 0.05).

## Attempt 2 (fixed 2.6.4, fixture regenerated)

| session | tests | drift | what the drift judge found | agent $ | judge $ |
|---|---|---|---|---|---|
| r1-s1 | 5/5 | fail | a plan deferred item says the README lacks an example it has; NFR-MNT-001/002 say the test checks more than it does | 1.74 | 0.36 |
| r1-s2 | 11/11 | pass | | 1.51 | 0.44 |
| r1-s3 | 15/15 | pass | | 1.68 | 0.54 |
| r2-s1 | 5/5 | pass | | 1.41 | 0.33 |
| r2-s2 | 11/11 | pass | | 1.91 | 0.44 |
| r2-s3 | 15/15 | fail | AGENTS.md invariant 5 says "uncovered" though tests cover it; docs/README.md calls ADR-006 "reserved" though it is built | 1.94 | 0.54 |
| r3-s1 | 5/5 | fail | AGENTS.md invariants table says rules 1 and 3 are "Not built yet: Phase 1" though both test files exist | 1.18 | 0.33 |
| r3-s2 | 11/11 | pass | | 1.76 | 0.46 |
| r3-s3 | 15/15 | fail | docs/README.md calls ADR-006 "reserved" and lists ADRs 001–005 only; plan Phase 1 deliverables left unticked though the files exist | 1.71 | 0.55 |

**Spend.** Attempt 2: USD 19.873 (generation 1.044 + agent 14.842 + judge 3.987). Eval v2 total: **USD 23.214 recorded** + ≤0.05 estimated, of 25. Agent `claude-sonnet-5-5`, judge `claude-opus-5-5`. Tokens are in `token-usage.md`.

## What this shows (n=9, one task, one model)

1. **The BRD rule did its job here.** Generation wrote each assumption with a source and sent code detail to ADRs; A-06 now says "no trimming", matching the code. No BRD contradiction in 9 sessions.
2. **Drift moved to execution-tier and index text** that doc sync does not reconcile line by line:
   - the AGENTS.md invariants table ("Enforced by / Gap" cells): 2 sessions;
   - the `docs/README.md` ADR index and status: 2 sessions;
   - plan detail (deferred-item text, unticked deliverables): 2 sessions;
   - an NFR stating what a test checks: 1 session.
3. **Against earlier runs** (different fixtures, so not like for like): 2.5.6 failed 6 of 9 (ADRs and design docs), 2.6.2 2 of 6 (README), 2.6.3 3 of 3 (BRD), 2.6.4 4 of 9 (keystone, index, plan detail).
4. **`.keel/check.mjs` caught none of the 4 failures.** It flagged two other real slips: a passed gate citing a test file that does not exist.

## Candidates (not built, no spend)

Each is deterministic and execution-tier only:
- `adr-status-stale` also scans AGENTS.md / CLAUDE.md table rows: "not built (yet): Phase N" or "uncovered" next to a phase the plan shows built. Catches r3-s1.
- A `docs/README.md` row that calls an ADR "reserved" or "proposed" while the ADR file says Accepted or Built. Catches r2-s3 and r3-s3.
- In a phase marked ✅ or merged, a `- [ ]` deliverable whose path exists. Catches r3-s3's second item.
- Doc sync Step 7 also re-reads the AGENTS.md invariants table and the plan's open Deferred items rows against the code.

## Also fixed after the run (no re-measurement)

`check.mjs` reported `phase-gates-open` for a phase merged with deferred gates, which the 2.6.4 Merge stage now produces on purpose. It now accepts a phase whose status says its gates are deferred. Self-test plus mutant.
