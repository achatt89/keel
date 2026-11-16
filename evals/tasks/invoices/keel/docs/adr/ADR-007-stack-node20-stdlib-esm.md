# ADR-007 — Stack — Node 20+, standard library only, ES modules, node:test

| | |
|---|---|
| **Status** | Accepted 2026-11-16 · build unverified (OD-04) |
| **Deciders** | founder |
| **Bounded by** | CON-001, CON-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Founder: Node 20+, standard library only, `node:test`, ES modules, maintained for years as legal-document tooling.

## Decision

| | |
|---|---|
| **Decision** | In the context of a long-lived money library, facing dependency churn and supply-chain exposure, we chose **zero dependencies, ESM, `node --test`** to achieve a tiny auditable surface, accepting hand-written formatting and date code. |
| **Revisit trigger** | a stdlib gap (e.g. time zones) cannot be met correctly |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Third-party libs (decimal, date, CSV) | less code | supply chain, upgrades, years of maintenance | ✗ |
| **Stdlib only** | auditable, stable | more own code, more own tests | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | `package.json` has no dependencies — a gate |
| Harder | No linter/formatter unless added by a new ADR |
| Off the table | Any `npm install` |
| Build deviation | pending — filled once, at Built |
