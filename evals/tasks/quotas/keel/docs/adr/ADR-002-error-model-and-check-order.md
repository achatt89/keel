# ADR-002 — Error model — one StoreError with closed codes and a fixed check order

| | |
|---|---|
| **Status** | Proposed 2026-11-16 · Accepted 2026-11-16 (founder: order and `quota_exceeded` shape) · Built: Phase 1 codes unverified (`OD-07`); `quota_exceeded` Phase 2 |
| **Deciders** | founder · engineering |
| **Bounded by** | ERR-001, ERR-002, QTA-004, QTA-005 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1, 2 |

## Context

Callers (and later HTTP) need stable machine-readable failures; the same call can be wrong in several ways at once. The founder fixed the order: unknown user, then bad input, then quota.

## Decision

| | |
|---|---|
| **Decision** | In the context of a module whose errors become API responses, facing ad-hoc messages or error subclasses per case, we chose **a single `StoreError` with `code` in `invalid_input | not_found | quota_exceeded`, an optional `details` object only on `quota_exceeded` (`{ limitBytes, usedBytes, requestedBytes }`), and the check order not_found → invalid_input → quota_exceeded**, accepting that a new failure class needs a new ADR. |
| **Revisit trigger** | Phase 3 scoping, when HTTP status mapping is decided. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Subclass per error | `instanceof` checks | More surface; HTTP maps by code anyway | ✗ |
| Return result objects | No throws | Callers can ignore failures; breaks Phase 1 contract | ✗ |
| **One class + codes + details** | Simple, serialisable | Closed set must be policed | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Support reads `details` to explain a refusal (`BO-03`). |
| Harder | Every method must keep the same order (`NN-4`). |
| Off the table | Per-case exception classes; message-text matching. |
| Build deviation | none — built as decided |
