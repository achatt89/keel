# ADR-001 — Runtime and scope — Node 20+ stdlib-only ESM, in-memory, metadata only

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (generation) · Accepted 2026-11-16 · Built: unverified — code not in tree (`OD-07`) |
| **Deciders** | founder |
| **Bounded by** | CON-001, CON-002, CON-005 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

The founder wants a dependency-free Node.js 20+ module that keeps only file metadata in memory for now. Content lives in object storage; persistence and HTTP come later.

## Decision

| | |
|---|---|
| **Decision** | In the context of a one-developer paid product that needs a small, auditable core, facing frameworks, a database or TypeScript, we chose **plain ES modules on Node 20+ with the standard library only, in-memory state and `node:test`** to achieve a minimal supply-chain and maintenance surface, accepting that state is lost on restart and there is no static typing (JSDoc shapes instead). |
| **Revisit trigger** | A persistence layer is needed (first paying customer, `RSK-006`) or a dependency is genuinely required. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| TypeScript + build step | Static types | Toolchain, dev dependency | ✗ |
| SQLite/DB now | Durable | Premature; deployment not planned | ✗ |
| **Plain ESM, stdlib, in-memory** | Zero deps; simple | Volatile; JSDoc only | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Nothing to install; `node --test` runs everything. |
| Harder | No types; persistence is future work behind the same API. |
| Off the table | npm dependencies, a build step. |
| Build deviation | none — built as decided |
