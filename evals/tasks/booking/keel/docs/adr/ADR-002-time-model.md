---
id: ADR-002
status: Accepted
paths: ["src/time.js"]
check: test/time.test.js
---

# ADR-002 — Time model — strict parse to integer UTC minutes

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | TIM-001, TIM-002, TIM-003, RSK-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

Timestamps are strings that must be real UTC dates; `Date` silently rolls `2026-02-30` into March. Overlap and length maths need a plain comparable number.

## Decision

| | |
|---|---|
| **Decision** | In the context of strict timestamp validation, facing `Date.parse`, regex-only checks, or hand-rolled calendar maths, we chose **an exact regex plus range checks and a day-count table, converting to integer minutes since the epoch (via `Date.UTC` on already-validated parts)** to achieve no silent rollover and trivial interval comparison, accepting a small helper module. |
| **Revisit trigger** | A year range beyond 0001–9999 is ever required. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| `new Date(str)` / `Date.parse` | short | accepts rollover and other formats | ✗ |
| Regex only | short | accepts `02-30`, `24:00` | ✗ |
| **Regex + explicit range/leap check → minutes** | exact, comparable | ~40 lines | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Half-open maths is integer compare; formatting back is exact. |
| Harder | Leap-year rule is ours to test. |
| Off the table | Locale/zone-dependent parsing. |
| Build deviation | — (fill at Built) |
