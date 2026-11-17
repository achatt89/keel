# Keel interview transcript — inventory

Non-interactive run (2026-11-17): the founder supplied the full specification and a set of answers up front; nobody could be asked follow-ups. Where an answer was missing, the recommended default was taken and marked `[ASSUMPTION]`. Lightly cleaned, not summarised.

## Intake

**Idea (founder):** "Build `inventory`, the stock-keeping library for a small warehouse. Node.js 20 or later, standard library only (no npm dependencies), pure in-memory logic, ES modules. `src/inventory.js` exports `createInventory()` and the error class `InventoryError`; every broken rule throws an `InventoryError` whose `code` property is the name in brackets. Quantities are positive integers [`invalid_qty`]; an unknown SKU is [`not_found`]." Three phases: (1) items and stock, (2) reservations, (3) history and reorder — specified method by method with error codes (see BRD §6; the full text is the source of BRD GEN/ITM/RSV/HST/ROP). Also: write own tests runnable with `node --test`, and a README on usage and running tests.

**Treatment:** every line is a confirmed requirement, including the three phases and their order.

**Ambition tier (Q-T):** Product / MVP — real users (the warehouse team), maintained, stock errors cost money; not a prototype.

## Round 1 — Business Analyst

- **Q-A1 Users:** developers who will build the warehouse app on this library; warehouse staff are end users later.
- **Q-A2 Problem:** orders are promised against stock already promised to other orders, and nobody knows when to reorder. Stock errors cost money.
- **Q-A3 Success:** every rule holds exactly as specified, with the stated error codes; reserved stock is never shipped twice.

## Round 2 — Product Manager

- **Q-P1 Phases:** exactly the three in the description, one per working session, each finished (tests, README) before the next starts.
- **Q-P2 Interface:** a JavaScript module API. No UI, no HTTP, no CLI.
- **Q-P3 Out of scope:** not stated. `[ASSUMPTION]` BRD §10 lists persistence, async, multi-warehouse, partial fulfilment, item edit/removal as out.

## Round 3 — Architect

- **Q-X1 Stack:** Node.js 20+, standard library only, `node:test`, ES modules, in memory only.
- **Q-X2 Unspecified behaviour** (validation order, malformed lines, order-id reuse, return values): not answered. Defaults taken and recorded as ADR-002 / ADR-003 with open decisions OD-01..OD-04 for founder confirmation.

## Round 4 — Security / Compliance

- **Q-S1 Data:** SKUs, item names, quantities, order ids. Nothing sensitive. Compliance: none applies.
- **Q-S2 Security:** "validate every input; never trust caller-supplied ids" → SEC-001, SEC-002, NFR-SEC-*.
- **Q-S3 Security-audit skill offer:** declined.

## Round 5 — Designer

Not run: no UI. Design skills (impeccable, modern-web-guidance): not applicable, declined.

## Round 6 — Delivery / Ops

- **Q-D1 Deployment:** none; a library imported by a later app.
- **Q-D2 Team:** one developer building with Claude Code, one phase per session.
- **Q-D3 Ways of working:** not answered. `[ASSUMPTION]` Keel defaults: git from commit one, branch per phase, parallel worktrees for divisible tasks, doc-sync after each phase, bounded-retries exit strategy, default byte budgets.
- **Q-D4 Update-check hook:** declined. **Almanac:** no.

## Document set (proposal, accepted by the founder's instruction)

Full: AGENTS, CLAUDE, BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, LLD, ADRs, NFR, IMPLEMENTATION_PLAN, COMMANDS, CHANGELOG, transcript, docs/README. Stubs: HLD (one module), DESIGN (no UI), DEPLOYMENT and RUNBOOK (none deployed), FEEDBACK_ROUNDS (solo team), COMPLIANCE (nothing sensitive), THREAT_MODEL (low impact), CONTRACT_SPEC (no extensions), almanac (declined). Threat-model pass (Phase 4): not run — no sensitive data; input-trust handled by SEC-001/002.
