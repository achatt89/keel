# ADR-002 — Errors — one `InventoryError` with spec codes, fixed check order

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation, Phase 1 scope) |
| **Deciders** | founder (codes) · engineering (order) |
| **Bounded by** | ERR-001, ERR-002, NN-1, NN-3 |
| **Supersedes / superseded by** | — / — |
| **Phase** | 1 |

## Context

The founder named a code for each broken rule but not which fires when several apply (for example a bad quantity on an unknown SKU).

## Decision

| | |
|---|---|
| **Decision** | In the context of operations that can break several rules at once, facing arbitrary precedence, we chose **one class `InventoryError(code, message)` and the fixed order shape → qty → duplicate → lookup → state** to achieve predictable codes callers can test, accepting that some orderings are our assumption [ASSUMPTION]. |
| **Revisit trigger** | The founder states a different precedence (Open decision OD-02). |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Lookup before qty validation | Natural for some | Bad qty on unknown SKU reports `not_found` | ✗ |
| Several error classes | Fine-grained `instanceof` | Spec defines `code`, one class | ✗ |
| **Single class + fixed order** | Simple, deterministic | Order is our default | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Tests assert `error.code`; precedence is documented per method (LLD §4). |
| Harder | A caller wanting a different precedence must pre-validate. |
| Off the table | Throwing plain `Error`/`TypeError` for rule violations. |
| Build deviation | — (fill once at Built) |
