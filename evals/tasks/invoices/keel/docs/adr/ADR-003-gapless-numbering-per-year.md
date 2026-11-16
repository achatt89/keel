# ADR-003 — Invoice numbers — `INV-<year>-NNNN`, gapless, never reused

| | |
|---|---|
| **Status** | Accepted 2026-11-16 · build unverified (OD-04) |
| **Deciders** | founder · engineering |
| **Bounded by** | NUM-001, NUM-002, CMP-001, OD-02 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

German rules require unique sequential numbers; the founder wants none missing, including voided invoices. A failed or invalid issue must not burn a number.

## Decision

| | |
|---|---|
| **Decision** | In the context of numbering legal documents, facing counters that advance before validation or reuse voided numbers, we chose **a per-year counter advanced only when the invoice is stored; void keeps the number** to achieve gapless sequences, accepting that the year basis and back-dating rules are still open (OD-02). |
| **Revisit trigger** | OD-02 is resolved, or numbering must span more than one ledger or process |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Counter advanced at request start | simple | a validation failure leaves a gap | ✗ |
| **Advance at successful store** | no gaps by construction | needs ordering discipline in one function | ✓ |
| Derive number from invoice count | no counter | breaks if anything is ever removed | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Gaplessness is testable: N issues → numbers 1..N, also after failures and voids |
| Harder | Back-dated invoice into a past year takes the next number of that year; sequence order ≠ date order |
| Off the table | Reusing or renumbering |
| Build deviation | pending — filled once, at Built |
