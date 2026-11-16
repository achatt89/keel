---
id: ADR-001
status: Accepted
paths: ["src/**", "package.json"]
check: none
---
# ADR-001 — Runtime and HTTP layer — Node 20 standard library only

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (founder spec; Phase 0 scope) |
| **Deciders** | founder (constraint) · engineering (shape) |
| **Bounded by** | CON-01, RUN-001, RUN-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context
The founder requires Node.js 20+, `node:http` only, no npm dependencies, no frameworks. `createServer(options)` must return a Server that is not yet listening.

## Decision
| | |
|---|---|
| **Decision** | In the context of a one-team prototype, facing framework-vs-stdlib, we chose **`node:http` + `node:test` + `node:crypto`, with a hand-written router and a `createServer(options)` factory** to achieve zero dependencies and a trivially testable server, accepting a small amount of routing/body-parsing code. |
| **Revisit trigger** | The hand-written router exceeds ~10 routes or needs middleware. |

## Options considered
| Option | Pros | Cons | |
|---|---|---|---|
| Express / Fastify | Less routing code | Violates CON-01 | ✗ |
| **`node:http` + factory** | No deps; meets spec; tests bind an ephemeral port | Manual body reading and routing | ✓ |

## Consequences
| Consequence | Detail |
|---|---|
| Easier | No install step, no audit surface; `node --test` needs nothing else |
| Harder | Body size cap and JSON parsing are ours to get right (ARCHITECTURE §6) |
| Off the table | Middleware ecosystems, schema libraries |
| Build deviation | none yet |
