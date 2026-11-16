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

**Spend:** USD 5.242 recorded. Rep 2 session 1 was stopped mid-run: its cost was charged but not recorded (no transcript). That leaves at most about USD 9.7 of the 15 cap, minus that unrecorded part.

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
