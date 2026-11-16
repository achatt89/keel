---
id: ADR-003
status: Proposed
paths: ["src/cli.js", "src/errors.js", "src/validate.js"]
check: tests/cli.test.js
---

# ADR-003 — Error handling — throw CliError, one catch in cli.js

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | VAL-002, VAL-003, DAT-003 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

Every invalid input must print `error: ...` to stderr and exit 2, and no code path may leave partial output or a half-written file.

## Decision

| | |
|---|---|
| **Decision** | In the context of many validation sites, facing scattered `process.exit` calls, we chose **modules throw `CliError` (exit 2) or `DataError` (exit 1) and only `cli.js` prints and exits** to achieve one auditable exit path, accepting that output lines are collected and printed after the command succeeds. |
| **Revisit trigger** | A command needs streaming output. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| `process.exit(2)` at each site | Short | Untestable, partial output | ✗ |
| **Typed errors, single catch** | Testable, no partial output | Small boilerplate | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Unit tests assert thrown `CliError` messages; CLI tests assert exit code and empty stdout on error |
| Harder | Commands return output lines instead of printing |
| Off the table | Mixed output and errors in one run |
| Build deviation | — |
