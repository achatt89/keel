---
id: ADR-003
status: Accepted
paths: ["src/booking.js"]
check: test/precedence.test.js
---

# ADR-003 — Rule precedence — fixed check order in `book`

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (confirm, OD-01) · engineering |
| **Bounded by** | CNF-004, A-01, RSK-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

The spec fixes only `overlap` before `person_busy`; inputs often break several rules at once (e.g. a Saturday booking that is also 5h).

## Decision

| | |
|---|---|
| **Decision** | In the context of multi-rule failures, facing arbitrary order, we chose **`invalid_input` → `invalid_time` → `outside_hours` → `too_long` → `overlap` → `person_busy`** to achieve one deterministic, cheapest-first error, accepting that this order is our [ASSUMPTION] beyond the one pair the founder specified. |
| **Revisit trigger** | Founder resolves OD-01 differently, or a consumer test expects another order. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| **Shape → time validity → hours → length → room → person** | each check needs the previous one valid | assumed | ✓ |
| Conflicts before hours | — | needs valid times anyway | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Deterministic; each check can assume earlier ones passed. |
| Harder | Reordering later needs a superseding ADR. |
| Off the table | Collecting multiple errors. |
| Build deviation | — (fill at Built) |
