# ADR-004 — Time — store UTC instants, derive the Berlin date with Intl

| | |
|---|---|
| **Status** | Proposed 2026-11-16 — engineering recommendation `[ASSUMPTION]`, to confirm against the built code (OD-04) before Accepted |
| **Deciders** | founder · engineering |
| **Bounded by** | CON-004, EXP-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 (storage) · Phase 2 (Berlin date) |

## Context

Issue time is a UTC timestamp but the business and the accountant think in Berlin dates (`2026-03-31T23:30:00Z` is `2026-04-01`). Stdlib only means no date library.

## Decision

| | |
|---|---|
| **Decision** | In the context of dates, facing local-time storage, offsets stored by hand and date libraries, we chose **UTC ISO strings stored, `Intl.DateTimeFormat` with `Europe/Berlin` for the date** to achieve DST-correct dates, accepting reliance on Node's ICU time-zone data. |
| **Revisit trigger** | Node ships without full ICU on a target machine (CI test of the 2026-03-31 case fails) |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Fixed +1/+2 offset by hand | no Intl | wrong around DST | ✗ |
| **Intl with Europe/Berlin** | correct, stdlib | depends on ICU | ✓ |
| Date library | convenient | violates ADR-007 | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | One helper owns the rule; tests cover both DST switches and year end |
| Harder | Node 20 official builds include full ICU |
| Off the table | Local-time `Date` getters (machine zone dependent) |
| Build deviation | pending — filled once, at Built |
