# booking — Architecture (lite)

**References:** [BRD](./BRD.md) · [PRD](./PRD.md) · [ADRs](./adr/README.md)

## 1. Shape

One library, no runtime dependencies, no I/O. Two source files; state lives in the closure of each `createBookings()` call.

| Component | File | Responsibility | Decisions |
|---|---|---|---|
| API + engine | `src/booking.js` | `createBookings`, `BookingError`; check order; stores; `book`/`cancel`/`list`/`free` | ADR-001, 003, 005 |
| Time helpers | `src/time.js` | Strict parse of `YYYY-MM-DDTHH:MMZ` and `YYYY-MM-DD` → integer minutes; format back; weekday/day-of-month helpers. Pure; no `Date` rollover | ADR-002 |
| Tests | `test/*.test.js` | `node:test`; one test per PRD §3 row | — |

## 2. Principles

| ID | Principle |
|---|---|
| P-01 | Validate before mutating: `book` computes every check, then writes once (RSK-004) |
| P-02 | Time is an integer count of minutes since the Unix epoch (UTC); intervals are half-open `[start, end)` |
| P-03 | Stored records are private; callers only receive copies |
| P-04 | Ids are minted inside the library; any caller-provided id is a lookup key only |
| P-05 | No clock, no randomness from the environment, no timers — same calls, same results |

## 3. Data flow

`book`: validate input shape → parse times → hours/length rules → room scan (`overlap`) → person scan (`person_busy`) → mint id → insert. Order is fixed by ADR-003.
`cancel`: look up id in the id `Map` → remove from id, room and person indexes → else `not_found`.
`list`/`free`: validate room + day → weekend → `[]` → read the room's bookings on that day → sort; `free` walks 09:00–18:00 emitting gaps.

## 4. Data model

| Store | Key → value | Purpose |
|---|---|---|
| `byId` | `Map<id, record>` | cancel, ownership of truth |
| `byRoom` | `Map<room, Set<id>>` | room overlap scan, list, free |
| `byPerson` | `Map<who, Set<id>>` | person overlap scan |

Record: `{ id, room, who, startMin, endMin }` (formatted strings built on output). Linear scans are fine at prototype scale (ADR-005).

## 5. Accepted risks

| ID | Risk | Revisit trigger |
|---|---|---|
| RSK-006 | Linear scans degrade with thousands of bookings per room/person | the app reports slow `book` at real volume |
| RSK-007 | UTC-only; office local time is the app's job | app needs per-office time zones |
