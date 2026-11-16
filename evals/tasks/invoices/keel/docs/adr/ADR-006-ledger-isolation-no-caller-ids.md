# ADR-006 — Ledger state — closure-owned, generated ids, frozen copies out

| | |
|---|---|
| **Status** | Proposed 2026-11-16 — engineering recommendation `[ASSUMPTION]`, to confirm against the built code (OD-04) before Accepted |
| **Deciders** | founder · engineering |
| **Bounded by** | SEC-001, CUS-001, NUM-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Founder: never trust caller-supplied ids. Invoices are legal records, so a caller must not alter them by holding a reference or by supplying its own id/number.

## Decision

| | |
|---|---|
| **Decision** | In the context of an in-process library, facing shared mutable objects and caller-chosen ids, we chose **state in a closure over `Map`s, ids and numbers generated only by the ledger, deep-frozen copies returned** to achieve tamper-resistance against careless callers, accepting copy cost. |
| **Revisit trigger** | performance of copying becomes visible (it will not at this scale) |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Return internal objects | cheap | caller can edit issued invoices | ✗ |
| **Frozen copies, Maps** | safe, simple | copy on every read | ✓ |
| Class with private fields only | encapsulation | copies still needed for nested data | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | `Object.isFrozen` and mutation-attempt tests |
| Harder | Ids in inputs are lookup keys only |
| Off the table | A caller-supplied id or number on create |
| Build deviation | pending — filled once, at Built |
