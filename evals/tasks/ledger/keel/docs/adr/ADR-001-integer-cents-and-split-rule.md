---
id: ADR-001
status: Proposed
paths: ["src/money.js", "src/balances.js"]
check: tests/money.test.js
---

# ADR-001 — Money representation — integer cents with alphabetical leftover

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (generation) |
| **Deciders** | founder (rule, from spec) · engineering (representation) |
| **Bounded by** | MON-001, MON-002, MON-003, BO-01, RSK-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Balances must reconcile to the cent, and floating point cannot represent most decimal amounts exactly. The spec fixes the leftover-cent rule (alphabetical), so only the representation is open.

## Decision

| | |
|---|---|
| **Decision** | In the context of exact money for a CLI, facing floats, a decimal library, or BigInt, we chose **plain integer cents parsed from the amount string** to achieve exactness with no dependency, accepting a documented per-expense maximum of 9,999,999.99 (MON-004). |
| **Revisit trigger** | A requirement for multiple currencies or amounts above the cap. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Floats, round at the end | Simplest | Drift, violates BO-01 | ✗ |
| **Integer cents (Number)** | Exact, stdlib, simple | Needs a cap; string parsing by hand | ✓ |
| BigInt cents | No cap | Awkward JSON, overkill | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Sum of balances is exactly 0; checked by a property-style test over many splits |
| Harder | Never call `parseFloat`/`Number()` on amounts; parse digits by regex |
| Off the table | Fractional cents, other currencies |
| Build deviation | — |
