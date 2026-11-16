# Product Requirements Document — inventory

**Version:** 0.1 · **Status:** Draft · Requirements live in [BRD.md](./BRD.md); this file maps them to API features.

## 1. Personas

| Persona | Need |
|---|---|
| **App developer** (primary) | A small, exact, well-documented API; stable error `code`s to branch on; no dependencies to vet |
| **Warehouse staff** (via the later app) | Correct counts; no double-promised stock; a reorder list |

## 2. Journeys

| Journey | Calls |
|---|---|
| Stock arrives | `addItem` → `receive` → `stock` |
| Order accepted | `reserve` (all lines or none) → `available` shows the lower number |
| Order picked | `fulfil` ships every line and closes the reservation |
| Order cancelled | `release` frees the held stock |
| Morning reorder check | `setReorderPoint` once per item → `reorderReport` |
| "What happened to this SKU?" | `history(sku)` |

## 3. Features

All features are Must. API contracts: [LLD.md](./LLD.md) §3; error codes: LLD §4.

| ID | Feature | Satisfies | Phase |
|---|---|---|---|
| F-01 | `addItem({ sku, name })` | ITM-001, ITM-002, ITM-003 | 1 |
| F-02 | `receive(sku, qty)` | ITM-004, GEN-003 | 1 |
| F-03 | `ship(sku, qty)` | ITM-005, RSV-005 | 1 (on hand), 2 (available) |
| F-04 | `stock(sku)` | ITM-006, GEN-004 | 1 |
| F-05 | `reserve(orderId, lines)` | RSV-001, RSV-002, RSV-003 | 2 |
| F-06 | `available(sku)` | RSV-004 | 2 |
| F-07 | `release(orderId)` | RSV-006 | 2 |
| F-08 | `fulfil(orderId)` | RSV-007 | 2 |
| F-09 | Movement ledger and `history(sku)` | HST-001, HST-002, HST-003 | 3 |
| F-10 | `setReorderPoint(sku, n)` | ROP-001 | 3 |
| F-11 | `reorderReport()` | ROP-002, ROP-003 | 3 |
| F-12 | `createInventory()` / `InventoryError` exports | GEN-001, GEN-002, GEN-005 | 1 |
| F-13 | README and own tests | DOC-001, DOC-002 | 1–3 (each phase) |

Acceptance for every feature: the rule in the BRD row holds exactly, each stated error code is thrown for its case and is covered by a test.

## 4. Non-goals

See BRD §10. In particular: no persistence, no async, no UI/HTTP/CLI.

## 5. Roadmap

Phase 1 items and stock → Phase 2 reservations → Phase 3 history and reorder. One phase per session; each ends with tests and README current ([IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)).

## 6. Product success metrics

Same as BRD §9 (one home).
