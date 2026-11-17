# Architecture — inventory

Lite: one component, in-memory. Pillars: [ENGINEERING_DESIGN.md](ENGINEERING_DESIGN.md).

## 1. Principles

| ID | Principle | Basis |
|---|---|---|
| P-01 | One inventory instance = one closed state object; instances share nothing | NN-5 |
| P-02 | Validate, then check state, then commit in one synchronous block | NN-3, [ADR-003](adr/ADR-003-validate-then-commit.md) |
| P-03 | Derived values (`available`) are computed from, or kept consistent with, the primary state; never cached stale | RSV-005 |

## 2. Components

| Component | Responsibility |
|---|---|
| `createInventory()` factory | Allocates private state; returns the public method set |
| `InventoryError` | The only rule-violation error; carries `code` |
| Validators | Pure functions: `sku`, `qty`, `orderId`, `name`, `lines`, reorder point |
| State | `items` (sku → `{ sku, name, onHand, reorderPoint }`), `reservations` (orderId → lines), `reservedBySku`, `movements`, `seq` (Phases 2–3 add the last four) |

Exact shapes and signatures: [LLD.md](LLD.md).

## 3. Data flow (every mutating call)

`validate args` → `look up state` → `check rules` → `commit all changes + append movements` → `return copy`. A throw before the commit leaves state untouched. The commit block contains no call that can throw (NN-3).

## 4. Trust boundary

The only boundary is the public method call. Everything crossing it is untrusted and validated (NN-2). No network, filesystem or environment access exists, so no other boundary applies (A-01; threat model stub: [THREAT_MODEL.md](THREAT_MODEL.md)).

## 5. Concurrency

JavaScript's single thread plus synchronous methods make each call atomic within a process. No `async` method exists; adding one needs a new ADR.

## 6. Accepted risks

| ID | Risk | Revisit trigger |
|---|---|---|
| RSK-003 | Ambiguous rules resolved by documented assumptions (BRD A-02..A-08) | Founder answers an open decision in [adr/README.md](adr/README.md) |
| RSK-005 | State is lost when the process exits (in-memory by constraint CON-002) | The warehouse app needs persistence |
