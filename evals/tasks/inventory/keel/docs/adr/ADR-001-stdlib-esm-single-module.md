# ADR-001 — Runtime and packaging — Node 20, ESM, stdlib only, one module

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation, Phase 1 scope) |
| **Deciders** | founder (stack) · engineering |
| **Bounded by** | CON-001, CON-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | 1 |

## Context

The founder fixed the stack: Node.js 20+, standard library only, ES modules, in memory. The library is imported by a later app, so the surface must stay small.

## Decision

| | |
|---|---|
| **Decision** | In the context of a small stock library imported by a later app, facing a multi-file package or third-party helpers, we chose **one ES module `src/inventory.js` with `node:test` and no dependencies** to achieve zero supply-chain surface and a trivially auditable rule set, accepting that the file grows to hold all logic. |
| **Revisit trigger** | The file passes about 600 lines or a second consumer needs a subpath export. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Multiple files under `src/` | Smaller files | Spec names one entry file; more wiring | ✗ |
| Third-party validation/test libs | Less code | Violates CON-001 | ✗ |
| **One module, stdlib only** | Matches spec; auditable | One long file | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | No install step; `node --test` just runs. |
| Harder | Everything in one file needs clear section order (LLD §8). |
| Off the table | npm dependencies, build steps, CommonJS. |
| Build deviation | — (fill once at Built) |
