# ADR-001 — Runtime & storage — Node 20 stdlib, CommonJS, in-memory Map

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (stack is founder-mandated; CommonJS and crypto are engineering calls) |
| **Deciders** | founder (stack, storage) · engineering (module format, code generation) |
| **Bounded by** | CON-001, CON-002, CON-003, CON-004, DLV-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

The founder fixed Node 20+, `node:http` only, in-memory storage, and a `createServer(options)` export that may be loaded by tests we do not control. The module format is unspecified, and a test file may use `require` or `import`.

## Decision

| | |
|---|---|
| **Decision** | In the context of a stdlib-only service whose factory may be loaded via `require` or `import`, facing CommonJS vs ES modules, we chose **CommonJS** (`module.exports = { createServer }`, no `"type": "module"`), a `Map` store, `node:crypto` `randomInt` for codes and `node:test` for tests, to achieve loadability from both `require()` and `import` on every Node ≥ 20, accepting that source uses `require` rather than `import`. |
| **Revisit trigger** | Node 22+ becomes the minimum (then `require(esm)` is stable) and a reason to prefer ESM appears. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| ES modules | modern syntax | `require()` of an ESM file fails on Node 20 | ✗ |
| **CommonJS** | works with `require` and (named-export detection) `import {createServer}` | older syntax | ✓ |
| `Math.random` for codes | trivial | predictable codes | ✗ |
| **`crypto.randomInt`** | unbiased, stdlib | slightly more code | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | One module format; guardrail test can assert `package.json` has no deps and `src/` imports only `node:` or relative paths |
| Harder | Export must stay a literal `module.exports = { createServer }` so `import` named-export detection keeps working |
| Off the table | Persistence, multi-process sharing, any npm package |
| Build deviation | *(filled at Built)* |
