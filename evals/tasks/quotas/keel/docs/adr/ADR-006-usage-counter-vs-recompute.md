# ADR-006 — Usage tracking — running counter vs recompute from files

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (reserved, Phase 2 scope) · not yet Accepted |
| **Deciders** | engineering |
| **Bounded by** | QTA-003, QTA-005, QTA-007, RSK-007, A-05 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

The quota check needs a user's current usage on every write. It can be a stored counter updated with each mutation or the sum of the user's file sizes computed on demand.

## Decision

| | |
|---|---|
| **Decision** | In the context of an in-memory, synchronous store, facing O(1) counter vs O(files) recompute, we recommend **a running `usedBytes` counter changed only by the single internal mutation function, guarded by a test that compares it to the recomputed sum after random operation sequences**, accepting a drift risk that the test bounds. |
| **Revisit trigger** | The store becomes async or persistent (atomicity of check + mutate must be re-proven), or the counter test ever fails. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Recompute sum each write | No drift possible | O(n) per write | ✗ (acceptable at MVP scale; fallback) |
| **Counter + invariant test** | O(1); one mutation path | Drift risk (`RSK-007`) | ✓ (recommended) |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Constant-time quota check. |
| Harder | Every mutation must go through one function (`NN-5`). |
| Off the table | Mutating `files` directly. |
| Build deviation | — (Proposed: filled at Built) |
