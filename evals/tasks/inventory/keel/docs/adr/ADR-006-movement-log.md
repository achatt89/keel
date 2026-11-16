# ADR-006 — History — one append-only global log with a single counter

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation, Phase 3 scope) |
| **Deciders** | engineering |
| **Bounded by** | MOV-001..004, NN-6, NFR-COR-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | 3 |

## Context

Every successful change must be a movement with a seq that is global across SKUs, starting at 1.

## Decision

| | |
|---|---|
| **Decision** | In the context of per-SKU history queries, facing per-SKU logs with per-SKU counters, we chose **one array of movements and one `nextSeq` incremented only inside `record`** to achieve a gapless global order, accepting that `history(sku)` filters the whole log. |
| **Revisit trigger** | `history` becomes slow on a real workload; add a per-SKU index then. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Per-SKU logs + counter each | Fast `history` | Violates single global seq | ✗ |
| **Global log, filter on read** | Gapless seq; simple | O(log) read | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Seq order equals the true order of changes. |
| Harder | `history` is O(total movements). |
| Off the table | Per-SKU sequence numbers; mutating or deleting past movements. |
| Build deviation | — (fill once at Built) |
