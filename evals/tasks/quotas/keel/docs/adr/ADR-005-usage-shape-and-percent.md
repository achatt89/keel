# ADR-005 — usage() — floor percent from exact integers, null for unlimited

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (Phase 2 scope) · Accepted 2026-11-16 (founder) |
| **Deciders** | founder · engineering |
| **Bounded by** | QTA-006, BO-02 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

The app shows a percentage next to the plan; rounding up would show 100 % while the user can still write. After a downgrade from `team`, `used × 100` can exceed 2^53.

## Decision

| | |
|---|---|
| **Decision** | In the context of an account-page usage meter, facing `Math.round`/float division or capping, we chose **`percent = floor(used × 100 / limit)` computed with BigInt, `limitBytes` and `percent` `null` for `team`, unknown user `not_found`**, accepting a BigInt conversion on each call. Whether an over-limit user shows more than 100 is not decided here (`OD-03`; default: not capped). |
| **Revisit trigger** | The app needs a decimal percentage or a cap at 100. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| `Math.round` | Familiar | 99.99 % shows 100 (founder rejected) | ✗ |
| `Math.floor(used*100/limit)` floats | Short | Float error for large values | ✗ |
| **BigInt floor** | Exact | Slight overhead | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | 99.99 % shows 99; exactly full shows 100. |
| Harder | BigInt must be converted back with `Number()`. |
| Off the table | Fractional percent. |
| Build deviation | none — built as decided |
