---
id: ADR-002
status: Accepted
paths: ["src/inventory.js"]
check: test/atomicity.test.js
---

# ADR-002 — Errors — `InventoryError` with closed `code` set, validate-then-apply

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (codes) · engineering (order, atomicity) |
| **Bounded by** | ERR-001, ERR-002, NN-2, NN-3 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Callers branch on `error.code`. The spec fixes the codes but not which fires first when several rules break, nor what a failed call leaves behind.

## Decision

| | |
|---|---|
| **Decision** | In the context of calls that can break several rules at once, facing ad-hoc check order and partial writes, we chose **a fixed order (shape → existence → state, per LLD §4), no mutation before the last check, and no `seq` consumed on failure** to achieve predictable codes and all-or-nothing behaviour, accepting that checks run on a plan before any commit. |
| **Revisit trigger** | The founder specifies a different precedence (OD-01..OD-03). |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Apply while checking, roll back | no plan structure | rollback bugs, burned seq | ✗ |
| **Validate all, then apply** | atomic, simple to test | plan step for `reserve` | ✓ |
| Return `{ ok, error }` | no exceptions | contradicts spec (throws) | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Atomicity test: snapshot via API before/after a failing call. |
| Harder | Precedence is an assumption (BRD A-02) until confirmed. |
| Off the table | Partial success of `reserve`. |
| Build deviation | — |
