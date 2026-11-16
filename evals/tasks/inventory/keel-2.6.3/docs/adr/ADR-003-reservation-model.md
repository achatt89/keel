---
id: ADR-003
status: Accepted
paths: ["src/inventory.js"]
check: test/invariant.test.js
---

# ADR-003 — Reservations — per-item `reserved` total plus open-order map

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (rules) · engineering (structure) |
| **Bounded by** | BO-01, RSV-003, RSV-005..008, RSK-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

Reserved stock must never be shipped twice, and `ship` may only use the available quantity from phase 2 on.

## Decision

| | |
|---|---|
| **Decision** | In the context of orders holding stock, facing recomputing reserved from all orders on each call or storing only per-order lines, we chose **a stored `reserved` total per item plus an `orders` map of open reservations (lines copied in)** to achieve O(1) `available` and a single check shared by `ship` and `reserve`, accepting that both structures must change together inside one commit step. |
| **Revisit trigger** | Partial release/fulfilment is requested. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Recompute from orders | no drift | O(orders) per call | ✗ |
| **Stored total + orders map** | fast, simple | two things to keep in sync | ✓ |
| Orders only | one structure | `ship` needs scan | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | `available = onHand − reserved` everywhere; invariant `0 ≤ reserved ≤ onHand` is testable by API. |
| Harder | Sync of total and map; guarded by test/invariant.test.js (random op sequences). |
| Off the table | Partial release; reusing a live order id (`duplicate_order`). |
| Build deviation | — |
