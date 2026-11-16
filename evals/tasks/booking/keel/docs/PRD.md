# booking — Product Requirements (PRD, lite)

**References:** [BRD](./BRD.md) · [ARCHITECTURE](./ARCHITECTURE.md). The library's public contract lives here, once.

## 1. Features

| ID | Feature | Implements | Phase |
|---|---|---|---|
| F-01 | Module surface + `BookingError` | API-001, CON-004 | 0 |
| F-02 | Input & timestamp validation | TIM-001..004, INP-001 | 0 |
| F-03 | `book` with hours, length and conflict rules | API-002, HRS-001..004, CNF-001..004 | 1 |
| F-04 | `cancel` | API-003, INP-002 | 1 |
| F-05 | `list` and `free` | QRY-001..003 | 2 |
| F-06 | README + full rule-by-rule test suite | DOC-001, TST-001 | 2 |

## 2. Contract

```
const { createBookings, BookingError } = require('./src/booking.js')
const b = createBookings()            // fresh, empty, independent store
b.book({ room, start, end, who })     // -> id (string)
b.cancel(id)                          // -> undefined
b.list(room, day)                     // -> [{ id, room, start, end, who }] sorted by start
b.free(room, day)                     // -> [{ start, end }] sorted
```

- Times: `YYYY-MM-DDTHH:MMZ` (e.g. `2026-03-02T09:15Z`); `day`: `YYYY-MM-DD`. Output times use the same format.
- `BookingError extends Error`; `name === 'BookingError'`; `code` is one of `invalid_time` · `outside_hours` · `too_long` · `overlap` · `person_busy` · `not_found` · `invalid_input`. Nothing else is ever thrown for a rule break.
- Each `createBookings()` call owns separate state. Returned objects are copies.

## 3. Behaviour rules (one row = at least one test)

| # | Input | Result | Req |
|---|---|---|---|
| 1 | `start` not exactly `YYYY-MM-DDTHH:MMZ` (missing Z, seconds, offset, space, non-string) | `invalid_time` | TIM-001 |
| 2 | Well-formed but not real: `2026-02-30`, month 13, hour 24, minute 60 | `invalid_time` | TIM-002 |
| 3 | Minute not in {00,15,30,45} | `invalid_time` | TIM-003 |
| 4 | `start` ≥ `end` | `invalid_time` | TIM-004 |
| 5 | Saturday or Sunday | `outside_hours` | HRS-001 |
| 6 | Start before 09:00 or end after 18:00 | `outside_hours` | HRS-002 |
| 7 | End on a later day (e.g. 17:00 → next day 10:00) | `outside_hours` | HRS-003 |
| 8 | Duration > 4h inside opening hours (09:00–13:15) | `too_long` | HRS-004 |
| 9 | Exactly 4h; ends exactly 18:00; starts exactly 09:00 | accepted | A-09 |
| 10 | Same room, overlapping interval | `overlap` | CNF-001 |
| 11 | Same room, touching (10–11 then 11–12) | accepted | CNF-002 |
| 12 | Same `who`, overlapping, different rooms | `person_busy` | CNF-003 |
| 13 | Same room **and** same `who` overlapping | `overlap` | CNF-004 |
| 14 | `room`/`who` missing, empty, or not a string; argument not an object | `invalid_input` | INP-001 |
| 15 | `cancel` unknown / already-cancelled / non-string id | `not_found` | API-003, INP-002 |
| 16 | After `cancel`, same slot bookable again by room and person | accepted | A-05 |
| 17 | `list` on a day: only that room, that day, sorted by start | array | QRY-001 |
| 18 | `free` with no bookings on a weekday | `[{09:00,18:00}]` | QRY-002 |
| 19 | `free` with bookings | gaps only; adjacent bookings leave no gap; sorted | QRY-002 |
| 20 | `list`/`free` on Saturday or Sunday | `[]` | QRY-003 |
| 21 | Failed `book` leaves state unchanged | next call sees no trace | RSK-004 |
| 22 | `list`/`free` bad `day` → `invalid_time`; bad `room` → `invalid_input` | per A-04 | A-04 |

Check order for a call that breaks several rules: ADR-003.
