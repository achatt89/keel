---
id: ADR-002
status: Accepted
paths: ["src/inventory.js"]
check: test/errors.test.js
---

# ADR-002 — Validation order and input handling — arguments first, then state, fail on first

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | founder · engineering |
| **Bounded by** | GEN-003, GEN-004, SEC-001, SEC-002, RSK-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

The spec names the error codes but not which wins when two rules break, nor the code for malformed lines or order ids passed to `release`/`fulfil`. Several choices below are [ASSUMPTION]s awaiting founder confirmation (OD-02, OD-03, OD-04 in the index).

## Decision

| | |
|---|---|
| **Decision** | In the context of a spec with overlapping rules, facing ad-hoc or state-first checking, we chose **validating argument shape and values first and state second, throwing on the first failure in the order in LLD §4**, to achieve predictable codes, accepting that `receive("nope", 0)` is `invalid_qty`, not `not_found`. |
| **Revisit trigger** | the founder states a different precedence |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| State first, then values | Natural lookup flow | Hides bad-input bugs behind `not_found` | ✗ |
| **Values first, then state** | Deterministic; input errors never depend on state | Rare double-fault case reports the input error | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | One table in LLD §4 is the whole precedence rule; tests follow it. [ASSUMPTIONS] recorded here: (a) a lines argument that is not a non-empty array, or a line that is not an object with a string `sku`, is `invalid_input`; (b) any SKU that is not a known SKU, including a malformed or non-string one, is `not_found` outside `addItem`; (c) a malformed order id passed to `release`/`fulfil` is `not_found`; (d) quantities must be safe integers; (e) `name` is non-empty by length, not trimmed, stored as given; (f) mutators return `undefined`. |
| Harder | Callers cannot tell "bad SKU format" from "unknown SKU" outside `addItem`. |
| Off the table | Reporting `invalid_sku` from lookups; returning values from mutators. |
| Build deviation | — (not built yet) |
