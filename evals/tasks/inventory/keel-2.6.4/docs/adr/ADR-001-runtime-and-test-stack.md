---
id: ADR-001
status: Accepted
paths: [package.json, src/**, test/**]
check: test/maintainability.test.js (NFR-MNT-001, NFR-MNT-002)
---

# ADR-001 — Runtime and test stack — Node 20 ESM, stdlib, node:test

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | founder (call) · engineering (design) |
| **Bounded by** | CON-001, CON-005 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

The founder fixed Node.js 20+, standard library only, ES modules, and `node --test`. The library is imported by a later app, so any dependency would be inherited by it.

## Decision

| | |
|---|---|
| **Decision** | In the context of a small library imported by a later warehouse app, facing third-party test runners and utility packages, we chose **Node 20+ ES modules with no dependencies and `node:test`** to achieve zero install surface and a stable import, accepting hand-written validation and no lint tooling. |
| **Revisit trigger** | The app needs a feature the standard library lacks, or the Node 20 floor blocks a consumer. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Third-party deps (lodash, jest, a validator) | Less code | Install surface, supply chain, version drift | ✗ |
| **Stdlib only, `node:test`** | Nothing to install or audit | Validators written by hand | ✓ |
| CommonJS | Wider legacy reach | Founder chose ESM | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Clone and `node --test`; nothing to audit. |
| Harder | No linter or type-checker; discipline lives in tests (NFR-MNT-*). |
| Off the table | Any `npm` dependency, TypeScript build step, bundler. |
| Build deviation | — (filled at Built) |
