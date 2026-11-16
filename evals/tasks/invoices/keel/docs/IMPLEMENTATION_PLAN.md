# invoices — Implementation Plan

**Version:** 0.1 · **Status:** Phase 1 pending adoption; Phase 2 next · **References:** [BRD.md](./BRD.md), [PRD.md](./PRD.md), [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md), [LLD.md](./LLD.md), [NFR.md](./NFR.md), [adr/README.md](./adr/README.md)

## How to read this plan

Phases are ordered by one rule: **the money and numbering rules are proven before anything reads them** (the export reads numbers, dates and amounts). Gates are runnable suites (`node --test`), never "review". No separate Phase 0: the repo scaffold (package.json, test folder) is Phase 1 scope because there is no CI or deploy. Phases 1–2 deliver the accountant-ready module; **real invoices wait for Phase 3** (OD-07).

### Phase status

> Markers: ⬜ not started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state lives in [CHANGELOG.md](../CHANGELOG.md); a library has no deploy, so state tops out at `merged`.

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 1 — Core ledger: adopt and verify | ⬜ (founder reports code built; absent from repo, OD-04) | — | every Phase 1 rule proven by `node --test` | — | 2026-11-16 |
| 2 — CSV export for the accountant | ⬜ | — | byte-exact CSV tests green; accountant imports a sample unedited | — | 2026-11-16 |
| 3 — File storage | ⬜ (outline only, out of scope for now) | — | not scoped | — | 2026-11-16 |

### Standing rules (every phase, every commit)

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js`. One phase branch off `main`; task worktrees branch off it and merge back; only the phase branch (with the doc-sync commit) merges to `main`. Hotfix-weight work is a Change (`CHG-xxx`, `chg/<slug>`). No direct commits to `main`. (Working-method defaults `[ASSUMPTION]`: not asked in the non-interactive run.)
- **Goal-directed tasks.** Each worktree agent opens with `/goal`. Exit strategy `[ASSUMPTION: default]`: bounded retries (N=3), then `/goal clear`, commit what works, add a deferred-items row for human review.
- **Tests ship with the code** (`node:test`). Money, numbering, validation and export behaviour is proven by a test, never by prose.
- **Doc sync is mandatory before merge** (`.claude/workflows/doc-sync.js`): AGENTS.md status · this file's tables · `docs/adr/` · CHANGELOG `[Unreleased]` · byte budgets.
- **Decisions captured without fail** as `docs/adr/ADR-xxx-<slug>.md` (IDs reserved at scope). Open questions stay in `docs/adr/README.md` "Open decisions".
- **Definition of done per PR:** `node --test` green · no dependencies added (NFR-SEC-005) · NFR gates for the touched area green · doc-sync commit present.
- **Claims carry evidence.** `✅` needs a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Verify writes `.keel/evidence/phase-N.json`; doc-sync cites it.

---

## Phase 1 — Core ledger: adopt and verify

**Goal:** the ledger in `src/invoices.js` exists in this repo and every Phase 1 rule is proven by tests.

**Scope** ([LLD.md §2–5, §7](./LLD.md); ADR-001..007; NFR-COR-001..004, NFR-SEC-001..005):
- Resolve OD-04: import the founder's existing code or rebuild from the docs; reconcile the exported API with LLD §2 (names marked `[ASSUMPTION]`); record differences as Build deviations.
- Scaffold: `package.json` (`"type": "module"`, `engines.node >= 20`, `scripts.test = "node --test"`, no dependencies), `test/`.
- Conformance tests for F-01..F-06 and F-08 against PRD acceptance criteria and the LLD §4.3 worked examples.
- Confirm or amend ADR-001, 004, 006 (Proposed) against the built code; settle OD-02, OD-03, OD-08 where they affect Phase 1 behaviour.

**Deliverables:** [ ] `src/invoices.js` · [ ] `package.json` · [ ] `test/money-vat.test.js` · [ ] `test/numbering-void-errors.test.js` · [ ] ADR statuses updated

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `node --test` green on a clean checkout (NFR-MNT-002) | `integration` | — | — | ⬜ |
| Worked examples exact; `net + vat = gross` property test (NFR-COR-001/002/003) | `unit` | — | — | ⬜ |
| Gapless numbering across failures and voids (NFR-COR-004) | `unit` | — | — | ⬜ |
| Table-driven validation + immutability + no-caller-ids suites (NFR-SEC-001..004) | `unit` | — | — | ⬜ |
| `package.json` has no dependencies, `engines >= 20` (NFR-SEC-005) | `unit` | — | — | ⬜ |
| Built API reconciled with LLD §2; deviations recorded | `code-read` | — | human | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** CUS-001, INV-001..003, VAT-001/002, NUM-001/002, ERR-001, SEC-001, CMP-001, BO-01, BO-02.
**Workflow:** `.claude/workflows/phase-1-core-adoption.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none (ADR-001..007 written at generation).

---

## Phase 2 — CSV export for the accountant

**Goal:** `exportCsv({ from, to })` returns the accountant-confirmed CSV, byte-exact.

**Scope** ([ADR-008](./adr/ADR-008-csv-export-format.md); [LLD.md §6](./LLD.md#6-csv-export-phase-2--authoritative-format-adr-008); ADR-004, ADR-009; NFR-COR-005..007, NFR-SEC-006):
- Europe/Berlin issue-date helper; `from`/`to` validation (`invalid_date` before `invalid_range`); new code `invalid_range` added to the closed set (ADR-005, LLD §7).
- CSV writer: BOM, header, `;`, decimal comma, CRLF, quoting, invoice-number order, void rows kept, empty range.
- Resolve OD-01 → accept ADR-009 and implement its outcome.

**Deliverables:** [ ] `exportCsv` in `src/invoices.js` · [ ] `test/export-csv.test.js` · [ ] ADR-009 accepted · [ ] sample export for the accountant

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Byte-exact export tests incl. LLD §6.3 example and empty range (NFR-COR-006) | `unit` | — | — | ⬜ |
| Berlin-date tests: DST switches, year end, `2026-03-31T23:30:00Z` → `2026-04-01`, inclusive range (NFR-COR-005) | `unit` | — | — | ⬜ |
| Validation order: format before range; `invalid_date` / `invalid_range` | `unit` | — | — | ⬜ |
| Formula-injection policy implemented and tested (NFR-SEC-006) | `unit` | — | — | ⬜ |
| Accountant imports a generated sample into German Excel/DATEV with no edits (NFR-COR-007, BO-03) | `integration` | — | human (accountant) | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** EXP-001..003, ERR-001, SEC-002, BO-03.
**Workflow:** `.claude/workflows/phase-2-csv-export.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** ADR-009 (formula-injection policy; stub exists).

---

## Phase 3 — File storage (outline only; scope later with `/keel phase new`)

**Goal:** save and load the ledger as a JSON file; retain invoices per OD-06; numbering state survives restarts (retires RSK-001).
**Needs first:** OD-06 (retention), OD-07 (real use), a decision on module split (`src/` files). **ADR reserved:** ADR-010 (stub exists). No script or gate table until scoped. This phase is the gate for real invoices.

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| CUS, INV, VAT, NUM, CMP-001 | 1 |
| ERR-001, SEC-001 | 1 (+ `invalid_range` in 2) |
| EXP, SEC-002 | 2 |
| STO, retention | 3 (deferred, out of scope now) |

---

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| Phase 3 storage | founder scope | founder: later | founder | Phase 2 gates green, or before any real invoice | Phase 3 | ⬜ |
| Legal invoice rendering / §14 content (OD-09) | BRD §5 | outside the module | legal | before real use | — | ⬜ |
| e-invoicing (XRechnung/ZUGFeRD) | BRD §5 | not requested; timeline to verify | legal | Steuerberater says it applies | — | ⬜ |
| CI pipeline | generation | no CI asked for; tests run locally | engineering | second contributor or first release | — | ⬜ |

---

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; budgets; archive/split; evidence prune |
| `.claude/workflows/change-template.js` | The hotfix-weight unit (`/keel change`) |
| `.claude/workflows/phase-1-core-adoption.js` | Phase 1: Setup → worktree tasks → Integrate → Verify → doc-sync → Merge |
| `.claude/workflows/phase-2-csv-export.js` | Phase 2: same stages |
| *(Phase 3 script generated by `/keel phase new` when scoped)* | |

*End of IMPLEMENTATION_PLAN.md — invoices*
