# Keel interview transcript — inventory

Non-interactive run, 2026-11-16: the founder supplied the full specification and every interview answer up front; no question could be asked live. Where the brief was silent, the recommended default was taken and marked `[ASSUMPTION]`. The document set was pre-approved by instruction.

## Phase 0 — Intake and framing

**Founder's idea (verbatim essentials).** `inventory`: stock-keeping library for a small warehouse. Node.js 20+, stdlib only, in-memory, ES modules. `src/inventory.js` exports `createInventory()` and `InventoryError`; every broken rule throws `InventoryError` with a `code`. Three phases: (1) items and stock; (2) reservations; (3) history and reorder. Full rules are in [BRD §4](./BRD.md#4-requirements). Also: tests runnable with `node --test`, and a README with usage and test instructions.

**Reflection.** Orders are promised against stock already promised elsewhere and nobody knows when to reorder; developers will build the warehouse app on one library that owns the stock rules. Every line of the spec is a confirmed requirement, phases in order.

**Ambition tier.** Founder: *Product / MVP* — real users (the warehouse team), maintained, stock errors cost money, not a prototype. Confirmed.

## Round 1 — Business Analyst

| Topic | Founder answer |
|---|---|
| Problem | Double-promised stock; no reorder signal |
| Success | Every rule holds exactly as specified with the stated codes; reserved stock never shipped twice |
| Users | Developers now; warehouse staff later through the app |
| Data / sensitivity | SKUs, item names, quantities, order ids; nothing sensitive |
| Compliance | None applies |

## Round 2 — Product Manager

| Topic | Founder answer |
|---|---|
| MVP cut | The three phases in the description, nothing else |
| Out of scope | Anything not in the description (Keel recommendation recorded in BRD §7: persistence, locations, pricing, deletion, UI) |
| Interface | JavaScript module API; no UI, no HTTP, no CLI |

*Keel challenge:* the spec leaves several behaviours open (error precedence, code for a bad `lines`, reuse of closed order ids, return values). Founder: "take your recommended default and mark it `[ASSUMPTION]`." → recorded as ADR-002, LLD §4 and Open decisions OD-01..05.

## Round 3 — Architect

| Topic | Founder answer / recommendation |
|---|---|
| Stack | Node.js 20+, stdlib only, `node:test`, ES modules, in memory |
| Shape | Keel recommended one module with state in the factory closure, validate-then-commit, copy at boundaries → ADR-001, 003, 004, 005, 006 |
| Deployment | None; library imported by a later app |

## Round 4 — Security / Compliance (light)

Founder: validate every input; never trust caller-supplied ids. Data is C0 only. Keel turned this into NN-1, NN-5, NFR-SEC-001..006 and ARCHITECTURE §6 (hostile inputs, aliasing, overflow). Security-audit skill offer: **declined**. Threat-model pass (Phase 4): not run as a separate fan-out; a single-pass sanity check was folded into ARCHITECTURE §6 given tier and surface [ASSUMPTION].

## Round 5 — Designer

Not applicable (no UI). Design skills (impeccable, modern-web-guidance): **declined**.

## Round 6 — Delivery / Ops and ways of working

| Topic | Answer |
|---|---|
| Phasing | Exactly the three phases; one per working session; each finished (tests, README) before the next |
| Team | One developer with Claude Code |
| Git/workflow | Keel proven defaults accepted [ASSUMPTION]: branch-per-phase off `main`, worktree-parallel tasks, doc-sync after each phase, byte budgets at defaults |
| Goal exit strategy | Bounded retries, then escalate [ASSUMPTION] |
| Deployment / environments | None |
| Update-check hook | Declined |
| Almanac | No |
| Phase 0 guardrails | Not added: founder said exactly three phases; scaffold folded into Phase 1 [ASSUMPTION] |

## Document set (proposed by Keel, approved by instruction)

Included: AGENTS.md, CLAUDE.md, CHANGELOG, BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, LLD, ADRs, NFR, IMPLEMENTATION_PLAN, COMMANDS, docs/README, this transcript, phase scripts. Omitted with triggers: see [docs/README](./README.md#deliberately-omitted-and-what-would-bring-each-back).

## Scope of this run

Documents only. `package.json`, `src/inventory.js`, tests and `README.md` are Phase 1–3 deliverables in [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md), not generated now.
