# booking — Architecture (lite)

**Version:** 0.1 · **Status:** Draft · **Tier:** Prototype
**Requirements:** [BRD.md](./BRD.md) · **Decisions:** [adr/](./adr/README.md)

One in-memory library in one file. This doc holds the module shape, the public contract, the
validation pipeline and the invariants; there is no LLD/HLD at this tier — §3–§6 are the
implementer's contract.

## 1. Principles

| ID | Principle | Serves |
|----|-----------|--------|
| P-01 | One mutation path: state changes only in a final `commit` step after every check passed. | BO-01, SEC-003 |
| P-02 | Validate first, touch nothing until valid; read each caller property exactly once into a local. | SEC-001 |
| P-03 | Times are integers (minutes since epoch UTC) internally; text only at the edge. | CON-004, ADR-002 |
| P-04 | Pure and synchronous: no I/O, no clock, no globals; all state in the `createBookings()` closure. | CON-003 |
| P-05 | Return copies, never internal references. | SEC-003 |

## 2. Components

`src/booking.js` (CommonJS, [ADR-001](./adr/ADR-001-commonjs-single-module.md)) — sections in one file:

| Part | Responsibility | Never |
|------|----------------|-------|
| `BookingError` | `extends Error`; `name = 'BookingError'`; `code` ∈ `invalid_input`, `invalid_time`, `outside_hours`, `too_long`, `overlap`, `person_busy`, `not_found` | carry caller data in `message` unescaped |
| Time (`parseTimestamp`, `parseDay`, `format`) | Strict text ↔ minutes; weekday; real-date check | use `Date.parse` / locale APIs |
| Rules (`checkInput`, `checkHours`, `checkLength`) | Pure checks, each throws one `code` | mutate state |
| Store | `Map<id, booking>` plus per-room and per-person lists of live bookings | expose its objects |
| API (`createBookings`) | `book`, `cancel`, `list`, `free` | add public methods (CON-005) |

```
caller ─► book/cancel/list/free ─► validate (Rules, Time) ─► query Store ─► commit (book/cancel only)
                                         │ throws BookingError, state untouched
```

## 3. Public contract

| Call | Returns | Throws |
|------|---------|--------|
| `createBookings()` | `{ book, cancel, list, free }`; each call is an independent empty store | — |
| `book({ room, start, end, who })` | id string (opaque, [ADR-004](./adr/ADR-004-generated-opaque-ids-map-store.md)) | all codes except `not_found` |
| `cancel(id)` | `undefined` | `not_found` |
| `list(room, day)` | `[{ id, room, start, end, who }]` sorted by `start` | `invalid_input`, `invalid_time` |
| `free(room, day)` | `[{ start, end }]` sorted | `invalid_input`, `invalid_time` |

Extra keys on the `book` argument are ignored (A-13). `BookingError.code` is a string property
equal to the names above (BKG-010).

## 4. `book` validation pipeline (order is the contract — [ADR-003](./adr/ADR-003-check-order-and-error-precedence.md))

| # | Check | Code | Detail |
|---|-------|------|--------|
| 1 | Argument is an object; `room`, `who` are non-empty strings | `invalid_input` | no trimming (A-04, A-06) |
| 2 | `start`, `end` are strings matching `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$`; month/day/hour/minute in range and a real calendar date (leap years); minute ∈ {0,15,30,45}; `start < end` | `invalid_time` | missing/non-string → `invalid_time` (A-05) |
| 3 | Same UTC date for `start` and `end`; Monday–Friday; `start ≥ 09:00`; `end ≤ 18:00` | `outside_hours` | end on a later date, incl. next-day 00:00, fails here (A-12) |
| 4 | `end − start ≤ 240` minutes | `too_long` | exactly 4h passes |
| 5 | No live booking in the same room with `a.start < b.end && b.start < a.end` | `overlap` | half-open |
| 6 | No live booking of the same `who`, any room, overlapping | `person_busy` | only reached if 5 passed |

Then `commit`: generate id, store, index by room and person.

## 5. Queries

- `list(room, day)`: validate `room` (non-empty string, else `invalid_input`) then `day` (`^\d{4}-\d{2}-\d{2}$`, real date, else `invalid_time`) (A-07). Saturday/Sunday → `[]`. Otherwise the room's live bookings whose start date is `day`, sorted by start (ties impossible within a room), re-formatted to `YYYY-MM-DDTHH:MMZ`.
- `free(room, day)`: same validation; weekend → `[]`; else sweep the sorted bookings across `[09:00, 18:00)` and emit each gap of positive length; touching bookings emit no zero-length interval. Unknown room → one interval `[09:00, 18:00)` on a weekday (A-08).
- Both return fresh objects (P-05).

## 6. Data model & invariants

`booking = { id, room, who, startMin, endMin }` (minutes since epoch UTC). Stored once in `Map<id, booking>`; room and person indexes hold references, removed on `cancel`.

| # | Invariant | Mechanism |
|---|-----------|-----------|
| I-1 | No two live bookings in one room overlap; none of one person overlap | checks 5–6 immediately before `commit`; synchronous (no await between check and commit) |
| I-2 | A rejected `book` or `cancel` changes nothing | P-01: no writes before the last check |
| I-3 | Ids are unique, never reused, never caller-chosen | `crypto.randomUUID()`; `Map` lookup, not property access |
| I-4 | Every stored booking is inside opening hours, ≤ 4h, same day, quarter-hour aligned | only `commit` writes, only after checks 1–4 |

## 7. Security & risks (prototype sanity pass)

No sensitive data (room names, people's names, times). Untrusted input is every argument.

| Threat | Control | Verified by |
|--------|---------|-------------|
| Crafted id (`__proto__`, `constructor`, objects, arrays) reaches property lookup or crashes `cancel` | `typeof id === 'string'` then `Map.get`; otherwise `not_found` (SEC-002) | Phase 1 `cancel` tests with hostile ids |
| Getter/Proxy argument returns different values on repeated reads (check/use mismatch) | read each property once into locals (P-02) | Phase 1 test with a counting getter |
| Non-string coercion (`{toString}`, arrays, numbers) passes as a name or time | strict `typeof === 'string'` before any use; regexes anchored, fixed-length (no ReDoS) | Phase 0/1 type-matrix tests |
| Caller mutates a returned booking to corrupt state | copies only (P-05) | Phase 2 test |
| Oversized room/who strings exhaust memory | not mitigated — see §8 | — |
| Library throws a raw `TypeError` on weird input | SEC-001: every path validated; catch-all test over a hostile-input matrix | Phase 1 gate |

## 8. Accepted residual risks

| ID | Risk | Revisit trigger |
|----|------|-----------------|
| RSK-003 | Async storage in the later app breaks the synchronous check→commit atomicity | persistence design starts |
| (no ID) | No length cap on `room`/`who`; a caller can store huge strings | the library is exposed to untrusted callers (the later app validates) |

## 9. Verification

`node --test` (files in `test/`). Each BKG/QRY/SEC id maps to at least one test; the invariants
I-1…I-4 are covered by a randomised `book`/`cancel` sequence test (Phase 2). Plan: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
