---
id: ADR-003
status: Accepted
paths: ["src/inventory.js"]
check: test/reservations.test.js
---

# ADR-003 — Reservation model — per-order lines plus a per-SKU reserved sum

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | founder · engineering |
| **Bounded by** | RSV-001..RSV-007, RSK-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

Stock reserved for one order must be invisible to `ship`, `available` and other reservations, and `fulfil` must turn a hold into a shipment exactly once. The spec does not say whether a closed order id may be reserved again, nor how two lines for one SKU in one order are covered.

## Decision

| | |
|---|---|
| **Decision** | In the context of promised-twice stock, facing counting reservations on demand or keeping a running sum, we chose **a `reservations` map of stored line copies plus a `reserved` per-SKU sum, with `available = onHand - reserved`, `ship` limited to available, and `fulfil` decreasing both on hand and reserved**, to achieve O(1) `available` and no double ship, accepting two structures that must change together (ADR-005). [ASSUMPTION] An order id that no longer holds a reservation (released or fulfilled) may be reserved again; lines for the same SKU in one order are covered by their summed qty and stay separate lines. |
| **Revisit trigger** | the founder wants closed order ids retired for good (OD-01) |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Recompute reserved by scanning reservations | One structure | O(orders) per `available` | ✗ |
| **Reserved sum kept beside the map** | O(1) reads | Must stay in sync | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | NFR-COR-002 invariant test guards the sync. |
| Harder | Two structures to keep consistent. |
| Off the table | Reserving partial lines; partial fulfilment. |
| Build deviation | — (not built yet) |
