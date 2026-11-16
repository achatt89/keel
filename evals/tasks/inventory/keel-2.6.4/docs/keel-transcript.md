# Keel transcript — inventory

Non-interactive run (2026-11-17): nobody could answer questions, so there was no live interview. This records the founder's written description and answers as supplied, then the defaults Keel took where they were silent. Q-refs are used by BRD Source cells.

## Round 0 — Intake (Keel)

Reflection: `inventory` is a stock-keeping library for a small warehouse. Problem: orders are promised against stock already promised to other orders, and nobody knows when to reorder. Shape: a Node.js 20+ ES-module library, standard library only, in memory, built in three phases (items and stock; reservations; history and reorder).

## Founder description (verbatim, abridged to the rules)

Build `inventory`, the stock-keeping library for a small warehouse. Node.js 20 or later, standard library only (no npm dependencies), pure in-memory logic, ES modules. `src/inventory.js` exports `createInventory()` and the error class `InventoryError`; every broken rule throws an `InventoryError` whose `code` property is the name in brackets. Quantities are positive integers [`invalid_qty`]; an unknown SKU is [`not_found`].

The method-by-method rules for Phases 1–3 are carried one-to-one into BRD §3 (STK, RSV, HIS, ROR). Also: write own tests (runnable with `node --test`) and a README that says how to use the library and run the tests.

## Founder answers

| Q | Topic | Answer |
|---|---|---|
| Q-01 | Idea | The full specification is the founder's own; every line is a confirmed requirement, including the three phases and their order |
| Q-02 | Ambition tier (BA/PM) | Product / MVP: real users (the warehouse team), maintained, stock errors cost money; not a prototype |
| Q-03 | Users | Developers building the warehouse app; warehouse staff are end users later |
| Q-04 | Problem | Orders promised against already-promised stock; nobody knows when to reorder |
| Q-05 | Success | Every rule holds exactly as specified with the stated codes; reserved stock never shipped twice |
| Q-06 | Stack | Node.js 20+, stdlib only, `node:test`, ES modules, in memory only |
| Q-07 | Interface | JavaScript module API; no UI, no HTTP, no CLI |
| Q-08 | Phases | Exactly the three; one per working session; each finished (tests, README) before the next |
| Q-09 | Data | SKUs, item names, quantities, order ids; nothing sensitive |
| Q-10 | Deployment | None; a library imported by a later app |
| Q-11 | Compliance | None applies |
| Q-12 | Security | Validate every input; never trust caller-supplied ids |
| Q-13 | Team | One developer with Claude Code, one phase per session |
| Q-14 | Design skills (impeccable, modern-web-guidance) | Not applicable; declined |
| Q-15 | Security-audit skill | Declined |
| Q-16 | Update-check hook | Declined |
| Q-17 | Almanac | No |
| Q-18 | Anything else | Take Keel's recommended default and mark `[ASSUMPTION]` |

## Defaults Keel took (Q-18) — each is an `[ASSUMPTION]`

| Ref | Default | Where recorded |
|---|---|---|
| D-01 | Unknown or non-string SKU is `not_found` on every SKU-taking call | BRD A-02, ADR-002 |
| D-02 | `release`/`fulfil` on an id holding no reservation is `not_found`, malformed or not | BRD A-03, ADR-002 |
| D-03 | Malformed `lines` is `invalid_input` | BRD A-04, OD-03 |
| D-04 | A closed order id may be reserved again | BRD A-05, OD-02 |
| D-05 | `name` is not trimmed | BRD A-06, OD-01 |
| D-06 | Same SKU on two lines is allowed and summed for coverage | BRD A-07, OD-04 |
| D-07 | Overflow past `MAX_SAFE_INTEGER` is `invalid_qty` | BRD A-08, OD-05 |
| D-08 | No performance target | BRD A-09 |
| D-09 | Argument checks before state checks | BRD A-10, ADR-002 |
| D-10 | Return values of mutators unspecified; `receive`/`ship` return new on-hand | BRD A-11, LLD §9 |
| D-11 | Goal exit strategy: bounded retries, then escalate | IMPLEMENTATION_PLAN Standing rules |
| D-12 | No Phase 0: scaffolding is Phase 1's first task, keeping exactly three phases | IMPLEMENTATION_PLAN |
| D-13 | Document set proposal accepted: full BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, LLD, NFR, ADRs, COMMANDS, IMPLEMENTATION_PLAN, CHANGELOG, README index; stubs for HLD, DESIGN, DEPLOYMENT, RUNBOOK, FEEDBACK_ROUNDS, COMPLIANCE, THREAT_MODEL, CONTRACT_SPEC, almanac | docs/README.md |
| D-14 | No threat-model/harden pass (Phase 4 of keel run) offered: non-interactive, no sensitive data; NFR-SEC-001..003 hold the input-handling controls | NFR §2 |
