# ADR-001 — Money representation — integer cents

| | |
|---|---|
| **Status** | Proposed 2026-11-16 — engineering recommendation `[ASSUMPTION]`, to confirm against the built code (OD-04) before Accepted |
| **Deciders** | engineering |
| **Bounded by** | CON-001, INV-002, BO-01 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Invoices must be correct to the cent (BO-01) and JavaScript numbers are binary floats. Line prices and totals are euro amounts with two decimals.

## Decision

| | |
|---|---|
| **Decision** | In the context of money arithmetic in JavaScript, facing floats, decimal strings and BigInt, we chose **integer cents as safe integers** to achieve exact sums and rounding, accepting a bound check on every intermediate value. |
| **Revisit trigger** | an amount cannot stay inside Number.MAX_SAFE_INTEGER cents, or multi-currency is required |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Floating-point euros | simple | 0.1+0.2 class errors; breaks BO-01 | ✗ |
| **Integer cents (Number)** | exact, fast, stdlib, trivial to format | needs safe-integer guards | ✓ |
| BigInt cents | unbounded | awkward JSON (Phase 3), overkill | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Exact arithmetic; unit tests can assert equality, not tolerance |
| Harder | Every input and intermediate is bound-checked; formatting is hand-written |
| Off the table | Fractional cents; floats in any money path |
| Build deviation | pending — filled once, at Built |
