# ADR-004 — Reservations — per-order line ledger plus per-SKU reserved totals

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation, Phase 2 scope) |
| **Deciders** | engineering |
| **Bounded by** | RSV-003..008, NFR-COR-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | 2 |

## Context

Availability and shipping both need the reserved quantity per SKU, and `release`/`fulfil` need the original lines of an order.

## Decision

| | |
|---|---|
| **Decision** | In the context of reservations, facing recomputing reserved totals by scanning every order, we chose **a `Map<orderId, lines>` plus a `Map<sku, reservedQty>` updated together in the commit step** to achieve O(1) `available`, accepting two structures that must stay in step. |
| **Revisit trigger** | The reserved-total map is ever found out of step with the ledger in a test. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Scan all orders per call | One structure | O(orders) per read | ✗ |
| **Ledger + totals** | O(1) reads | Two structures | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | `available` and `ship` checks are constant time; invariant is testable (NFR-COR-001). |
| Harder | Every ledger change must touch both maps in one commit step. |
| Off the table | Storing references to caller line objects (lines are copied, ADR-005). |
| Build deviation | — (fill once at Built) |
