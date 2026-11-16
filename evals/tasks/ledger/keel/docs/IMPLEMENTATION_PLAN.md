# ledger — Implementation Plan

**Version:** 0.1 · **Status:** docs only; no code yet · **References:** `BRD.md`, `ARCHITECTURE.md`, `adr/README.md`

## How to read this plan

Three phases ordered by one rule: **exact-money and validation primitives are built and tested before any command uses them.** Each phase lists scope (with spec refs), deliverables and an exit-gate table; a phase is open until its gates are green. Phases 0–2 deliver the whole of v1 (launch = Phase 2 closed; there is no deploy).

Two units of work (conventions): a **Phase** is a gated milestone with a block, a script and an evidence file; a **Change** (`CHG-xxx`) is hotfix-weight work with a row in the Changes table and a CHANGELOG line, no phase block.

### Phase status

> Updated by doc-sync (state-neutral). Markers: ⬜ not started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state ladder `on-branch` → `merged` → `deployed vNN` → `live-verified`; this project has no deploy, so the ceiling is `merged`.

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 0 — Foundations | ⬜ | — | money/names/store/dispatch unit-tested; exit codes only 0 or 2 | — | — |
| 1 — Expense commands | ⬜ | — | add/list/remove round-trip green; ids never reused | — | — |
| 2 — Balances, settle & README | ⬜ | — | balances sum to 0; settle zeroes all balances; README verified | — | — |

### Standing rules (every phase, every commit)

- **Workflow-first, branch-per-phase.** Run each phase via its script: `claude --workflow .claude/workflows/phase-N-<slug>.js`. The script creates `phase-N-<slug>` off `main`, fans tasks out as parallel agents in separate `git worktree`s, merges task branches back into the phase branch, runs Verify, then doc-sync, then merges to `main`. No direct commits to `main`; no task branch merges to `main`. A Change (`CHG-xxx`) uses `chg/<slug>` off `main`.
- **Goal-directed, self-contained tasks.** Every worktree agent opens with `/goal` (code done, tests pass, `node --test` green, `verify` exercised the real CLI). Exit strategy `[ASSUMPTION]` (BRD A-04): **bounded retries (N=3), then `/goal clear` + commit + a deferred-items row for human review.**
- **Tests ship with the code** (`node --test`, `node:test` + `node:assert/strict`, no dependencies). Pure logic → unit tests; command behaviour → spawn-based tests of `node src/cli.js` against a temp `LEDGER_FILE`. Never touch the real `./ledger.json` in tests.
- **Doc sync is mandatory before merge** — `.claude/workflows/doc-sync.js` (AGENTS.md status, this file's tables, `docs/adr/`, CHANGELOG `[Unreleased]`, byte budgets). A merge without the doc-sync commit is incomplete.
- **Decisions captured without fail** — any decision becomes `docs/adr/ADR-xxx-<slug>.md` before merge (ID reserved at scope or taken at Integrate). Deferred items state why and when to revisit. Negative results are recorded.
- **Definition of done per PR:** `node --test` green, no new dependency in `package.json` (none exists), every new `error:` path has a test asserting stderr prefix + exit 2 + empty stdout, doc-sync commit present.
- **Claims carry evidence.** `✅` needs a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Verify writes `.keel/evidence/phase-N.json`. For this project the realistic ceiling is `integration` (spawned CLI against a temp file).

---

## Phase 0 — Foundations

**Goal:** the pure core exists and cannot produce a non-integer-cent amount or an exit code other than 0 or 2.

**Scope** (`ARCHITECTURE.md` §4.1–4.5; BRD MNY-001..003, VAL-001..004, DAT-001..004; ADR-001, ADR-002):
- `src/money.js` — parse/format/split in integer cents.
- `src/names.js`, `src/errors.js` — validation and `UsageError`.
- `src/store.js` — `LEDGER_FILE`, load/save, persisted `nextId`, atomic write.
- `src/cli.js` — dispatch skeleton + single error handler (unknown/missing command → exit 2).

**Deliverables:**
- [ ] the four modules above
- [ ] tests: `tests/money.test.js`, `tests/names.test.js`, `tests/store.test.js`, `tests/cli-smoke.test.js`

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `splitCents` shares always sum to the total for a range of totals × participant counts; leftover cents go to alphabetical-first names | `unit` | — | — | ⬜ |
| `parseAmount` accepts `12.5`/`12.50`/`0.01`; rejects `0`, `-1`, `.5`, `1.`, `1.234`, `1e3`, `1,000`, `abc`, over-bound | `unit` | — | — | ⬜ |
| Name rule: accepts `a`, 20 letters; rejects empty, 21 letters, uppercase, digits | `unit` | — | — | ⬜ |
| Store: missing file = empty ledger, file created only on save, atomic write leaves no temp file, malformed file → `UsageError` and file untouched | `unit` | — | — | ⬜ |
| Spawned CLI: no command, unknown command → stderr starts `error:`, stdout empty, exit 2 | `integration` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** MNY-001..003, VAL-001..004, DAT-001..004, QA-002 (part).
**Workflow:** `.claude/workflows/phase-0-foundations.js` · **Evidence:** `.keel/evidence/phase-0.json`
**ADRs reserved at scope:** ADR-004 (argument parsing), ADR-005 (atomic file write)

---

## Phase 1 — Expense commands

**Goal:** `add`, `list` and `remove` work end to end against the JSON file with exact cents and never-reused ids.

**Scope** (BRD ADD-001..004, LST-001..002, REM-001..002; `ARCHITECTURE.md` §4.6):
- `src/commands/add.js` — validate payer/amount/participants/`--note`, split, assign id, persist.
- `src/commands/list.js` — oldest first, exact line format.
- `src/commands/remove.js` — by id; unknown/invalid id is an error.

**Deliverables:**
- [ ] three command modules wired into `cli.js`
- [ ] tests: unit per command + `tests/cli-expenses.test.js` (spawned CLI, temp `LEDGER_FILE`)

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `add alice 12.5 alice,bob --note pizza` prints `1`; `list` prints `1 alice 12.50 alice,bob # pizza` | `integration` | — | — | ⬜ |
| Id never reused: add (1), add (2), remove 2, add → prints 3 | `integration` | — | — | ⬜ |
| Every invalid-input case (bad name/amount, missing arg, unknown id, unknown flag, `--note` without value, duplicate participant) → `error:` on stderr, stdout empty, exit 2, file unchanged | `integration` | — | — | ⬜ |
| `list` on a missing ledger prints nothing, exits 0, creates no file | `integration` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** ADD-001..004, LST-001..002, REM-001..002, VAL-002/003, DAT-002/003.
**Workflow:** `.claude/workflows/phase-1-expense-commands.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none expected

---

## Phase 2 — Balances, settle & README

**Goal:** balances reconcile to the cent, `settle` prints the stated greedy transfers, and the README tells a newcomer how to run the tool and the tests. **This is the launch line.**

**Scope** (BRD BAL-001..003, SET-001..003, QA-001; ADR-003; `ARCHITECTURE.md` §4.7–4.8):
- `src/balances.js` + `balances` command.
- `src/settle.js` + `settle` command.
- `README.md` final pass; every documented command executed once.

**Deliverables:**
- [ ] balances and settle modules and commands
- [ ] tests: unit (worked examples, uneven splits, ties) + property test (random ledgers) + spawned-CLI test

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Founder example: balances print `alice: +10.00`, `bob: -10.00`, `carol: 0.00` (sorted, signed, zero unsigned) | `integration` | — | — | ⬜ |
| Property: over random ledgers incl. uneven splits, balances sum to exactly 0 cents (BO-01) | `unit` | — | — | ⬜ |
| Property: applying `settle` transfers zeroes every balance; ≤ n−1 transfers; every amount > 0 (BO-02) | `unit` | — | — | ⬜ |
| Tie-break: equal debts/credits resolve by alphabetical name; settled ledger prints nothing | `unit` | — | — | ⬜ |
| `settle` does not modify the data file (SET-003) | `integration` | — | — | ⬜ |
| README: every command in it was executed and matches; `node --test` instruction works from a fresh clone | `integration` | — | — | ⬜ |
| Whole suite `node --test` green; no `package.json` dependencies | `integration` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** BAL-001..003, SET-001..003, QA-001..002, BO-01, BO-02, BO-03.
**Workflow:** `.claude/workflows/phase-2-balances-settle.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** none expected (ADR-003 already accepted)

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| MNY, VAL, DAT, CON | 0 |
| ADD, LST, REM | 1 |
| BAL, SET, QA-001 | 2 |
| QA-002 | 0–2 (each phase ships its tests) |
| BO-01, BO-02, BO-03 | 2 (gates) |

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| *(none yet — items added by doc-sync workflow as work progresses)* | — | — | — | — | — | — |

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; cites `.keel/evidence/`; auto-archive/split on budget breach. |
| `.claude/workflows/change-template.js` | Hotfix-weight unit run by `/keel change <slug>`. |
| `.claude/workflows/phase-0-foundations.js` | Phase 0: Setup (reserve ADR-004/005) → parallel worktree agents → Integrate → Verify → doc-sync → merge. |
| `.claude/workflows/phase-1-expense-commands.js` | Phase 1: same stages. |
| `.claude/workflows/phase-2-balances-settle.js` | Phase 2: same stages. |

---

*End of IMPLEMENTATION_PLAN.md — ledger*
