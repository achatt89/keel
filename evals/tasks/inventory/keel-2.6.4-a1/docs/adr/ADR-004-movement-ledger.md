---
id: ADR-004
status: Accepted
paths: ["src/inventory.js"]
check: test/history.test.js
---

# ADR-004 — Movement ledger — one global append-only list with a per-SKU index

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | founder · engineering |
| **Bounded by** | HST-001..HST-003 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 3 |

## Context

Every successful change must be recorded with one global sequence, one movement per line for order operations, in oldest-first order per SKU. The spec lists five types and no type for `addItem` or `setReorderPoint`.

## Decision

| | |
|---|---|
| **Decision** | In the context of an audit trail, facing per-SKU counters or one global counter, we chose **a single `seq` counter incremented per appended movement, frozen movement rows, and a per-SKU index for `history`**, to achieve the stated global ordering, accepting unbounded growth (ARCHITECTURE §7). `addItem` and `setReorderPoint` record no movement because no type exists for them; `fulfil` records `fulfil` rows only (no extra `ship`). |
| **Revisit trigger** | a movement type is added for item creation or reorder points |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Per-SKU counters | Simple | Contradicts "one counter for the whole inventory" | ✗ |
| **Global counter + SKU index** | Matches spec; O(k) history | Index to maintain | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Failed calls consume no `seq` (NFR-COR-003). |
| Harder | Ledger memory grows forever. |
| Off the table | Deleting or compacting movements. |
| Build deviation | — (not built yet) |
