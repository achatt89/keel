# Keel transcript — inventory

Non-interactive run (2026-11-16): the founder supplied the full specification and a complete set of interview answers up front; nobody could answer follow-ups. Where a question was unanswered, the recommended default was taken and marked `[ASSUMPTION]` (listed in [BRD §4](./BRD.md) and [adr/README](./adr/README.md) Open decisions). Lightly cleaned, not summarised.

## Phase 0 — Intake and framing

**Founder's idea.** Build `inventory`, the stock-keeping library for a small warehouse. Node.js 20+, standard library only (no npm dependencies), pure in-memory logic, ES modules. `src/inventory.js` exports `createInventory()` and `InventoryError`; every broken rule throws an `InventoryError` whose `code` is the bracketed name. Quantities are positive integers [`invalid_qty`]; unknown SKU [`not_found`].

- **Phase 1, items and stock:** `addItem({ sku, name })` (sku `ABC-1234` [`invalid_sku`], name non-empty string [`invalid_input`], once only [`duplicate_sku`]); `receive(sku, qty)`; `ship(sku, qty)` never below zero [`insufficient_stock`]; `stock(sku)`.
- **Phase 2, reservations:** `reserve(orderId, lines)` (`ORD-` + digits [`invalid_order`]; non-empty array of `{ sku, qty }`; all-or-nothing [`insufficient_stock`]; existing reservation [`duplicate_order`]); `available(sku)` = on hand − reserved; `release(orderId)` and `fulfil(orderId)` ([`not_found`] for unknown or closed); `ship` may only use available quantity.
- **Phase 3, history and reorder:** movements `{ seq, sku, type, qty }` (+ `orderId`), types receive/ship/reserve/release/fulfil, one per line for order operations, one global `seq` from 1; `history(sku)` oldest first; `setReorderPoint(sku, n)` integer ≥ 0 [`invalid_qty`]; `reorderReport()` for available ≤ point, sorted by SKU, `{ sku, available, reorderPoint, suggestedQty }` with `suggestedQty = 2×point − available`; items without a point never listed.
- Also: own tests runnable with `node --test`, and a README for usage and running tests.

**Keel's read.** A small in-memory library whose entire value is exact rule-keeping; stock errors cost money. Recommended tier: Product / MVP. **Founder:** Product / MVP — real users (the warehouse team), maintained, not a prototype.

## Business Analyst round

- Users: developers building the warehouse app on this library; warehouse staff are later end users.
- Problem: orders are promised against stock already promised to other orders; nobody knows when to reorder.
- Success: every rule holds exactly as specified with the stated codes; reserved stock is never shipped twice.
- Compliance: none applies.

## Product Manager round

- Phases: exactly the three above, one per working session, each finished (tests, README) before the next.
- Interface: JavaScript module API; no UI, no HTTP, no CLI.
- Out of scope: everything beyond the specification (kept in BRD §5 as recommended defaults).
- Every line of the specification is a confirmed requirement.

## Architect round

- Stack: Node.js 20+, stdlib only, `node:test`, ES modules, in memory only. Deployment: none.
- **Keel recommendation (taken as default):** synchronous factory with closure-private state; validate-then-apply; one global movement array. → ADR-001..005.

## Security / Compliance round

- Data: SKUs, item names, quantities, order ids; nothing sensitive. Security: validate every input; never trust caller-supplied ids → NFR-SEC-001, NFR-SEC-002, ENGINEERING_DESIGN NN-5.
- Security-audit skill offer: **declined.**

## Designer round

Not run: no UI. Design skills (impeccable, modern-web-guidance): not applicable, **declined.**

## Delivery / Ops round

- Team: one developer with Claude Code, one phase per session.
- Ways of working: proven defaults accepted `[ASSUMPTION]` — branch-per-phase off `main`, parallel worktrees for divisible tasks, doc-sync after each phase, goal exit strategy "bounded retries then escalate", byte budgets at defaults (keystone 12 KB, plan 64 KB, ADR index 16 KB, others 32 KB).
- Update-check hook: **declined.** Almanac: **no.**
- Anything else: recommended default, marked `[ASSUMPTION]` (BRD A-01..A-11; Open decisions OD-01..OD-06).

## Document set (Phase 2)

Keel proposed; accepted by the founder's instruction. Full: AGENTS, CLAUDE, BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, LLD, ADRs, NFR, COMMANDS, IMPLEMENTATION_PLAN, CHANGELOG, this transcript, docs/README. Stubs: HLD, DESIGN, DEPLOYMENT, RUNBOOK, FEEDBACK_ROUNDS, COMPLIANCE, THREAT_MODEL, CONTRACT_SPEC, almanac. Phase 4 threat-model pass: [ASSUMPTION] a single-pass sanity check folded into ARCHITECTURE §5 and NFR-SEC (not offered interactively).
