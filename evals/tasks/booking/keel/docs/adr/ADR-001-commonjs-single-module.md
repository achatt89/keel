# ADR-001 — Module format — CommonJS, single file

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | CON-001, PKG-003, A-02 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

`src/booking.js` must export `createBookings` and `BookingError` on Node 20+. Node 20 cannot `require()` an ES module, so ESM would lock out CommonJS consumers.

## Decision

| | |
|---|---|
| **Decision** | In the context of a Node 20+ library imported by an unknown later app, facing CommonJS vs ESM, we chose **CommonJS with `module.exports = { createBookings, BookingError }`** to achieve compatibility with both `require` and `import { createBookings }`, accepting no top-level `await` and no `import` syntax in the source. |
| **Revisit trigger** | Minimum supported Node becomes 22+ (where `require(esm)` is stable). |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| ESM (`"type": "module"`) | modern syntax | not `require()`-able on Node 20 | ✗ |
| **CommonJS, static object-literal export** | works for `require` and ESM named imports | older syntax | ✓ |
| Dual build | both | needs a build step; violates "stdlib only, no tooling" spirit | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | One file, no build; tests can `require` and `import` it (Phase 0 test proves both) |
| Harder | Must keep the export a static object literal so ESM named-import detection works |
| Off the table | `"type": "module"` in `package.json` |
| Build deviation | — |
