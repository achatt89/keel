---
id: ADR-004
status: Accepted
paths: ["src/server.js", "src/store.js"]
check: test/routing.test.js
---
# ADR-004 — Routing — shape-based 404/405 and `links` reserved

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (Phase 0 scope; details [ASSUMPTION]) |
| **Deciders** | engineering (mechanics) · founder (confirm the three defaults below) |
| **Bounded by** | RTE-001, RTE-002, LNK-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context
`/<code>` and `/links` share one namespace, so the valid custom code `links` (5 chars) would shadow the `/links` route. The spec also leaves open whether "known path" means "existing code" or "path shape".

## Decision
| | |
|---|---|
| **Decision** | In the context of a single-segment code namespace beside `/links`, facing ambiguous 404-vs-405, we chose **to classify by path shape (`/links`, `/links/<code>`, `/<code>` with `<code>` in `A-Za-z0-9_-`), answer 405 for any other method on a known shape, and treat `links` as a reserved code answered 409 `code_taken`** to achieve a deterministic, testable matrix, accepting that `POST /unknown-code` is 405, not 404. |
| **Revisit trigger** | The founder prefers 404 for unknown single-segment paths with a wrong method, or 400 `invalid_code` for the reserved word. |

## Options considered
| Option | Pros | Cons | |
|---|---|---|---|
| 405 only for existing codes | Closer to REST purists | Leaks code existence by method; more branches | ✗ |
| Reject `links` as `invalid_code` | Explicit | `links` matches the stated format, so the spec's `invalid_code` meaning is bent | ✗ |
| **Shape-based; `links` = `code_taken`** | Format rule stays exactly as specified; "already used" is true of `links` | `POST /x` is 405 | ✓ |

## Consequences
| Consequence | Detail |
|---|---|
| Easier | One pure `classify(method, pathname)` function; table-driven test |
| Harder | Three defaults to confirm (OD-01..OD-03) |
| Off the table | Percent-decoding of paths; `HEAD` support |
| Build deviation | none yet |
