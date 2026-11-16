# Business Requirements Document
## booking — an in-memory meeting-room booking library

**Version:** 0.1
**Date:** 2026-11-16
**Author:** founder (spec) · Keel (structure)
**Status:** Draft — tier: Prototype / weekend (lite BRD)

> Source of truth for the requirements is the founder's description (`prompt.md`, recorded in
> [keel-transcript.md](./keel-transcript.md)); every line of it is a confirmed requirement. Items
> the description left open are `[ASSUMPTION]`s (§8), each with a default already taken.

---

## 1. Executive Summary

Offices double-book rooms, and people end up in two meetings at once. `booking` is the core
logic that makes both impossible: a pure in-memory JavaScript library that accepts, rejects,
cancels and queries room bookings under strict, exactly specified rules.

**booking is a Node.js 20+ module (`src/booking.js`, standard library only) exporting `createBookings()` and `BookingError`.**

Example: `book({ room: 'Atlas', start: '2026-03-02T09:15Z', end: '2026-03-02T10:15Z', who: 'Dana' })`
returns an id; booking Dana into any other room at 10:00 throws `BookingError` with `code: 'person_busy'`.

Audience: developers who will build an office-booking app on this library (storage, UI and HTTP come later). Office staff are the later end users.

---

## 2. The Problem

**Double-booked rooms.** Two meetings claim the same room and time.

**People in two places.** One person is booked into overlapping meetings in different rooms.

The result: wasted meetings and conflict, because nothing enforces the rules at the point of booking.

---

## 3. Business Objectives

| ID | Objective | Success Metric | Measurement |
|----|-----------|----------------|-------------|
| BO-01 | No double booking is ever possible (room or person) | 0 accepted overlapping bookings across every tested sequence of `book`/`cancel` | Randomised invariant test + rule tests (`node --test`) |
| BO-02 | Every rule holds exactly as specified, with the stated error codes | 100% of rule cases throw the specified `code` (or return the specified value) | One test per rule and per precedence case |
| BO-03 | A developer can adopt the library without reading its source | README covers usage, errors, tests | README reviewed against BKG/QRY ids (Phase 2 gate) |

---

## 5. Stakeholder Map

| Stakeholder | Role | Primary Interest |
|-------------|------|------------------|
| Founder | Owner, spec author | Rules exact; foundation ready for the later app |
| App developers (later) | Library consumers | Predictable API, stable error codes, no dependencies |
| Office staff (later) | End users of the app | Never double-booked |

---

## 6. Business Requirements

Groups: **BKG** booking & rules · **QRY** queries · **PKG** packaging & delivery · **SEC** input trust & integrity.
Timestamps are UTC, written exactly `YYYY-MM-DDTHH:MMZ`; days are `YYYY-MM-DD`. Intervals are half-open.

### BKG — Booking & rules

| ID | Requirement | Priority |
|----|-------------|----------|
| BKG-001 | `book({ room, start, end, who })` returns a new booking id (a string). | Must |
| BKG-002 | Missing or empty `room` or `who` throws `BookingError` `invalid_input`. | Must |
| BKG-003 | `start`/`end` must match the format exactly, be real dates and times, have minutes in {00,15,30,45}, and `start` < `end`; else `invalid_time`. | Must |
| BKG-004 | Bookings are Monday–Friday, within 09:00–18:00 UTC, starting and ending on the same day; else `outside_hours`. | Must |
| BKG-005 | A booking lasts at most 4 hours; else `too_long`. | Must |
| BKG-006 | A room cannot hold two overlapping bookings (half-open: 10:00–11:00 and 11:00–12:00 do not overlap); else `overlap`. | Must |
| BKG-007 | A person (`who`) cannot hold two overlapping bookings in any rooms; else `person_busy`. | Must |
| BKG-008 | When both BKG-006 and BKG-007 apply, `overlap` is thrown. | Must |
| BKG-009 | `cancel(id)` removes a booking; an unknown id throws `not_found`. | Must |
| BKG-010 | Every rule violation throws `BookingError` whose `code` property is the name above. | Must |

### QRY — Queries

| ID | Requirement | Priority |
|----|-------------|----------|
| QRY-001 | `list(room, day)` returns the room's bookings on `day`, sorted by start, each `{ id, room, start, end, who }` with times in the input format. | Must |
| QRY-002 | `free(room, day)` returns the room's free intervals within opening hours (09:00–18:00) on `day`, sorted, each `{ start, end }`; adjacent bookings leave no gap between them. | Must |
| QRY-003 | On a Saturday or Sunday, `list` and `free` return empty arrays. | Must |

### PKG — Packaging & delivery

| ID | Requirement | Priority |
|----|-------------|----------|
| PKG-001 | Node.js 20 or later; standard library only (no npm dependencies). | Must |
| PKG-002 | Pure in-memory logic; no I/O. | Must |
| PKG-003 | `src/booking.js` exports `createBookings` and `BookingError`. | Must |
| PKG-004 | Own tests, runnable with `node --test` (`node:test`). | Must |
| PKG-005 | A README says how to use the library and run the tests. | Must |

### SEC — Input trust & integrity

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-001 | Validate every input of every public function; never throw a non-`BookingError` for bad caller input. | Must |
| SEC-002 | Never trust caller-supplied ids: they are looked up only as opaque keys, never used as object property paths. | Must |
| SEC-003 | A rejected operation leaves no partial state; callers cannot mutate stored bookings through returned values. | Must |

---

## 7. Constraints

| ID | Constraint | Explicit Impact on Technical Decisions |
|----|-----------|----------------------------------------|
| CON-001 | Node.js 20+ | Use only APIs present in 20; CommonJS interop matters ([ADR-001](./adr/ADR-001-commonjs-single-module.md)) |
| CON-002 | Standard library only | No parsing, date or test libraries; `node:test`, `node:assert`, `node:crypto` only |
| CON-003 | In-memory, no I/O | State lives in the `createBookings()` closure; no files, network, clock reads |
| CON-004 | UTC times in one exact text format | Strict parser, no `Date.parse`, no locale ([ADR-002](./adr/ADR-002-strict-parse-integer-minutes.md)) |
| CON-005 | API surface fixed by the spec | `book`, `cancel`, `list`, `free` only; no extra public methods without a founder decision |

---

## 8. Assumptions

Each is a default taken in a non-interactive run; the founder can overturn any (a change to an accepted default = a superseding ADR).

| ID | Assumption | Where recorded |
|----|-----------|----------------|
| A-01 | Ambition tier is Prototype / weekend (founder-confirmed). | transcript |
| A-02 | [ASSUMPTION] Module format is CommonJS (`module.exports = { createBookings, BookingError }`) so both `require` and `import` work on Node 20. | ADR-001 |
| A-03 | [ASSUMPTION] Check order for `book`: `invalid_input` → `invalid_time` → `outside_hours` → `too_long` → `overlap` → `person_busy`. The spec fixes only overlap > person_busy. | ADR-003 |
| A-04 | [ASSUMPTION] "Non-empty string" is literal: `''`, non-strings, `null`/`undefined` are invalid; whitespace-only is not trimmed or rejected. `room` and `who` are case-sensitive exact matches. | ADR-003 |
| A-05 | [ASSUMPTION] Missing or non-string `start`/`end` throws `invalid_time` (not `invalid_input`, which covers only `room`/`who`). | ADR-003 |
| A-06 | [ASSUMPTION] Non-object argument to `book` throws `invalid_input`. | ADR-003 |
| A-07 | [ASSUMPTION] `list`/`free`: invalid `room` → `invalid_input`; malformed or non-real `day` → `invalid_time`; both checked before the weekend shortcut. | ADR-003 |
| A-08 | [ASSUMPTION] Rooms are implicit (created by their first booking): `list` of an unknown room is `[]`; `free` of one is the whole opening window `[09:00, 18:00)` on a weekday. | ARCHITECTURE §5 |
| A-09 | [ASSUMPTION] `cancel` of a non-string id throws `not_found`. | ADR-003 |
| A-10 | [ASSUMPTION] Ids are opaque, library-generated (`crypto.randomUUID()`), never reused. | ADR-004 |
| A-11 | [ASSUMPTION] A booking ending exactly 18:00 is valid; one starting 09:00 is valid; exactly 4:00h is valid. | ARCHITECTURE §4 |
| A-12 | [ASSUMPTION] The "same day" rule is evaluated after `start < end`; an `end` on a later date (including 00:00 next day) is `outside_hours`. | ARCHITECTURE §4 |
| A-13 | [ASSUMPTION] Extra keys on the `book` argument are ignored. | ARCHITECTURE §3 |
| A-14 | [ASSUMPTION] A library has no deploy step; deploy state stops at `merged` (no DEPLOYMENT.md). | IMPLEMENTATION_PLAN |

---

## 9. Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Accepted overlapping bookings | 0 | Randomised invariant test (Phase 2 gate) |
| Rule cases throwing the specified `code` | all | Per-rule tests, evidence file `.keel/evidence/phase-N.json` |
| Runtime dependencies | 0 | Test asserting `package.json` has none |
| `node --test` | green on Node 20+ | CI-less: run locally (COMMANDS.md) |

---

## 10. Out of Scope — v1

- Persistence, storage, databases, I/O of any kind (the later app).
- UI, HTTP API, CLI.
- Time zones other than UTC; daylight-saving handling.
- Recurring bookings, rescheduling/updating a booking, holidays, per-room hours, room registry or capacity.
- Authentication, authorisation, user accounts.
- Concurrency across processes (single-threaded synchronous logic only).

---

## 11. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|-----------|--------|-----------|-------|
| RSK-001 | Inputs violating several rules at once surface a different `code` than a consumer or reviewer expects | Med | Med | Fixed, documented check order (ADR-003); precedence tests; README lists it | engineering |
| RSK-002 | Calendar/leap-year/year-range bugs let a fake date through (`2026-02-30`) | Med | High | Strict parser with round-trip validation, no `Date.parse` (ADR-002); table-driven tests incl. leap years | engineering |
| RSK-003 | The later app adds async storage and breaks the synchronous atomicity the no-double-booking guarantee rests on | Low | High | **Accepted residual risk**: revisit when persistence is designed; ARCHITECTURE §8 | founder |
| RSK-004 | Native-ESM consumers cannot import the named exports of a CommonJS module | Low | Low | Static object-literal `module.exports` supports `import { createBookings }` on Node 20; a Phase 0 test covers both `require` and `import` (ADR-001) | engineering |

---

## 13. Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| Node.js ≥ 20 | Runtime | `node:test`, `node:assert`, `node:crypto` only |

---

*End of BRD 0.1 — booking*
