# booking — Business Requirements (BRD, lite)

**Version:** 0.1 · **Status:** Draft · **Tier:** Prototype / weekend · **Source:** founder's `prompt.md` (every line a confirmed requirement) + interview ([keel-transcript](./keel-transcript.md)).

## 1. Problem & objectives

`booking` is the core library of a later office meeting-room booking app (app + storage come later). Today rooms get double-booked and people get booked into two meetings at once. Developers building that app need a library that makes both impossible.

| ID | Objective | Measure |
|---|---|---|
| BO-01 | No room is ever double-booked | `overlap` suite green; no code path mutates state without the check (ADR-005) |
| BO-02 | No person is ever in two meetings at once | `person_busy` suite green |
| BO-03 | Every rule holds exactly as specified, with the stated error codes | one test per rule row in §3, all green |

**Users:** developers integrating the library (primary); office staff are end users of the later app, not of this library.

## 2. Constraints

| ID | Constraint |
|---|---|
| CON-001 | Node.js 20 or later |
| CON-002 | Standard library only — no npm dependencies; tests use `node:test`, run with `node --test` |
| CON-003 | Pure in-memory logic, no I/O (no files, network, clock, randomness from the environment) |
| CON-004 | `src/booking.js` exports `createBookings` and `BookingError` |
| CON-005 | Interface is a JavaScript module API only — no UI, HTTP or CLI |

## 3. Requirements

Priority is `Must` for every row (founder: every line is confirmed). Error codes are `BookingError.code`. Behaviour detail: [PRD](./PRD.md).

| ID | Requirement | Code on break |
|---|---|---|
| API-001 | `createBookings()` returns an object with `book`, `cancel`, `list`, `free` | — |
| API-002 | `book({room,start,end,who})` returns a new booking id (string) | — |
| API-003 | `cancel(id)` removes a booking; unknown id fails | `not_found` |
| TIM-001 | `start`/`end` match exactly `YYYY-MM-DDTHH:MMZ` | `invalid_time` |
| TIM-002 | Timestamps are real calendar dates and times | `invalid_time` |
| TIM-003 | Minutes are 00, 15, 30 or 45 | `invalid_time` |
| TIM-004 | `start` is before `end` | `invalid_time` |
| HRS-001 | Bookings fall Monday–Friday (UTC) | `outside_hours` |
| HRS-002 | Bookings lie within 09:00–18:00 UTC | `outside_hours` |
| HRS-003 | Start and end are on the same day | `outside_hours` |
| HRS-004 | A booking lasts at most 4 hours | `too_long` |
| CNF-001 | A room cannot hold two overlapping bookings | `overlap` |
| CNF-002 | Intervals are half-open: 10:00–11:00 and 11:00–12:00 do not overlap | — |
| CNF-003 | A person (`who`) cannot hold two overlapping bookings in any rooms | `person_busy` |
| CNF-004 | When both CNF-001 and CNF-003 apply, `overlap` is thrown | `overlap` |
| INP-001 | Missing or empty `room` or `who` | `invalid_input` |
| INP-002 | Caller-supplied ids are never trusted; every input is validated | `not_found` / `invalid_input` |
| QRY-001 | `list(room, day)` returns the room's bookings on `day`, sorted by start, as `{id,room,start,end,who}` in the given time format | — |
| QRY-002 | `free(room, day)` returns free `{start,end}` intervals within opening hours, sorted; adjacent bookings leave no gap | — |
| QRY-003 | On Saturday/Sunday `list` and `free` return `[]` | — |
| TST-001 | Own tests, runnable with `node --test`, cover every row above | — |
| DOC-001 | README: how to use the library and how to run the tests | — |

## 4. Assumptions

| ID | Assumption |
|---|---|
| A-01 | [ASSUMPTION] Check order when several rules break: `invalid_input` → `invalid_time` → `outside_hours` → `too_long` → `overlap` → `person_busy` (ADR-003). Open: OD-01 |
| A-02 | [ASSUMPTION] "Non-empty string" is literal: length > 0, no trimming; whitespace-only is accepted. Names are case-sensitive exact match. Open: OD-02 |
| A-03 | [ASSUMPTION] `cancel` with a non-string or unknown id throws `not_found` (not `invalid_input`) |
| A-04 | [ASSUMPTION] `list`/`free` validate `room` (`invalid_input`) and `day` (`invalid_time` when not a real `YYYY-MM-DD`); an unseen room is valid and empty |
| A-05 | [ASSUMPTION] Cancelling a booking frees its slot for both room and person; ids are never reused |
| A-06 | [ASSUMPTION] No public holidays; every Monday–Friday is open |
| A-07 | [ASSUMPTION] CommonJS module (`require`; named ESM import also works) — ADR-001 |
| A-08 | [ASSUMPTION] A minimal `package.json` (no dependencies, `"test": "node --test"`) is allowed |
| A-09 | [ASSUMPTION] A booking of exactly 4h is allowed; 4h15 is `too_long`; a booking ending 18:00 is allowed |

## 5. Risks

| ID | Risk | Mitigation |
|---|---|---|
| RSK-001 | Ambiguous precedence between error codes makes hidden/consumer tests disagree | ADR-003 fixes one order; OD-01 asks the founder to confirm |
| RSK-002 | JS `Date` silently rolls invalid dates (`2026-02-30` → Mar 2) | Parse with round-trip check (ADR-002); tests for 02-30, 13th month, 24:00, 09:60 |
| RSK-003 | Caller mutates returned objects and corrupts state | Return copies only (ADR-005) |
| RSK-004 | Failed `book` leaves partial state | Validate everything, then mutate once (ADR-005) |
| RSK-005 | Hostile id/room strings (`__proto__`, `constructor`) hit object prototype keys | `Map`-based storage, never plain-object keys (ADR-005) |

Out of scope (later app): storage, UI, auth, recurring bookings, time zones other than UTC, rescheduling, capacity.

Architecture-mirrored accepted risks: RSK-006 (linear scans at volume) and RSK-007 (UTC only) — see [ARCHITECTURE §5](./ARCHITECTURE.md).
