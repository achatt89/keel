# ADR-004 — Booking ids — library-generated opaque ids in a Map

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | SEC-002, BKG-001, BKG-009, A-10 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

`book` returns an id string and `cancel(id)` takes one back from an untrusted caller. A plain-object store keyed by that id is exposed to `__proto__`/`constructor` keys; sequential ids invite guessing and reuse.

## Decision

| | |
|---|---|
| **Decision** | In the context of caller-supplied ids reaching `cancel`, facing a plain object store, a counter, or UUIDs, we chose **`crypto.randomUUID()` ids stored in a `Map` and looked up only after a `typeof === 'string'` check** to achieve unforgeable, never-reused ids with no property-path risk, accepting a dependency on `node:crypto` (standard library). |
| **Revisit trigger** | The later app needs human-readable or persisted ids. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Counter (`b-1`) in an object | simple, readable | guessable; id reuse across stores; `__proto__` risk | ✗ |
| Counter in a `Map` | no prototype risk | guessable, collides across `createBookings()` instances | ✗ |
| **`randomUUID()` in a `Map`** | unique, opaque | not human-friendly | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | A cancelled id can never refer to a later booking; instances never collide |
| Harder | Tests cannot predict ids; they take them from `book`'s return value |
| Off the table | Caller-chosen ids |
| Build deviation | — |
