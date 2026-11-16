# Architecture — inventory

**Status:** Draft · Pillars and non-negotiables: [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md). Contracts: [LLD.md](./LLD.md).

## 1. Principles

| ID | Principle |
|---|---|
| P-01 | One module, one factory: all state is private to the closure `createInventory()` returns ([ADR-001](./adr/ADR-001-module-shape-and-error-model.md)) |
| P-02 | Synchronous and single-threaded: no I/O, no timers, no async, so no interleaving to reason about (CON-003) |
| P-03 | Validate fully, then commit ([ADR-005](./adr/ADR-005-validate-then-commit.md)) |
| P-04 | Standard library only (CON-002) |

## 2. Components

| Component | Where | Owns |
|---|---|---|
| Public API | `src/inventory.js` exports `createInventory`, `InventoryError` | The contract in LLD §3 |
| Error type | `InventoryError extends Error`, `code` property | LLD §4 code table |
| Instance state | Closure inside `createInventory()` | §3 below |
| Tests | `test/*.test.js`, run by `node --test` | NFR-COR-* verification |
| README + examples | `README.md`, `examples/` | Usage docs under test |

## 3. State (per instance)

| Field | Type | Purpose |
|---|---|---|
| `items` | `Map<sku, { name, onHand, reorderPoint \| null }>` | Item records |
| `reservations` | `Map<orderId, Array<{ sku, qty }>>` | Open holds, lines as stored copies |
| `reserved` | `Map<sku, number>` | Sum of open reservation lines per SKU; keeps `available` O(1) |
| `movements` | `Array<Movement>` (frozen rows) | Global ledger, in `seq` order |
| `bySku` | `Map<sku, Array<Movement>>` | Per-SKU index for `history` |
| `seq` | `number` | Last issued sequence number, starts at 0 |

`Map` is used, not plain objects, so ids such as `__proto__` cannot collide with object internals (SEC-001).

## 4. Data flow

Every mutating call: (1) validate arguments, (2) look up and check state, (3) commit all state changes and append movements in one uninterrupted synchronous block (ADR-005). Queries read state and return copies.

## 5. Trust boundary and controls

| Boundary | Control |
|---|---|
| Caller → API | Every argument validated before use (LLD §4, [ADR-002](./adr/ADR-002-validation-order-and-input-handling.md)); malformed input throws `InventoryError` |
| API → caller | Return values are fresh copies or frozen rows; no internal reference escapes (SEC-002) |

No network, file or process boundary exists. No threat model beyond this (THREAT_MODEL is a stub).

## 6. Observability, cost

None: a library with no runtime, no hosting, no cost. Callers observe behaviour through `history`.

## 7. Accepted residual risks

| Risk | Why accepted | Revisit trigger |
|---|---|---|
| In-memory state is lost on exit (CON-003) | Founder decision: persistence belongs to the later app | The app needs to survive restarts |
| Single-threaded assumption: sharing one instance across worker threads is unsupported | Not a stated need | A caller needs multi-thread access |
| Movement ledger grows without bound | Small warehouse; no volume stated (BRD A-05) | Memory pressure reported by the app |
