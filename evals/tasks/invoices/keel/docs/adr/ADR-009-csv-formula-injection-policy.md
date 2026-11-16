# ADR-009 — CSV formula injection — policy for names starting `= + - @`

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (reserved, Phase 2 (reserved)) |
| **Deciders** | founder · engineering |
| **Bounded by** | SEC-002, RSK-002, THR-001, OD-01 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 (reserved) |

## Context

Customer names are caller text written into a CSV opened in Excel; a leading `=`, `+`, `-`, `@` (or tab/CR) can run as a formula. Quoting per ADR-008 does not prevent it, and the accountant-confirmed format forbids other edits.

## Decision

| | |
|---|---|
| **Decision** | {{TBD — see OD-01. Recommended: reject such names at `addCustomer` (invalid_input), leaving the export format untouched.}} |
| **Revisit trigger** | decided when Phase 2 starts |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Reject at input (recommended) | export stays exactly as confirmed; fails early | a legitimate name starting with `-`/`+` is refused | — |
| Prefix `'` in the export | blocks execution | changes the accountant's data; not confirmed | — |
| Do nothing | as specified | formula execution risk | — |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | {{TBD}} |
| Harder | {{TBD}} |
| Off the table | {{TBD}} |
| Build deviation | {{TBD}} |
