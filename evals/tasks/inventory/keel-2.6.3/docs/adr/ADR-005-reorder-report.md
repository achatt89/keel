---
id: ADR-005
status: Accepted
paths: ["src/inventory.js"]
check: test/reorder.test.js
---

# ADR-005 — Reorder — computed on demand from `available` and a per-item point

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (formula) · engineering |
| **Bounded by** | ROP-001..003, BO-02 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 3 |

## Context

The report is "available at or below reorder point", suggested quantity "twice the point minus available", sorted by SKU; items without a point are never listed.

## Decision

| | |
|---|---|
| **Decision** | In the context of a reorder view, facing a stored/maintained list or on-demand computation, we chose **computing the report on each call from current `available`** to achieve always-fresh results, accepting O(n log n) per call. |
| **Revisit trigger** | Item counts make the report slow. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Maintain a flagged set | O(1) read | must update on every mutator | ✗ |
| **Compute on demand** | no drift | scans all items | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | No extra state to desync. |
| Harder | Sort uses plain code-unit order (SKUs are ASCII, so equals locale order). |
| Off the table | Reorder points of `null`/fractions; a point of 0 is valid and lists items at available 0. |
| Build deviation | — |
