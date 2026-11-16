---
id: ADR-002
status: Proposed
paths: ["src/store.js"]
check: tests/store.test.js
---

# ADR-002 — Persistence — one JSON file with atomic writes

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (generation) |
| **Deciders** | founder (JSON file, from spec) · engineering (shape, atomic write) |
| **Bounded by** | DAT-001..004, CON-002, EXP-002, RSK-003, RSK-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

The spec mandates a JSON file at `LEDGER_FILE`. Ids must never be reused, which a plain array of expenses cannot guarantee after the highest id is removed.

## Decision

| | |
|---|---|
| **Decision** | In the context of a single-user local ledger, facing an array-only file, an append-only log, or a state object, we chose **a state object `{version, nextId, expenses}` saved via temp file + rename** to achieve never-reused ids and crash-safe writes, accepting no concurrent-writer safety. |
| **Revisit trigger** | Two people write the same file, or the file exceeds a few thousand expenses. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Array of expenses, id = max+1 | Minimal | Reuses id after removing the last | ✗ |
| Append-only event log | Full history | Replay complexity for a prototype | ✗ |
| **State object with `nextId`** | Simple, id rule exact | Slightly larger file shape | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Id rule is one counter; load validation is a few checks |
| Harder | File shape is a contract; hand edits must keep `nextId` above every id |
| Off the table | Concurrent writers, history of removed expenses |
| Build deviation | — |
