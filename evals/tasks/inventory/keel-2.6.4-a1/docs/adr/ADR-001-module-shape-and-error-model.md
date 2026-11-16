---
id: ADR-001
status: Accepted
paths: ["src/inventory.js"]
check: test/errors.test.js
---

# ADR-001 — Module shape and error model — factory closure with InventoryError

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | founder · engineering |
| **Bounded by** | GEN-001, GEN-002, CON-002, CON-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

The founder fixed the exports (`createInventory`, `InventoryError`) and that every broken rule carries a `code`. Callers must be able to branch on `code` without parsing messages, and several instances must not share state.

## Decision

| | |
|---|---|
| **Decision** | In the context of a stdlib-only ES-module library, facing a class, a singleton or a factory, we chose **`createInventory()` returning an object of methods over closure-private state, with `InventoryError extends Error` carrying `code`**, to achieve isolated instances and no reachable internals, accepting that methods are own properties rather than a prototype. |
| **Revisit trigger** | a caller needs `instanceof Inventory` or subclassing |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Class with `#private` fields | Familiar; prototype methods | Spec names a factory; methods lose `this` when destructured | ✗ |
| **Factory + closure** | Matches spec; destructurable; no leaks | No prototype sharing | ✓ |
| Module-level singleton | Simplest | Shared state across tests/callers | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Tests build a fresh instance each; destructured methods work. |
| Harder | Cannot subclass an inventory. |
| Off the table | Singleton state. |
| Build deviation | — (not built yet) |
