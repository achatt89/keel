# ADR-003 — Plan limits — decimal GB in one table, units.js stays binary

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (Phase 2 scope) · Accepted 2026-11-16 (founder, confirmed against the pricing page) |
| **Deciders** | founder |
| **Bounded by** | QTA-001, QTA-008, CON-003, CON-004, BO-02 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

The pricing page states GB as 1,000,000,000 bytes: free 2 GB, pro 200 GB, team unlimited. The existing `units.js` helper is binary (1,073,741,824) and feeds the summary line.

## Decision

| | |
|---|---|
| **Decision** | In the context of limits that must equal the pricing page, facing reuse of the binary helper or a binary GiB definition, we chose **a single frozen table `PLAN_LIMITS_BYTES` in `plans.js` (free 2,000,000,000; pro 200,000,000,000; team `null`) and a decimal `GB` constant, with `units.js` never used for limits**, accepting that the summary line and the limits use different bases (`RSK-002`). |
| **Revisit trigger** | The pricing page changes a limit or the unit definition. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Reuse `units.js` (binary) | One helper | Limits ~7 % larger than the page; wrong | ✗ |
| Limits inline in `store.js` | Fewer files | Numbers scattered; hard to test against the page | ✗ |
| **`plans.js` table, decimal GB** | One home; testable | Two unit bases in the codebase | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | One test pins the pricing figures (`NFR-CORR-001`). |
| Harder | Summary vs limits mismatch risk (`OD-02`). |
| Off the table | Any limit expressed in GiB or via `units.js`. |
| Build deviation | none — built as decided |
