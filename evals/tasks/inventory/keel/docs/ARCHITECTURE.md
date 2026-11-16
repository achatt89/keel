# inventory — Architecture

**Status:** Draft v0.1 · 2026-11-16 · Rules: [ENGINEERING_DESIGN](./ENGINEERING_DESIGN.md)

## 1. Principles

| ID | Principle |
|---|---|
| P-01 | One module, one factory; state lives in the factory closure |
| P-02 | Synchronous API; no shared mutable state across inventories |
| P-03 | Validate fully, then mutate; mutation cannot throw |
| P-04 | Derive, don't duplicate: `available` is computed from on-hand and the reserved ledger |
| P-05 | Nothing is trusted from the caller; nothing internal is handed out by reference |

## 2. Components

| Component | Responsibility |
|---|---|
| `InventoryError` | `Error` subclass with `code` |
| Validators | Pure functions: `sku`, `name`, `qty`, `reorderPoint`, `orderId`, `lines` shape |
| Item store | `Map<sku, { sku, name, onHand, reorderPoint }>` |
| Reservation ledger | `Map<orderId, lines[]>` + `Map<sku, reservedQty>` (Phase 2, [ADR-004](./adr/ADR-004-reservation-ledger.md)) |
| Movement log | Array of movements + counter `nextSeq` (Phase 3) |
| Public API | The methods returned by `createInventory()` |

## 3. State and isolation

All state is declared inside `createInventory()`. No module-level mutable state exists, so two inventories never interact (NN-8). `Map` (not plain objects) stores caller-supplied keys, so a SKU or order id such as `__proto__` cannot corrupt anything.

## 4. Data flow of a mutating call

```
caller ──► snapshot inputs ──► validate (shape → qty → lookup → state) ──► commit ──► record movement(s) ──► return
              │ copy once          │ throws InventoryError, no change        │ cannot throw
```

Order of checks is fixed in [ADR-002](./adr/ADR-002-error-model-and-validation-order.md).

## 5. Trust boundary

The public API is the only boundary. Everything crossing it inbound is untrusted and validated (NN-1); everything outbound is a copy (NN-5). There is no network, file or process boundary.

## 6. Controls by threat category

| Category | Control | Verified by |
|---|---|---|
| Malformed/hostile input (wrong types, `NaN`, `Infinity`, floats, strings, `__proto__`, sparse arrays, getters/Proxy) | Strict validators; read each caller property once into a local snapshot | NFR-SEC-001, NFR-SEC-002 |
| Aliasing (caller mutates arrays/objects after the call) | Copy on the way in and out | NFR-SEC-003 |
| Integer overflow | Reject any result above `Number.MAX_SAFE_INTEGER` as `invalid_qty` | NFR-SEC-004 |
| Double shipment | `reserved ≤ onHand` identity; `fulfil` closes once | NFR-COR-001..003 |
| Info leak | Error messages never embed caller objects; library never logs | NFR-SEC-005 |

## 7. Accepted residual risks

| ID | Risk | Revisit trigger |
|---|---|---|
| RSK-004 | State lost on process exit | A requirement for persistence appears |
| RSK-005 | Closed order id may be reused (OD-01) | Founder answers OD-01 |
| RSK-006 | Cooperating-process misuse (the app wraps the library unsafely) is out of the library's reach | The app adds concurrency or persistence |

## 8. Observability and cost

None: a library does not log, meter or emit. Cost is zero (no services).
