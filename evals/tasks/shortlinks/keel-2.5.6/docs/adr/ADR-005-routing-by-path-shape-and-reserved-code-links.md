# ADR-005 — Routing — path shape decides 404 vs 405; `links` is a reserved code

| | |
|---|---|
| **Status** | Proposed 2026-11-16 — `[ASSUMPTION]`; implement as written unless the founder overrides |
| **Deciders** | engineering |
| **Bounded by** | VAL-005, LNK-002, PRD.md §4 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 (routing) · Phase 1 (reserved code) |

## Context

"A known path with the wrong method is 405" needs a definition of *known*. `/<code>` matches every single-segment path, and the valid custom code `links` would collide with `/links`.

## Decision

| | |
|---|---|
| **Decision** | In the context of pattern-style routes, facing "known = existing resource" vs "known = matches a route shape", we chose **route shape**: `/links` (POST), `/links/<seg>` (GET, DELETE) and `/<seg>` (GET) are known; any other method on them is 405; every other path is 404; no percent-decoding, query string ignored; and the code `links` is rejected with 409 `code_taken` — to achieve a stateless, predictable 404/405 split and no unreachable link, accepting that `POST /unknowncode` is 405 rather than 404. |
| **Revisit trigger** | A new route is added (re-derive the matrix and reserved words). |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| 405 only if the code exists | "more REST" | the answer depends on stored state; leaks existence | ✗ |
| **Route shape** | stateless, simple matrix test | `POST /x` is 405 even for unknown `x` | ✓ |
| Allow `links` as a code | no special case | the link would be unreachable at `GET /links` (405) | ✗ |
| Reject `links` with 400 `invalid_code` | no new meaning for 409 | the code is syntactically valid per the spec | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Routing is a pure function of method + path |
| Harder | Any future top-level route must be added to the reserved list |
| Off the table | A short link literally named `links` |
| Build deviation | *(filled at Built)* |
