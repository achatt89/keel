# Architecture — inventory

## 1. Principles

| ID | Principle |
|---|---|
| P-01 | One module, one factory, private state per instance ([ADR-001](./adr/ADR-001-in-memory-esm-factory.md)). |
| P-02 | Validate-then-apply: all checks before the first mutation ([ADR-002](./adr/ADR-002-error-model-and-atomicity.md)). |
| P-03 | Derived values are computed, not stored twice, except `reserved` kept per item for O(1) `available`. |

## 2. Components

Single file `src/inventory.js` (may split into internal helpers if it grows; the public surface stays this file).

| Component | Responsibility |
|---|---|
| `InventoryError` | `Error` subclass with `code`; closed code set ([LLD §5](./LLD.md)) |
| Validators | `sku`, `name`, `qty`, `orderId`, `lines`, `reorderPoint` checks, pure functions |
| State | `items`, `orders`, `movements`, `seq` (closure, private) |
| Operations | The public API; each = validate → plan → commit |
| `commit` helper | Applies a planned set of item deltas and movements atomically, assigning `seq` (Phase 3) |

## 3. Data flow (every mutator)

`args → validate shape → look up (not_found) → check state rules (duplicate_*, insufficient_stock) → apply deltas → append movements (Phase 3) → return`. Any throw before "apply" leaves state untouched.

## 4. Trust boundaries

One: the module's public functions. Everything crossing it is untrusted ([ENGINEERING_DESIGN](./ENGINEERING_DESIGN.md) NN-5). No other boundary: no network, filesystem, or process input.

## 5. Security controls by threat

| Threat | Control |
|---|---|
| Prototype pollution via keys like `__proto__` | `Map` storage; SKU/order formats reject such ids on creation; lookups of unknown keys → `not_found` |
| Malformed/hostile argument types (arrays, objects, NaN, strings as qty) | Strict validators: `Number.isSafeInteger`, `typeof`, anchored regexes |
| Aliasing: caller mutates `lines` or returned objects | Copy in (normalise lines at validate), copy out (history, report) |
| Regex DoS | Anchored, linear patterns `^[A-Z]{3}-\d{4}$`, `^ORD-\d+$`; reject non-strings first |

## 6. Observability, cost

None: a library. No logging, no telemetry. Cost: none.

## 7. Accepted risks

RSK-004 in-memory loss on restart — revisit when persistence is requested. Single-threaded assumption: Node's event loop makes each synchronous call atomic; no async API exists (ADR-001).
