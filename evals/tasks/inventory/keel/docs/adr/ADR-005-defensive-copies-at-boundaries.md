# ADR-005 — Boundaries — snapshot inputs, return copies

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation, Phase 1 scope) |
| **Deciders** | engineering |
| **Bounded by** | NN-1, NN-5, NFR-SEC-002, NFR-SEC-003 |
| **Supersedes / superseded by** | — / — |
| **Phase** | 1 |

## Context

Callers pass arrays and objects they may mutate later, and may pass getters or Proxies; the library also returns movements and reports.

## Decision

| | |
|---|---|
| **Decision** | In the context of an in-memory library with untrusted callers, facing storing and returning references, we chose **reading each caller property once into a local copy and returning fresh objects** to achieve state that callers cannot alter behind our back, accepting small copy costs. |
| **Revisit trigger** | Profiling shows copies dominate in the app's real workload. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Store/return references | Fast | Aliasing bugs corrupt stock | ✗ |
| Deep freeze everything | Safe returns | Does not protect inputs | ✗ |
| **Copy in, copy out** | Safe both ways | Allocation | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Validation and commit always see the same values. |
| Harder | Cost is linear in line count and history length. |
| Off the table | Handing out internal arrays or live objects. |
| Build deviation | — (fill once at Built) |
