# Business Requirements Document
## inventory — the stock-keeping library for a small warehouse

**Version:** 0.1 · **Date:** 2026-11-17 · **Author:** founder (via Keel) · **Status:** Draft — pending founder review of the assumptions in §8

Interview provenance: [keel-transcript.md](./keel-transcript.md) (Q-refs below point at its rounds).

---

## 1. Executive Summary

Orders are promised against stock that is already promised to other orders, and nobody knows when to reorder.

**inventory is a Node.js library that keeps exact stock counts, holds stock for orders so it cannot be promised twice, and says which items to reorder and how much.**

A developer calls `reserve('ORD-17', [{ sku: 'ABC-1234', qty: 3 }])`; the library either holds all three units or throws `insufficient_stock` and holds nothing. Later `fulfil('ORD-17')` ships them. The builder audience is the developer who will build the warehouse app on top; warehouse staff are the end users of that app, not of this library.

---

## 2. The Problem

**Double promises.** An order is accepted against stock that another order already holds, so one of them cannot be filled.

**Silent low stock.** Nothing tells the team an item is running low, so reorders happen late or by guesswork.

The result: lost sales and emergency purchasing; stock errors cost money (Q-A2).

---

## 3. Business Objectives

| ID | Objective | Success Metric | Measurement |
|----|-----------|----------------|-------------|
| BO-01 | Every rule holds exactly as specified, with the stated error codes | 100% of requirements in §6 have a passing test; each error code has a test that triggers it | `node --test` report; [NFR.md](./NFR.md) NFR-COR-001 |
| BO-02 | Reserved stock is never shipped twice | No sequence of calls lets shipped + reserved exceed received | Invariant test in [NFR.md](./NFR.md) NFR-COR-002 |
| BO-03 | The team learns what to reorder and how much | `reorderReport()` lists exactly the items at or below their reorder point with the stated quantity | Phase 3 tests, ROP-002 |

---

## 4. Market Positioning

Not applicable. Internal building block for one warehouse; no competitor benchmark was in scope (Q-A1). Target users: **Primary (v1):** developers building the warehouse app. **Secondary:** warehouse staff, through that app, later.

---

## 5. Stakeholder Map

| Stakeholder | Role | Primary Interest |
|-------------|------|------------------|
| Founder | Owns scope and priorities | Rules hold exactly as specified |
| App developers | Consume the module API | Predictable errors with stable `code` values |
| Warehouse team | End users of the later app | Correct counts; reorder signal |

---

## 6. Business Requirements

Prefixes: **GEN** cross-cutting · **ITM** items and stock · **RSV** reservations · **HST** history · **ROP** reorder · **SEC** input trust · **DOC** tests and README. Phase delivery: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) coverage map.

### GEN — Cross-cutting

| ID | Requirement | Priority |
|----|-------------|----------|
| GEN-001 | `src/inventory.js` exports `createInventory()` and the error class `InventoryError` | Must |
| GEN-002 | Every broken rule throws an `InventoryError` whose `code` is the stated name | Must |
| GEN-003 | Quantities are positive integers; otherwise `invalid_qty` | Must |
| GEN-004 | An unknown SKU is `not_found` | Must |
| GEN-005 | Node.js 20+, standard library only, pure in-memory, ES modules | Must |

### ITM — Items and stock (Phase 1)

| ID | Requirement | Priority |
|----|-------------|----------|
| ITM-001 | `addItem({ sku, name })`: `sku` matches `ABC-1234` (three capital letters, dash, four digits) else `invalid_sku` | Must |
| ITM-002 | `name` is a non-empty string else `invalid_input` | Must |
| ITM-003 | A SKU can be added once; again is `duplicate_sku` | Must |
| ITM-004 | `receive(sku, qty)` adds `qty` to stock on hand | Must |
| ITM-005 | `ship(sku, qty)` removes `qty` from stock on hand, never below zero (`insufficient_stock`) | Must |
| ITM-006 | `stock(sku)` returns the quantity on hand | Must |

### RSV — Reservations (Phase 2)

| ID | Requirement | Priority |
|----|-------------|----------|
| RSV-001 | `reserve(orderId, lines)`: `orderId` matches `ORD-` and digits else `invalid_order`; `lines` is a non-empty array of `{ sku, qty }` | Must |
| RSV-002 | All or nothing: if any line cannot be covered by the available quantity, nothing is reserved (`insufficient_stock`) | Must |
| RSV-003 | An order id that already holds a reservation is `duplicate_order` | Must |
| RSV-004 | `available(sku)` = stock on hand minus the quantity reserved | Must |
| RSV-005 | From phase 2 on, `ship` may use only the available quantity, never reserved stock (`insufficient_stock`) | Must |
| RSV-006 | `release(orderId)` drops the reservation; unknown or closed order is `not_found` | Must |
| RSV-007 | `fulfil(orderId)` ships every line (stock on hand goes down) and closes the reservation; unknown or closed is `not_found` | Must |

### HST — History (Phase 3)

| ID | Requirement | Priority |
|----|-------------|----------|
| HST-001 | Every successful change records a movement `{ seq, sku, type, qty }` plus `orderId` for order movements; `type` is `receive`, `ship`, `reserve`, `release` or `fulfil`; one movement per line for order operations | Must |
| HST-002 | `seq` is one counter for the whole inventory, starting at 1 | Must |
| HST-003 | `history(sku)` returns that SKU's movements, oldest first | Must |

### ROP — Reorder (Phase 3)

| ID | Requirement | Priority |
|----|-------------|----------|
| ROP-001 | `setReorderPoint(sku, n)`: `n` is an integer of 0 or more else `invalid_qty` | Must |
| ROP-002 | `reorderReport()` lists items whose available quantity is at or below their reorder point, sorted by SKU, each `{ sku, available, reorderPoint, suggestedQty }`; items without a reorder point are never listed | Must |
| ROP-003 | `suggestedQty` = 2 × reorder point − available | Must |

### SEC — Input trust

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-001 | Validate every input at the API boundary; never trust caller-supplied ids | Must |
| SEC-002 | The library keeps no reference to caller-owned objects and hands out no reference to its internal state | Must |

### DOC — Tests and README

| ID | Requirement | Priority |
|----|-------------|----------|
| DOC-001 | Own tests, runnable with `node --test` | Must |
| DOC-002 | README says how to use the library and run the tests | Must |

---

## 7. Constraints

| ID | Constraint | Explicit Impact on Technical Decisions |
|----|-----------|----------------------------------------|
| CON-001 | Node.js 20 or later | Use `node:test`; no syntax newer than Node 20 supports |
| CON-002 | Standard library only, no npm dependencies | No test runner, validator or lint packages; `package.json` has no `dependencies` |
| CON-003 | Pure in-memory; no persistence | State dies with the instance; persistence is the later app's concern |
| CON-004 | ES modules | `"type": "module"`, `import`/`export` only |
| CON-005 | Interface is a JavaScript module API; no UI, HTTP or CLI | No server, no bin entry |
| CON-006 | Three phases, in order, one per working session; each finished (tests, README) before the next starts | Plan has exactly Phases 1–3 |

---

## 8. Assumptions

| ID | Assumption | Source |
|----|-----------|--------|
| A-01 | Users are developers building the warehouse app; warehouse staff come later | transcript Q-A1 |
| A-02 | Stock errors cost money, so correctness outranks speed or convenience | transcript Q-A2 |
| A-03 | Data is SKUs, item names, quantities and order ids; nothing sensitive; no compliance regime applies | transcript Q-S1 |
| A-04 | Order-id reuse, duplicate-SKU lines, malformed lines, validation order and return values are design choices, not founder statements | [ADR-002](./adr/ADR-002-validation-order-and-input-handling.md), [ADR-003](./adr/ADR-003-reservation-model.md) |
| A-05 | No performance target: a small warehouse's data fits comfortably in memory | unvalidated |

---

## 9. Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Requirement test coverage | Every GEN/ITM/RSV/HST/ROP requirement has at least one passing test | Test names carry the requirement ID; Verify evidence |
| Error-code coverage | Every `code` in LLD §4 is triggered by a test | NFR-COR-001 |
| Double-ship protection | Zero violations across the invariant test | NFR-COR-002 |

---

## 10. Out of Scope — v1

- Persistence, multi-process or concurrent access, async APIs.
- UI, HTTP, CLI, authentication, multiple warehouses or locations.
- Cancelling partially fulfilled orders, partial fulfilment, backorders.
- Removing or editing items; changing an item's name.
- Cost, price, units of measure, lot or serial tracking.

---

## 11. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|-----------|--------|-----------|-------|
| RSK-001 | Phase 2 changes `ship` semantics; a Phase 1 test then fails or hides a regression | Med | High | Phase 2 keeps every Phase 1 test green; `ship` rule in [ADR-003](./adr/ADR-003-reservation-model.md) | engineering |
| RSK-002 | A partly applied `reserve` or `fulfil` leaves stock and reservations inconsistent | Low | High | [ADR-005](./adr/ADR-005-validate-then-commit.md) | engineering |
| RSK-003 | Spec ambiguities resolved by assumption differ from the founder's intent | Med | Med | Each assumption is an open decision (OD-01..OD-04 in [adr/README.md](./adr/README.md)) for founder confirmation | founder |
| RSK-004 | Callers mutate returned data or pass hostile ids and corrupt state | Low | High | SEC-001, SEC-002; [ADR-002](./adr/ADR-002-validation-order-and-input-handling.md) | engineering |
