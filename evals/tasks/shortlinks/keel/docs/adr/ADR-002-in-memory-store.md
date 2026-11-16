---
id: ADR-002
status: Accepted
paths: ["src/store.js"]
check: test/store.test.js
---
# ADR-002 — Storage — in-memory `Map`, no persistence

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (founder answer; Phase 0 scope) |
| **Deciders** | founder (accepts data loss) · engineering (structure) |
| **Bounded by** | CON-02, A-01, RUN-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context
Storage is in memory; the founder accepts that a restart loses links. Codes come from user input, so the container must not be a plain object.

## Decision
| | |
|---|---|
| **Decision** | In the context of a prototype for one team, facing persistence-vs-simplicity, we chose **one `Map<code, link>` owned by each `createServer` call** to achieve isolation between test servers and zero setup, accepting total loss on restart. |
| **Revisit trigger** | Links must survive a restart (RSK-004), or memory use becomes a concern. |

## Options considered
| Option | Pros | Cons | |
|---|---|---|---|
| JSON file / SQLite | Survives restart | Out of spec; `node:sqlite` is newer than the Node 20 floor | ✗ |
| Module-level singleton | Simple | Tests share state; breaks the factory contract | ✗ |
| **`Map` per server instance** | Isolated, fast, no key-collision with `__proto__` | Volatile | ✓ |

## Consequences
| Consequence | Detail |
|---|---|
| Easier | Tests create a fresh server per case |
| Harder | Link count is uncapped (RSK-001) |
| Off the table | Sharing state across processes |
| Build deviation | none yet |
