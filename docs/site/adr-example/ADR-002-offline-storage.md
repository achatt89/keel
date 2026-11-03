# ADR-002 — Offline storage — SQLite on device, sync on reconnect

| | |
|---|---|
| **Status** | Proposed 2026-08-06 (Phase 1 scope) · Accepted 2026-08-11 · Built `4e1c9a2` 2026-08-25 |
| **Deciders** | founder (call) · engineering (design) |
| **Bounded by** | NFR-003, CON-002, ADR-001 |
| **Supersedes / superseded by** | — |
| **Phase** | Phase 1 |

## Context

Shoppers open their list in supermarkets with no signal, and NFR-003 says the list must open and
edit offline. A server-only store fails that, and the list is small enough to keep whole on the device.

## Decision

| | |
|---|---|
| **Decision** | In the context of lists used in shops with no signal, facing a server-only store or a full sync engine, we chose **SQLite on the device with a sync on reconnect** to achieve a list that always opens, accepting that two offline edits to one item resolve as last-write-wins. |
| **Revisit trigger** | Support sees more than 5 lost-edit reports a month. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Server only (status quo) | Simplest; one source of truth | Fails offline, breaks NFR-003 | ✗ |
| **SQLite on device, sync on reconnect** | Opens offline; small code | Last-write-wins on conflicts | ✓ |
| Sync engine (CRDT) | Merges every edit | New dependency; weeks of work | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | The list opens in airplane mode (DEPLOYMENT post-deploy check 4) |
| Harder | Conflicting offline edits need a clear "changed on another phone" note |
| Off the table | Real-time co-editing of one list |
| Build deviation | none — built as decided |
