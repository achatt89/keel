# Keel 2.6.0 regression run (16 Nov 2026)

**Verdict: PASS.** With the 2.6.0 documents, the agent succeeded in 9 of 9 runs, the same as v0 (Keel 2.5.6). Keel runs cost 14% less, and the always-loaded instructions are about 33% smaller.

**Setup**
- **Same harness as v0** (`v0-baseline.md`): 3 tasks × 3 conditions (`none`, `min`, `keel`) × 3 reps.
- **Models:** agent `claude-sonnet-5-5`, judge `claude-opus-5-5`.
- **Only change:** the `keel` fixtures, regenerated with `release/keel-2.6.0` at `b01038d` (prototype tier, same founder answers). The 2.5.6 sets are kept in `tasks/<id>/keel-2.5.6/`.
- **Records:** raw logs in `~/HarnessAgents/eval-raw/keel-regression-260/`; summary in `regression-260/summary.{json,md}`; tokens in `token-usage.md`.

## Success, cost, turns, wall time (mean per run)

| task / condition | v0 success | 2.6.0 success | v0 $ | 2.6.0 $ | v0 turns | 2.6.0 turns | v0 wall s | 2.6.0 wall s |
|---|---|---|---|---|---|---|---|---|
| ledger / none | 3/3 | 3/3 | 0.130 | 0.112 | 5.0 | 4.0 | 45 | 39 |
| ledger / min | 3/3 | 3/3 | 0.108 | 0.113 | 2.3 | 4.3 | 34 | 38 |
| **ledger / keel** | 3/3 | **3/3** | 0.443 | **0.353** | 11.0 | 10.3 | 134 | 114 |
| shortlinks / none | 3/3 | 1/3 | 0.113 | 0.113 | 2.0 | 2.0 | 38 | 38 |
| shortlinks / min | 2/3 | 3/3 | 0.123 | 0.116 | 2.0 | 2.0 | 41 | 38 |
| **shortlinks / keel** | 3/3 | **3/3** | 0.161 | **0.183** | 3.3 | 4.0 | 41 | 47 |
| booking / none | 3/3 | 3/3 | 0.123 | 0.108 | 4.7 | 2.3 | 38 | 34 |
| booking / min | 3/3 | 2/3 | 0.114 | 0.105 | 5.3 | 3.0 | 32 | 30 |
| **booking / keel** | 3/3 | **3/3** | 0.258 | **0.207** | 5.7 | 6.3 | 70 | 58 |

- **Keel condition:** 9/9 in both versions. Mean agent cost per run fell from 0.287 to 0.248.
- **Failures:** all 27 runs passed every hidden test. The three failures are judge failures in conditions that have no Keel documents:
  - `shortlinks-none-r2` and `shortlinks-none-r3`: the per-IP rate limit can be bypassed by simultaneous POSTs (the same race as v0's `shortlinks-min-r1`);
  - `booking-min-r2`: minute 60 is accepted.

  These conditions did not change between versions, so these failures are run-to-run noise. They are not caused by Keel.

## Always-loaded instructions (AGENTS.md + CLAUDE.md of each fixture)

| fixture | 2.5.6 bytes | 2.6.0 bytes |
|---|---|---|
| ledger | 8,842 | 5,669 |
| shortlinks | 8,178 | 5,788 |
| booking | 8,558 | 5,669 |

`measure.mjs fresh` on the 2.6.0 templates: 8,715 B, against 16,109 B on 2.5.6. The fixtures are smaller than the template because prototype projects leave out sections that do not apply.

## Doc sync and review subagents

| | v0 (2.5.6) | 2.6.0 |
|---|---|---|
| Runs that updated docs | 3/9 | 2/9 (ledger r1, r2) |
| Doc sync handed to the doc-sync subagent | 3/9 | 0/9 |
| Record documents changed | 2 runs (ledger r1, r2 filled the reserved ADR-004 and ADR-005) | none |
| Security or design subagent called | 0/9 | 0/9 |

- **Triage:** in both 2.6.0 runs that synced, only the plan, CHANGELOG and AGENTS.md status changed, and the agent synced inline. ledger-r1's stated reason was "status lines only, so inline per AGENTS". This is the proportional doc-sync rule working as written.
- **Not measured:** these fixtures had no reserved ADR stubs and no 2.6.0 run changed a record document. So this run does not show whether doc sync is still handed to the subagent when a record document changes. The risk from C2 and C6 (under-delegation) remains unmeasured. Eval v1's multi-session task is the place to measure it.
- **Security and design:** v0 never called these subagents either. These tasks have no security or UI review trigger, so there is nothing to compare.

## Fixture review (2.6.0 generation)

- **Same document files as 2.5.6, apart from model choice:**
  - ledger no longer has README.md;
  - booking gained PRD and lost COMMANDS;
  - shortlinks is unchanged.

  The prototype-tier selection is made per run. See the 2.6.1 scope: every type, with a stub where it does not apply.
- **`node .keel/check.mjs`:** clean on all three.
- **`.claude/hooks/keel-gates.mjs`:** present in all three.
- **New ADRs:** carry the `id` / `status` / `paths` header.
- **Area rules (`.claude/rules/`):** present for shortlinks (1 file) and booking (2 files). **Missing for ledger**, although its three ADR headers name paths. This is a generation miss; 2.6.1 adds a `/keel check` finding for it.
- **No `{{`** outside the scripts.
- **`[NEEDS DECISION]`:** only booking's two open-decision rows (OD-01, OD-02). They are questions the founder answers do not cover, and the same as 2.5.6.
- **Generation cost:** USD 2.425 for 3 fixtures (0.786, 0.756, 0.883).

## D1 live checks (slim skill)

These ran with `claude -p --plugin-dir plugins/keel` on a git copy of the 2.6.0 ledger fixture.

| check | result | mode file read | $ |
|---|---|---|---|
| `/keel version` | Usual report: skill version, docs version and format, budgets per doc. It shows v2.5.6 because `b01038d` precedes the 2.6.0 stamp. | `modes/version.md` only | 0.209 |
| `/keel check` | Ran `node .keel/check.mjs` first; clean | `modes/check.md` only | 0.184 |
| `/keel change fix-rounding-note` | Created branch `chg/fix-rounding-note`, the CHG-001 Changes row (on-branch) and the CHANGELOG `[Unreleased]` line. It then stopped to ask what the change is for. | `modes/change.md` only | 0.213 |

Each mode loaded only its own mode file, not the 100 KB skill.

**Generations:** all three read `SKILL.md` (the router) and then `modes/generation.md`, so a prototype generation with the slim skill works. Only shortlinks also read `document-catalog.md` and `conventions.md` (Read or Bash calls in `gen-*/transcript.jsonl`). ledger and booking picked the document set without opening the catalog that step 3 says to consult. That probably explains why the set differs between runs. 2.6.1's fixed list of types, with stubs, removes the dependence on that read.

## Spend

| item | $ |
|---|---|
| Fixture generation | 2.425 |
| Runs (agent 4.228 + judge 2.830) | 7.058 |
| D1 checks | 0.606 |
| **Recorded** | **10.089** of USD 25 |

One killed attempt is not in this total: the first try of ledger-keel-r3, stopped when the temp hit its token cap. Its transcript was not saved.

## Limits

- **Ceiling:** v0's ceiling still applies. Every condition passes the hidden tests, so this checks for no regression; it does not prove a gain.
- **Sample size:** 3 reps per cell. Cost differences of a few cents are within noise.
- **Doc sync:** handing doc sync to the subagent for record-document changes is not exercised by these tasks.
