# ADR-004 — Argument parsing — {{TBD}}

| | |
|---|---|
| **Status** | Proposed (reserved for Phase 0, 2026-11-16) |
| **Deciders** | engineering |
| **Bounded by** | CON-001, VAL-002, VAL-003 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

Reserved for the build: how `cli.js` parses argv (e.g. `--note` anywhere, strict unknown-flag errors, `error:` prefix on every failure). Options below are the starting candidates, not a decision.

## Decision

| | |
|---|---|
| **Decision** | {{TBD — filled by the task that decides this}} |
| **Revisit trigger** | {{TBD}} |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Hand-rolled parser | {{TBD}} | {{TBD}} | |
| `node:util` `parseArgs` (strict) | {{TBD}} | {{TBD}} | |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | {{TBD}} |
| Harder | {{TBD}} |
| Off the table | {{TBD}} |
| Build deviation | — (not yet built) |
