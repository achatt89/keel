---
id: ADR-001
status: Accepted
paths: ["src/inventory.js", "package.json"]
check: test/api-surface.test.js
---

# ADR-001 — Packaging — in-memory ES module with a `createInventory()` factory

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (stack) · engineering |
| **Bounded by** | CON-001, CON-002, CON-003 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

The founder fixed Node 20+, stdlib only, in-memory, ES modules, API `createInventory()`. State must not be shared between callers or tests.

## Decision

| | |
|---|---|
| **Decision** | In the context of a library imported by a later app, facing module-level singleton state or a class, we chose **a synchronous factory returning closure-private state** to achieve isolated instances and atomic calls, accepting that state cannot be inspected except through the API. |
| **Revisit trigger** | A persistence or async requirement appears. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Module singleton | simplest | shared state, untestable | ✗ |
| Class with public fields | familiar | internals reachable and mutable | ✗ |
| **Factory + closure** | isolation, privacy, synchronous atomicity | no subclassing | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Each test builds a fresh inventory; each sync call is atomic on the event loop. |
| Harder | Debugging needs the public API. |
| Off the table | Async API, shared global stock. |
| Build deviation | — |
