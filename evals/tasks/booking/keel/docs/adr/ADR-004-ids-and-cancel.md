---
id: ADR-004
status: Accepted
paths: ["src/booking.js"]
check: test/cancel.test.js
---

# ADR-004 — Ids — minted internally, never reused, lookup only

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | INP-002, A-03, A-05, RSK-005 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Founder rule: never trust caller-supplied ids. `cancel(id)` receives arbitrary values.

## Decision

| | |
|---|---|
| **Decision** | In the context of untrusted ids, facing UUIDs, counters, or caller-chosen ids, we chose **an internal monotonic counter (`b1`, `b2`, …, never reused) looked up in a `Map`** to achieve deterministic ids that grant nothing beyond their own cancel and no prototype-key hazards, accepting predictable ids in a library with no auth. |
| **Revisit trigger** | The later app needs ids to be unguessable or externally stable. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Caller-supplied ids | simple | violates founder rule | ✗ |
| `crypto.randomUUID()` | opaque | env randomness (P-05), no gain | ✗ |
| **Internal counter + `Map`** | deterministic, safe | predictable | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Deterministic tests; `cancel("__proto__")` is just `not_found`. |
| Harder | Authorization is the app's job. |
| Off the table | Reusing an id after cancel. |
| Build deviation | — (fill at Built) |
