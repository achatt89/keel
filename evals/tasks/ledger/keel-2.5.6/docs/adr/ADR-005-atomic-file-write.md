# ADR-005 — File write strategy — {{TBD}}

| | |
|---|---|
| **Status** | Proposed (reserved for Phase 0, 2026-11-16) |
| **Deciders** | engineering |
| **Bounded by** | DAT-004, A-02 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

Reserved for the build: how `store.save` avoids leaving a half-written ledger (e.g. temp file + rename in the same directory). Options below are the starting candidates, not a decision.

## Decision

| | |
|---|---|
| **Decision** | {{TBD — filled by the task that decides this}} |
| **Revisit trigger** | {{TBD}} |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Temp file + rename | {{TBD}} | {{TBD}} | |
| Direct `writeFileSync` | {{TBD}} | {{TBD}} | |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | {{TBD}} |
| Harder | {{TBD}} |
| Off the table | {{TBD}} |
| Build deviation | — (not yet built) |
