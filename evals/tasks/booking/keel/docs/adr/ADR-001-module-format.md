---
id: ADR-001
status: Accepted
paths: ["src/booking.js"]
check: test/api.test.js
---

# ADR-001 — Module format — CommonJS, single entry point

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | CON-001, CON-002, CON-004, A-07 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

CON-004 fixes `src/booking.js` as the entry but not whether it is CommonJS or ESM. A consumer or test may use either `require` or `import`.

## Decision

| | |
|---|---|
| **Decision** | In the context of an unspecified module format, facing CJS vs ESM, we chose **CommonJS with a static `module.exports = { createBookings, BookingError }`** to achieve `require` and named `import` both working on Node 20, accepting no top-level await or `import.meta`. |
| **Revisit trigger** | A consumer needs ESM-only features, or Node drops named-import detection of CJS exports. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| ESM (`.mjs`/`"type":"module"`) | modern | `require()` fails on Node 20 | ✗ |
| **CommonJS, static export object** | works with `require` and `import { x }` | legacy style | ✓ |
| Dual package | both | extra files, no benefit here | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Either test style loads it; zero build step. |
| Harder | Must keep the export a plain literal so named import detection works. |
| Off the table | ESM-only syntax in `src/`. |
| Build deviation | — (fill at Built) |
