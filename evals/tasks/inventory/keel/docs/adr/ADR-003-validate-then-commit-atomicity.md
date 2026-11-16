# ADR-003 — Atomicity — validate everything, then commit without throwing

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation, Phase 1 scope) |
| **Deciders** | engineering |
| **Bounded by** | RSV-003, NN-2, NFR-COR-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | 1 |

## Context

`reserve` must reserve all lines or none, and a failed call must not consume a `seq` or leave partial stock changes.

## Decision

| | |
|---|---|
| **Decision** | In the context of multi-line operations, facing apply-and-roll-back, we chose **a validate phase that computes everything first, then a commit phase made only of plain assignments** to achieve all-or-nothing with no rollback code, accepting that commit logic must stay trivially non-throwing. |
| **Revisit trigger** | A commit step ever needs an operation that can throw. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Apply then roll back | Simple happy path | Rollback bugs leave partial state | ✗ |
| Copy state, mutate copy, swap | Safe | Copies whole inventory each call | ✗ |
| **Validate then commit** | No rollback; cheap | Discipline required | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Failure paths need no cleanup; snapshot tests are easy. |
| Harder | Commit code stays free of validation and allocation that can fail. |
| Off the table | Partial reservations; gaps in `seq`. |
| Build deviation | — (fill once at Built) |
