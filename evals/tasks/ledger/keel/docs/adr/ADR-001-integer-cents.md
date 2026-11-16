# ADR-001 — Money representation — integer cents

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (requirement) · engineering (design) |
| **Bounded by** | MNY-001, MNY-002, BO-01, RSK-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

The founder requires exact money that reconciles to the cent (BO-01) and a defined split of leftover cents (MNY-002). JavaScript numbers are binary floats, so decimal dollars cannot be summed exactly.

## Decision

| | |
|---|---|
| **Decision** | In the context of exact shared-expense arithmetic, facing float dollars, a decimal library, or BigInt, we chose **integer cents in plain Numbers** to achieve exact sums with zero dependencies, accepting a hard upper bound on amounts (BRD MNY-003: ≤ 10^12 cents). |
| **Revisit trigger** | A requirement for fractional cents, multiple currencies, or amounts above the bound. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Float dollars + rounding | Simplest | Drift; cannot guarantee reconcile | ✗ |
| **Integer cents (Number)** | Exact, stdlib, fast, JSON-native | Bounded range; parse/format at edges | ✓ |
| BigInt cents | Unbounded | Not JSON-serialisable natively; overkill | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Reconcile-to-the-cent is provable by a sum-to-zero property test. |
| Harder | Every input/output boundary must parse or format cents explicitly; no `parseFloat` anywhere. |
| Off the table | Fractional cents; any decimal-float shortcut. |
| Build deviation | — (not yet built) |
