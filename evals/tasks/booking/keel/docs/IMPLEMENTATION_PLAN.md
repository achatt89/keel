# booking — Implementation Plan

**Version:** 0.1 · **Status:** Draft (nothing built)
**References:** [BRD.md](./BRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [adr/](./adr/README.md)

## How to read this plan

Three small phases, ordered so the strict time/validation primitives exist before the engine
that depends on them, and the engine before the queries that read its state. Gates are runnable
`node --test` suites, not reviews. Phases 0–2 deliver the whole v1; there is no launch/deploy
(a library — A-14). Two work units exist: a **Phase** (gated, scripted) and a **Change**
(`CHG-xxx`, hotfix-weight: a row + a CHANGELOG line, no block).

### Phase status

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 0 — Foundation & time primitives | ⬜ | — | parsing/hours/length rules proven by unit tests; package has zero dependencies | — | — |
| 1 — Booking engine | ⬜ | — | `book`/`cancel` throw the exact codes in the exact precedence; hostile-input matrix throws only `BookingError` | — | — |
| 2 — Queries, README & hardening | ⬜ | — | `list`/`free` correct; no-double-booking property test green; README present | — | — |

### Standing rules (apply to every phase, every commit)

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js`. One phase branch off `main`; task worktrees branch off it and merge back; only the phase branch (tasks + evidence + doc-sync commit) merges to `main`. For a **Change**: `chg/<slug>` off `main`. No direct commits to `main`.
- **Goal-directed, self-contained tasks.** Every worktree agent opens with `/goal` (code done, `node --test` green). Exit strategy: **bounded retries (N=3), then `/goal clear` + commit what works + a deferred-items row for human review** (the keel default; `[ASSUMPTION]`, transcript).
- **Tests ship with the code.** Unit tests for logic, one test per BKG/QRY/SEC id at minimum; the no-double-booking property is proven by a test, never asserted in prose. Tests use only `node:test` + `node:assert`.
- **Doc sync is mandatory before merge** — `.claude/workflows/doc-sync.js` (status table, this file's tables, ADRs, CHANGELOG `[Unreleased]`, budgets). A merge without the doc-sync commit is incomplete.
- **Decisions captured without fail.** Any decision becomes `docs/adr/ADR-xxx-<slug>.md` before merge (ID taken at Integrate, never in a worktree). No addenda. Open questions → `docs/adr/README.md` Open decisions.
- **Definition of done per PR:** `node --test` green on Node ≥ 20 · `package.json` has no `dependencies`/`devDependencies` · doc-sync commit present.
- **Claims carry evidence.** `✅` only with a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact; Verify writes `.keel/evidence/phase-N.json`; doc-sync cites it. Nothing in this project can reach above `unit`/`integration`: there is no browser, staging or production.

---

## Phase 0 — Foundation & time primitives

**Goal:** the package scaffold, `BookingError` and the strict time layer exist and are proven.

**Scope** ([ARCHITECTURE.md §2–§4](./ARCHITECTURE.md); [ADR-001](./adr/ADR-001-commonjs-single-module.md); [ADR-002](./adr/ADR-002-strict-parse-integer-minutes.md)):
- `package.json` (no dependencies, `"test": "node --test"`, `engines.node >=20`); `src/booking.js` exporting `createBookings`, `BookingError`.
- `BookingError` with `code`; strict timestamp and day parsing; weekday; hours/length pure checks.

**Deliverables:**
- [ ] `package.json`, `src/booking.js` skeleton
- [ ] tests: `test/time.test.js` — valid/invalid table (format, `T`/`Z` casing, seconds, offsets, month 13, Feb 29 leap/non-leap, minute 07, hour 24, non-strings), weekday, hours, ≤ 4h boundary

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Time table-driven suite green, incl. leap years and every format violation | `unit` | `test/time.test.js` + run output | Verify stage | ⬜ |
| Module loads via both `require` and `import { createBookings, BookingError }` | `unit` | test file + run output | Verify stage | ⬜ |
| `package.json` has no dependencies (asserted by a test) | `unit` | test file + run output | Verify stage | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | commit | doc-sync | ⬜ |

**Traceability:** BKG-003, BKG-004 (rules), BKG-010, PKG-001, PKG-003, PKG-004, CON-004.
**Workflow:** `.claude/workflows/phase-0-foundation.js` · **Evidence:** `.keel/evidence/phase-0.json`
**ADRs reserved at scope:** none (ADR-001, ADR-002 accepted at generation)

---

## Phase 1 — Booking engine

**Goal:** `book` and `cancel` enforce every rule with the exact codes and precedence; no double booking is possible.

**Scope** ([ARCHITECTURE.md §3–§7](./ARCHITECTURE.md); [ADR-003](./adr/ADR-003-check-order-and-error-precedence.md); [ADR-004](./adr/ADR-004-generated-opaque-ids-map-store.md)):
- `book` pipeline (ARCHITECTURE §4), atomic commit, ids, room and person indexes.
- `cancel` with `not_found` for unknown/non-string ids; frees room and person.
- Hostile-input handling (SEC-001/002/003): single property reads, typeof checks.

**Deliverables:**
- [ ] `book`, `cancel` in `src/booking.js`
- [ ] tests: `test/book.test.js`, `test/cancel.test.js`

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| One test per code: `invalid_input`, `invalid_time`, `outside_hours` (weekend, before 09:00, after 18:00, cross-day), `too_long` (4h ok, 4h15 fails), `overlap`, `person_busy`, `not_found` | `unit` | test files + run output | Verify stage | ⬜ |
| Precedence: overlap beats person_busy when both apply; each ADR-003 adjacent pair covered | `unit` | `test/book.test.js` | Verify stage | ⬜ |
| Half-open: 10:00–11:00 then 11:00–12:00 accepted in same room and for same person | `unit` | `test/book.test.js` | Verify stage | ⬜ |
| Cancel frees the slot for both room and person; cancelling twice → `not_found` | `unit` | `test/cancel.test.js` | Verify stage | ⬜ |
| Hostile matrix (`__proto__`, objects, arrays, numbers, counting getters, `null`) only ever throws `BookingError`; failed `book` leaves state unchanged | `unit` | test + run output | Verify stage | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | commit | doc-sync | ⬜ |

**Traceability:** BKG-001, BKG-002, BKG-005..BKG-009, SEC-001..SEC-003, BO-01, BO-02.
**Workflow:** `.claude/workflows/phase-1-booking-engine.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none (ADR-003, ADR-004 accepted at generation)

---

## Phase 2 — Queries, README & hardening

**Goal:** `list` and `free` are correct, the README exists, and the whole suite proves the no-double-booking invariant.

**Scope** ([ARCHITECTURE.md §5, §9](./ARCHITECTURE.md)):
- `list`, `free` (weekends `[]`, adjacency leaves no gap, sorted, copies).
- `README.md`: usage, error table, precedence, `node --test`.
- Randomised `book`/`cancel` sequence test (seeded PRNG, no deps) asserting invariants I-1…I-4.

**Deliverables:**
- [ ] `list`, `free`; `README.md`
- [ ] tests: `test/query.test.js`, `test/invariants.test.js`

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `list` sorted, format-preserving, day-scoped; Saturday/Sunday → `[]` for `list` and `free` | `unit` | `test/query.test.js` | Verify stage | ⬜ |
| `free`: gaps correct incl. leading/trailing, adjacent bookings leave no gap, empty room → `[09:00, 18:00)`, fully booked → `[]` | `unit` | `test/query.test.js` | Verify stage | ⬜ |
| Property test: across ≥ 10 000 seeded random operations no two live bookings overlap in a room or for a person | `unit` | `test/invariants.test.js` + run output | Verify stage | ⬜ |
| Mutating a returned booking/interval does not change later results | `unit` | `test/query.test.js` | Verify stage | ⬜ |
| README covers every public call, every error `code`, check order, running `node --test`; its example runs | `code-read` | `README.md` commit | human | ⬜ |
| Full `node --test` green; `package.json` still dependency-free | `unit` | run output | Verify stage | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | commit | doc-sync | ⬜ |

**Traceability:** QRY-001..QRY-003, PKG-005, BO-01, BO-03, SEC-003.
**Workflow:** `.claude/workflows/phase-2-queries-and-readme.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** none

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| BKG-003, BKG-004 (time + hours rules), PKG-001/003/004 | 0 |
| BKG-001, 002, 005–010, SEC-001..003 | 1 |
| QRY-001..003, PKG-005, BO-01 proof, BO-03 | 2 |
| PKG-002 (no I/O) | 0–2 (no `require` of anything but `node:crypto`; checked at Verify) |

---

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| *(none yet — items added by doc-sync workflow as work progresses)* | — | — | — | — | — | — |

---

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; cites `.keel/evidence/`; auto-archive/split on budget breach. |
| `.claude/workflows/change-template.js` | Hotfix-weight Change (`/keel change <slug>`). |
| `.claude/workflows/phase-0-foundation.js` | Phase 0 — scaffold, `BookingError`, strict time layer. |
| `.claude/workflows/phase-1-booking-engine.js` | Phase 1 — `book`, `cancel`, rule pipeline. |
| `.claude/workflows/phase-2-queries-and-readme.js` | Phase 2 — `list`, `free`, README, property test. |

---

*End of IMPLEMENTATION_PLAN.md — booking*
