# ADR-002 — Persistence — single JSON file with persisted nextId

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | founder (stack answer) · engineering (format) |
| **Bounded by** | CON-003, DAT-001..003, ADD-003 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

The founder specified one JSON file at `LEDGER_FILE` (default `./ledger.json`), no database. Ids must never be reused even after `remove`, so `max(id)+1` is not enough.

## Decision

| | |
|---|---|
| **Decision** | In the context of a one-user CLI, facing a database, an append-only event log, or one JSON document, we chose **one JSON document `{version, nextId, expenses[]}`** to achieve human-readable, dependency-free storage with never-reused ids, accepting whole-file rewrite on each mutation (ARCHITECTURE §3). |
| **Revisit trigger** | The file grows large enough that rewrite latency is noticeable, or a second writer appears (A-02). |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| SQLite / database | Queries, locking | Not stdlib-simple; against founder stack | ✗ |
| Append-only event log | Natural history | Replay logic; over-built | ✗ |
| **Single JSON document** | Simple, readable, diffable | Rewrite per write; no locking | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Trivial inspection and hand-repair; tiny code. |
| Harder | Concurrent writers can lose updates (accepted A-02); format needs a `version` field for future migration. |
| Off the table | Queryable history; multi-user access. |
| Build deviation | — (not yet built) |
