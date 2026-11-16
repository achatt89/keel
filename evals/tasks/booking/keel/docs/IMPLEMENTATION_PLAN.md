# booking — Implementation Plan

**Version:** 0.1 · **Status:** Not started · **References:** [BRD](./BRD.md) · [PRD](./PRD.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [ADRs](./adr/README.md)

## How to read this plan

Ordering rule: **validation first, then the mutation path that depends on it, then the read paths.** `book` cannot be trusted until every input check exists, and `list`/`free` read what `book` wrote. Each phase lists scope, deliverables and an exit-gate table. A phase is open until its gates pass. Phases 0–2 deliver the whole prototype.

Two work units exist (conventions: Phase = gated milestone; Change `CHG-xxx` = hotfix-weight, a row below + a CHANGELOG line).

### Phase status

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 0 — Foundations & validation | ⬜ | — | exports exist; every timestamp/input rule rejects with the right code | — | — |
| 1 — Booking engine | ⬜ | — | `book`/`cancel` enforce hours, length, overlap, person_busy, precedence, atomicity | — | — |
| 2 — Queries, docs, sign-off | ⬜ | — | `list`/`free` correct; README accurate; whole suite green under `node --test` | — | — |

### Standing rules (every phase, every commit)

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js`; it creates `phase-N-<slug>` off `main`, fans out tasks in `git worktree`s, merges them back, and only the phase branch (with the doc-sync commit) merges to `main`. Never commit to `main`. A Change uses `chg/<slug>`. Mechanics: `.claude/workflows/README.md`.
- **Goal-directed tasks.** Each worktree agent opens with `/goal`. Exit strategy: bounded retries (N=3), then `/goal clear`, commit what works, add a Deferred row for human review. [ASSUMPTION] default accepted.
- **Tests ship with the code.** Every rule row in PRD §3 is proven by a test (`node --test`); a rule without a test is not done. Prototype scale: unit tests on the public API are the main level.
- **Doc sync is mandatory before merge** (`.claude/workflows/doc-sync.js`; inline when only status lines change, else delegate to the doc-sync role, ≤3 rounds).
- **Decisions captured** as `docs/adr/ADR-xxx-<slug>.md` before merge; open questions stay in `docs/adr/README.md`.
- **Definition of done per PR:** `node --test` green · no dependency added (`package.json` has no `dependencies`/`devDependencies`) · no I/O or `require` outside `node:` builtins in `src/` · doc-sync commit present.
- **Claims carry evidence.** `✅` needs a level (`code-read` < `unit` < `integration` < … < `prod-live`) and an artefact; Verify writes `.keel/evidence/phase-N.json`. There is no deployment; `prod-live` never applies.
- **Review.** Security-audit skill declined for this project; no security or design reviewer. `code-read` review by the caller before merge.

---

## Phase 0 — Foundations & validation

**Goal:** a loadable module whose every input and timestamp check rejects bad data with the right `BookingError.code`.

**Scope** (ADR-001, ADR-002; PRD §3 rows 1–4, 14; ARCHITECTURE §1):
- `package.json` (name, `"test": "node --test"`, `engines.node >=20`, no dependencies) [ASSUMPTION A-08].
- `src/time.js`: strict parse/format of timestamps and days; weekday; leap-year-aware.
- `src/booking.js`: `BookingError` (`name`, `code`), `createBookings()` returning `book/cancel/list/free` with input-shape and time-validity checks wired in `book` (the rest may throw until Phase 1/2 — stubs must not accept data).

**Deliverables:**
- [ ] `src/time.js`, `src/booking.js` (skeleton + validation), `package.json`
- [ ] tests: `test/api.test.js` (exports, `BookingError` shape), `test/time.test.js`, `test/validation.test.js` (PRD rows 1–4, 14)

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `require('./src/booking.js')` exposes `createBookings` and `BookingError`; `BookingError` has `code` and `name` | `unit` | `test/api.test.js` run | — | ⬜ |
| Invalid format / non-real date / off-quarter minute / `start>=end` each → `invalid_time` (incl. 02-30, month 13, 24:00, 09:60, leap day 2028-02-29 valid, 2026-02-29 invalid) | `unit` | `test/time.test.js`, `test/validation.test.js` | — | ⬜ |
| Missing/empty/non-string `room`/`who` and non-object arg → `invalid_input` | `unit` | `test/validation.test.js` | — | ⬜ |
| No dependency, no I/O in `src/` | `code-read` | commit | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | commit | doc-sync | ⬜ |

**Traceability:** TIM-001..004, INP-001, API-001, CON-001..005.
**Workflow:** `.claude/workflows/phase-0-foundations.js` · **Evidence:** `.keel/evidence/phase-0.json`
**ADRs reserved at scope:** none (ADR-001, ADR-002 accepted at generation).

---

## Phase 1 — Booking engine

**Goal:** `book` and `cancel` make a double-booking of a room or a person impossible, with every error code and the stated precedence.

**Scope** (ADR-003, ADR-004, ADR-005; PRD §3 rows 5–13, 15, 16, 21):
- Hours (Mon–Fri, 09:00–18:00, same day) → `outside_hours`; > 4h → `too_long`.
- Room and person overlap scans on half-open intervals; `overlap` before `person_busy`.
- Id minting, `Map`/`Set` indexes, copies out, validate-then-write; `cancel` with `not_found`.

**Deliverables:**
- [ ] `book` returning a string id; `cancel`
- [ ] tests: `test/hours.test.js`, `test/conflicts.test.js`, `test/precedence.test.js`, `test/cancel.test.js`, `test/atomicity.test.js`

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Weekend, <09:00, >18:00, cross-midnight → `outside_hours`; exact 09:00 start and 18:00 end accepted | `unit` | `test/hours.test.js` | — | ⬜ |
| 4h accepted; 4h15 → `too_long`; check order `outside_hours` before `too_long` | `unit` | `test/hours.test.js`, `test/precedence.test.js` | — | ⬜ |
| Room overlap (partial, containing, identical) → `overlap`; touching intervals accepted; other room unaffected | `unit` | `test/conflicts.test.js` | — | ⬜ |
| Same person in two rooms overlapping → `person_busy`; same room + same person → `overlap` | `unit` | `test/conflicts.test.js`, `test/precedence.test.js` | — | ⬜ |
| `cancel`: unknown, repeated, non-string, `__proto__` ids → `not_found`; slot rebookable after cancel; ids never reused | `unit` | `test/cancel.test.js` | — | ⬜ |
| Failed `book` leaves no trace; mutating a returned value cannot change stored state | `unit` | `test/atomicity.test.js` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | commit | doc-sync | ⬜ |

**Traceability:** HRS-001..004, CNF-001..004, API-002, API-003, INP-002, BO-01, BO-02.
**Workflow:** `.claude/workflows/phase-1-booking-engine.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none (ADR-003, 004, 005 accepted at generation).

---

## Phase 2 — Queries, docs, sign-off

**Goal:** `list` and `free` are correct, the README is accurate, and every requirement has a passing test.

**Scope** (PRD §3 rows 17–20, 22; BRD DOC-001, TST-001):
- `list(room, day)`: filter by room and day, sort by start, copies in the original time format. `free(room, day)`: gaps within 09:00–18:00; adjacent bookings leave none; weekend → `[]`.
- `README.md`: install-free usage example, API contract summary pointing to PRD §2 for the rest, error-code table, `node --test`. Must not contradict PRD.
- Coverage sweep: a traceability test file or checklist mapping each BRD requirement ID to a test.

**Deliverables:**
- [ ] `list`, `free`
- [ ] `README.md`
- [ ] tests: `test/list.test.js`, `test/free.test.js`; requirement-coverage check

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `list` filters by room and day, sorts by start, returns `{id,room,start,end,who}` | `unit` | `test/list.test.js` | — | ⬜ |
| `free`: empty day → `[09:00,18:00)`; gaps only; adjacent → no gap; fully booked → `[]`; sorted | `unit` | `test/free.test.js` | — | ⬜ |
| Sat/Sun `list` and `free` → `[]`; bad day → `invalid_time`; bad room → `invalid_input` | `unit` | `test/list.test.js`, `test/free.test.js` | — | ⬜ |
| `node --test` from a clean checkout: all green, none skipped | `unit` | `.keel/evidence/phase-2/test-report.txt` | — | ⬜ |
| README example runs as written; every BRD requirement ID is covered by a test | `integration` | `.keel/evidence/phase-2/` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | commit | doc-sync | ⬜ |

**Traceability:** QRY-001..003, DOC-001, TST-001, BO-03.
**Workflow:** `.claude/workflows/phase-2-queries-and-docs.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** none.

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| API-001, TIM-001..004, INP-001, CON-001..005 | 0 |
| API-002, API-003, HRS-001..004, CNF-001..004, INP-002 | 1 |
| QRY-001..003, DOC-001, TST-001 | 2 |
| BO-01..03 | 1 + 2 (gates) |

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| OD-01 / OD-02 founder confirmation of assumed defaults | generation | non-interactive run took defaults | founder | before the app depends on the library | Phase 2 | Open |

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; budgets |
| `.claude/workflows/change-template.js` | Base for `/keel change` |
| `.claude/workflows/phase-0-foundations.js` | Phase 0 |
| `.claude/workflows/phase-1-booking-engine.js` | Phase 1 |
| `.claude/workflows/phase-2-queries-and-docs.js` | Phase 2 |

---

*End of IMPLEMENTATION_PLAN.md — booking*
