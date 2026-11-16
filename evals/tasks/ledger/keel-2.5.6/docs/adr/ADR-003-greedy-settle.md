# ADR-003 — Settlement — greedy largest-debtor / largest-creditor

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder |
| **Bounded by** | SET-001, SET-002, BO-02, RSK-003 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

The founder specified the settle algorithm exactly: repeatedly pair the person who owes the most with the person owed the most (ties by name) and transfer the smaller amount. It is simple and terminates, but is not guaranteed to minimise the transfer count.

## Decision

| | |
|---|---|
| **Decision** | In the context of settling a small group's balances, facing exact minimum-transfer search (NP-hard in general) or the founder's greedy rule, we chose **the greedy rule as specified** to achieve predictable, explainable output, accepting a possibly non-minimal transfer count. |
| **Revisit trigger** | Founder reports a real case where the output has visibly more transfers than necessary. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Exact minimum-transfer search | Provably fewest | Subset-sum complexity; unspecified | ✗ |
| **Greedy as specified** | Simple, deterministic, founder-defined | Not always minimal | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Deterministic output that tests can assert line by line; each step zeroes at least one person, so at most n−1 transfers. |
| Harder | Not optimal in contrived cases. |
| Off the table | Alternative orderings or tie-breaks. |
| Build deviation | — (not yet built) |
