# Product Requirements — inventory

Implements [BRD.md](BRD.md). Surface: a JavaScript module API; no UI.

## 1. Personas

| Persona | Need |
|---|---|
| Warehouse-app developer (primary) | A small, predictable, dependency-free API with precise error codes to branch on |
| Warehouse staff (later, via the app) | Not promised stock that is gone; a list of what to reorder |

## 2. Features

| ID | Feature | Priority | Requirements | Phase |
|---|---|---|---|---|
| F-01 | Item catalogue: `addItem` | Must | STK-002..STK-004 | 1 |
| F-02 | Stock movement: `receive`, `ship`, `stock` | Must | STK-005..STK-010 | 1 |
| F-03 | Reservations: `reserve`, `release`, `fulfil` | Must | RSV-001..RSV-004, RSV-006..RSV-008 | 2 |
| F-04 | Availability: `available`, ship limited to available | Must | RSV-005, RSV-009, RSV-010 | 2 |
| F-05 | Movement history: `history` | Must | HIS-001..HIS-006 | 3 |
| F-06 | Reorder: `setReorderPoint`, `reorderReport` | Must | ROR-001..ROR-006 | 3 |
| F-07 | Library surface: exports, typed errors, README, tests | Must | STK-001, SEC-001, DEL-001, DEL-002 | 1–3 |

## 3. Journeys (acceptance)

| # | Journey | Expected |
|---|---|---|
| J-1 | `addItem` → `receive 10` → `ship 4` → `stock` | 6 |
| J-2 | stock 10; `reserve ORD-1 [{A,8}]`; `ship A 5` | `insufficient_stock`; `available` = 2 |
| J-3 | `reserve ORD-2 [{A,1},{B,99}]` where B is short | `insufficient_stock`; A's available unchanged |
| J-4 | `reserve` → `fulfil` → `fulfil` again | stock down by the lines; second call `not_found` |
| J-5 | `reserve` → `release` → `available` | back to on hand |
| J-6 | any sequence → `history(sku)` | oldest first; `seq` strictly increasing, global, from 1 |
| J-7 | `setReorderPoint A 5`, available 3 → `reorderReport` | `{ sku:A, available:3, reorderPoint:5, suggestedQty:7 }` |

## 4. Non-goals

See BRD §6. Not a database, not an order system, not a UI.

## 5. Success

BO-03: every rule holds exactly as specified with the stated codes; reserved stock never ships twice (RSV-010). Verification: [NFR.md](NFR.md).
