---
id: ADR-004
status: Accepted
paths: ["src/inventory.js"]
check: test/history.test.js
---

# ADR-004 — History — single in-memory movement array, one global `seq`

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (shape) · engineering (storage) |
| **Bounded by** | HST-001..003, NN-3 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 3 |

## Context

Movements `{ seq, sku, type, qty }` (+ `orderId`) need one counter across the inventory, one row per line for order operations, oldest first per SKU.

## Decision

| | |
|---|---|
| **Decision** | In the context of audit history, facing per-SKU logs with separate counters or a global log, we chose **one append-only array with `seq` = index + 1, filtered by SKU in `history`** to achieve a gapless global order, accepting O(n) `history`. |
| **Revisit trigger** | `history` latency matters at the real warehouse's volume. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Per-SKU arrays + global counter | O(1) history | two structures | ✗ |
| **Global array, filter** | gapless, simple | O(n) per query | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | `seq` continuity is trivially testable; failure paths append nothing. |
| Harder | Large histories slow `history`; copies returned. |
| Off the table | Pruning or editing movements. |
| Build deviation | — |
