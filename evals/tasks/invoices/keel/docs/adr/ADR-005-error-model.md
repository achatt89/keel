# ADR-005 — Errors — `InvoiceError` with a closed `code` set

| | |
|---|---|
| **Status** | Accepted 2026-11-16 · build unverified (OD-04) |
| **Deciders** | founder · engineering |
| **Bounded by** | ERR-001, SEC-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 · Phase 2 adds invalid_range |

## Context

Scripts and the accountant workflow need stable, machine-checkable failures. Founder fixed the codes for Phase 1 and added `invalid_range` for the export.

## Decision

| | |
|---|---|
| **Decision** | In the context of failure reporting, facing generic errors or result objects, we chose **throwing `InvoiceError` with `code` ∈ {invalid_input, invalid_date, not_found, already_void, invalid_range}** to achieve a stable contract, accepting that adding a code is a documented change. |
| **Revisit trigger** | a caller needs non-exception results (e.g. batch validation reports) |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Plain `Error` with messages | nothing to build | callers parse text | ✗ |
| **`InvoiceError` + code** | stable, idiomatic | closed set to maintain | ✓ |
| Result objects `{ok,error}` | explicit | unlike the founder's spec | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Tests assert `err.code` |
| Harder | New code = LLD §7 + CHANGELOG |
| Off the table | Throwing other error types for caller mistakes |
| Build deviation | pending — filled once, at Built |
