# ledger — Implementation Plan

**Version:** 0.1 · **Status:** Phase 0 not started
**References:** [BRD](./BRD.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [ADR index](./adr/README.md)

## How to read this plan

Ordering rule: **guardrails (error contract, test harness, no-dependency check) exist before the logic that flows through them; the pure core exists before the commands that use it.** Each phase lists scope, deliverables and an exit-gate table; a phase is open until its gates pass. Phases 0–2 deliver the whole prototype (no post-launch line: it is run from a clone, no deploy). Two work units exist: a **Phase** (gated, own script and evidence file) and a **Change** (`CHG-xxx`, hotfix-weight, row in Changes).

### Phase status

> Markers: ⬜ not started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state is `on-branch` → `merged` only (no deploy exists; see Standing rules).

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 0 — Guardrails | ⬜ | — | CLI spawns, bad input exits 2 with `error:`, `node --test` runs, no non-`node:` imports | — | — |
| 1 — Pure core | ⬜ | — | Split, balances, settle exact to the cent and match BAL-004 | — | — |
| 2 — Store, commands, README | ⬜ | — | All five commands pass end-to-end; README accurate | — | — |

### Standing rules (every phase, every commit)

- **Branch-per-phase.** Run the phase script (`claude --workflow .claude/workflows/phase-N-<slug>.js`); it creates `phase-N-<slug>` off `main`, fans tasks into worktrees, integrates, verifies, doc-syncs, merges. Hotfix-weight work: `chg/<slug>` via `/keel change`. Never commit to `main` directly.
- **Goal-directed tasks.** Each worktree agent opens with `/goal`. Exit strategy `[ASSUMPTION]`: bounded retries (3 fix-and-retest cycles), then `/goal clear`, commit what works, add a deferred-items row.
- **Tests ship with the code** (`node:test`, `node --test`). A gate counts only if its test was seen failing on broken code (`failSeen`).
- **Doc sync before the completing commit:** inline when only status lines change, else `doc-sync.js` (≤3 rounds).
- **No deploy.** The tool runs from a clone, so there is no DEPLOYMENT.md; `[merged]` is the last deploy state. `prod-live` evidence never applies.
- **Spec is the BRD.** Behaviour questions resolve to a BRD row; new ambiguity becomes an `[ASSUMPTION]` row there plus a test.
- **Dependencies:** none, ever (CON-001). Imports must start with `node:` or be relative.

---

## Phase 0 — Guardrails

**Goal:** the error contract, entry point skeleton and test harness exist before any logic.
**Scope** ([ARCHITECTURE](./ARCHITECTURE.md) §1–3, [ADR-003](./adr/ADR-003-single-error-path-and-exit-codes.md)):
- `src/errors.js` (`CliError` → 2, `DataError` → 1) and `src/cli.js` skeleton: dispatch table, unknown/missing command → `error:` + exit 2, catch-all handler.
- `tests/helpers.js` to spawn `node src/cli.js` with a temp `LEDGER_FILE` and capture code/stdout/stderr.
- `tests/no-deps.test.js`: every `import`/`require` in `src/` is `node:`-prefixed or relative; no `package.json` dependencies.
**Deliverables:** the files above; `node --test` green.
**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| No command and an unknown command print `error:` to stderr, empty stdout, exit 2 | `integration` | — | — | ⬜ |
| `node --test` discovers and runs the suite on Node 20+ | `integration` | — | — | ⬜ |
| No-deps test fails when a non-`node:` import is added (failSeen) | `unit` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** VAL-002, QUA-001, QUA-002. **Workflow:** `.claude/workflows/phase-0-guardrails.js` · **Evidence:** `.keel/evidence/phase-0.json`
**ADRs reserved at scope:** none new (ADR-003 is built here).

---

## Phase 1 — Pure core

**Goal:** exact money, split, balances and settle as pure functions with tests.
**Scope** ([ARCHITECTURE](./ARCHITECTURE.md) §4, §6, [ADR-001](./adr/ADR-001-integer-cents-and-split-rule.md)):
- `src/validate.js`: name, amount (regex, cap), participants (non-empty, distinct, valid), id, note.
- `src/money.js`: `parseAmount`, `formatCents`, `formatSigned`, `splitEqually`.
- `src/balances.js`: `computeBalances`, `settle`.
**Deliverables:** modules plus `tests/validate.test.js`, `tests/money.test.js`, `tests/balances.test.js`.
**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Amount parsing accepts `12.5`/`12.50`, rejects `0`, `-1`, `1.234`, `1e3`, `.5`, `12.`, `1,000`, over-cap | `unit` | — | — | ⬜ |
| Splits always sum to the amount (e.g. 10.00 ÷ 3, 0.01 ÷ 3, sweep of amounts × group sizes); leftover cents go alphabetically | `unit` | — | — | ⬜ |
| Sum of balances is 0 over generated expense sets; payer-not-listed and payer-listed cases | `unit` | — | — | ⬜ |
| Settle matches BAL-004 incl. name tie-breaks; empty output when settled; ≤ n−1 transfers | `unit` | — | — | ⬜ |
| Name validation: 1–20 `a-z` only, rejects `Alice`, `a1`, empty, 21 chars | `unit` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** MON-001..004, VAL-001, VAL-003, BAL-002..004, BO-01, BO-02. **Workflow:** `.claude/workflows/phase-1-pure-core.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none new (ADR-001 is built here).

---

## Phase 2 — Store, commands, README

**Goal:** the five commands work end-to-end against a real file; the README says how to run tool and tests.
**Scope** ([ARCHITECTURE](./ARCHITECTURE.md) §3, §5, [ADR-002](./adr/ADR-002-single-json-file-store.md)):
- `src/store.js`: `LEDGER_FILE` (default `./ledger.json`), missing → empty, shape validation, atomic save.
- `src/commands.js`: `add` (with `--note`), `list`, `remove`, `balances`, `settle`; wired into `cli.js`.
- `README.md`: how to run the tool (examples of every command), `LEDGER_FILE`, exit codes, how to run tests (`node --test`).
**Deliverables:** modules, `tests/store.test.js`, `tests/cli.test.js` (end-to-end), `README.md`.
**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| End-to-end: add→list→balances→settle reproduces the spec examples (`alice: +10.00`, `bob: -10.00`, `carol: 0.00`) | `integration` | — | — | ⬜ |
| Ids start at 1 and are never reused after `remove` (incl. removing the highest id) | `integration` | — | — | ⬜ |
| Every invalid-input class in VAL-002/VAL-003 exits 2 with `error:` on stderr and writes nothing to the file | `integration` | — | — | ⬜ |
| File created on first write only; read-only commands on a missing file do not create it; `settle` leaves the file byte-identical | `integration` | — | — | ⬜ |
| Corrupt or invalid-shape data file exits 1 with `error:` and the file is untouched | `integration` | — | — | ⬜ |
| Atomic save: no `.tmp-*` file left behind after success | `integration` | — | — | ⬜ |
| README commands copy-paste correctly (each documented command run once) | `integration` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** EXP-001..006, BAL-001, BAL-003, BAL-005, DAT-001..004, QUA-003, BO-03. **Workflow:** `.claude/workflows/phase-2-commands.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** none new (ADR-002 is built here).
**This is the prototype's launch gate** (the tool is ready to run from a clone; no deploy).

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| VAL-002 (error contract) | 0, 2 |
| QUA-001, QUA-002 | 0 |
| MON-001..004, VAL-001, VAL-003 | 1 |
| BAL-002..004 | 1 |
| EXP-001..006, BAL-001, BAL-003, BAL-005 | 2 |
| DAT-001..004 | 2 |
| QUA-003 | 2 |
| BO-01, BO-02, BO-03 | 1, 1, 2 (gates) |

---

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; budget check and auto-archive |
| `.claude/workflows/phase-0-guardrails.js` | Phase 0 — error contract, CLI skeleton, test harness |
| `.claude/workflows/phase-1-pure-core.js` | Phase 1 — validate, money, balances, settle |
| `.claude/workflows/phase-2-commands.js` | Phase 2 — store, commands, README |
| `.claude/workflows/change-template.js` | Template `/keel change` copies for hotfix-weight work |

---
*End of IMPLEMENTATION_PLAN.md — ledger*
