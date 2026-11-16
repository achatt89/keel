# inventory — Product Requirements (PRD)

**Status:** Draft v0.1 · 2026-11-16 · Requirements: [BRD](./BRD.md)

## 1. Product

A JavaScript module API, `import { createInventory, InventoryError } from './src/inventory.js'`. No UI, no HTTP, no CLI. Each `createInventory()` call returns an independent, empty, in-memory inventory.

## 2. Personas

| Persona | Goal |
|---|---|
| Dana, app developer | Build the warehouse app without re-implementing stock rules; branch on `error.code` |
| Warehouse staff (later) | See correct stock, never be promised unavailable goods, know what to reorder |

## 3. Features

| ID | Feature | Satisfies | Priority | Phase |
|---|---|---|---|---|
| F-01 | Item catalogue: `addItem` | ITM-001..004 | Must | 1 |
| F-02 | Stock on hand: `receive`, `ship`, `stock` | STK-001..005 | Must | 1 |
| F-03 | Error contract: `InventoryError` + codes | ERR-001, ERR-002 | Must | 1 |
| F-04 | Order reservations: `reserve`, `release`, `fulfil` | RSV-001..004, RSV-007, RSV-008 | Must | 2 |
| F-05 | Availability: `available`; `ship` limited to available | RSV-005, RSV-006 | Must | 2 |
| F-06 | Movement history: `history` | MOV-001..004 | Must | 3 |
| F-07 | Reorder: `setReorderPoint`, `reorderReport` | ROP-001..005 | Must | 3 |
| F-08 | README + tests per phase | DLV-001, DLV-002 | Must | 1–3 |

## 4. Journeys and acceptance

| # | Journey | Acceptance (all `node --test`) |
|---|---|---|
| J-1 | Add an item, receive 10, ship 4 | `stock` = 6; shipping 7 more throws `insufficient_stock` and leaves stock 6 |
| J-2 | Reserve 5 for `ORD-1`, then ship 6 of 10 | `available` = 5; ship of 6 throws `insufficient_stock`; ship of 5 succeeds |
| J-3 | Reserve two lines where line 2 is short | Throws `insufficient_stock`; `available` of both SKUs unchanged; no movements added |
| J-4 | Fulfil `ORD-1` | `stock` falls by the reserved qty; `available` unchanged by fulfil; second `fulfil` throws `not_found` |
| J-5 | Reserve then release | `available` restored; `release` again throws `not_found` |
| J-6 | Set reorder point 10, available 4 | `reorderReport` lists `{ sku, available: 4, reorderPoint: 10, suggestedQty: 16 }` |
| J-7 | Read history after J-1 | Movements in `seq` order from 1: `receive`, `ship` |

## 5. Non-goals

See [BRD §7](./BRD.md#7-out-of-scope).

## 6. Roadmap

Phases 1, 2, 3 only, in order, one per session: [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md).
