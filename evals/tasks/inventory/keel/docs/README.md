# inventory — Docs Index

> Documentation for `inventory`, the stock-keeping library for a small warehouse. Entry point for agents: [`../AGENTS.md`](../AGENTS.md).

## Documents

Status: 🔄 draft, in review by the founder (no build evidence exists yet).

| File | Status | Description |
|---|---|---|
| [BRD.md](./BRD.md) | 🔄 | Problem, objectives, every requirement ID, constraints, risks |
| [PRD.md](./PRD.md) | 🔄 | Personas, features, journeys with acceptance |
| [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md) | 🔄 | Pillars, domain model, non-negotiables |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 🔄 | Components, state, trust boundary, controls, accepted risks |
| [LLD.md](./LLD.md) | 🔄 | Files, types, per-method error table, semantics |
| [adr/README.md](./adr/README.md) | 🔄 | ADR index (ADR-001..006) and open decisions OD-01..05 |
| [NFR.md](./NFR.md) | 🔄 | Correctness, input-handling, build and test targets with verification |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | 🔄 | Phases 1–3, exit gates, deferred items, changes |
| [COMMANDS.md](./COMMANDS.md) | 🔄 | Test and doc-tooling commands |
| [keel-transcript.md](./keel-transcript.md) | 🔄 | The interview behind these docs |
| [../CHANGELOG.md](../CHANGELOG.md) | 🔄 | What changed, with state |

## Reading order

| Reader | Order |
|---|---|
| Founder | BRD → PRD → adr/README (open decisions) |
| Builder | ENGINEERING_DESIGN → LLD → IMPLEMENTATION_PLAN (current phase) → NFR |
| Reviewer | ARCHITECTURE → ADRs → NFR |

## Deliberately omitted (and what would bring each back)

| Doc | Why omitted | Trigger |
|---|---|---|
| HLD | One module; ARCHITECTURE covers flow | Several components or services appear |
| DESIGN, PRODUCT | No UI | A UI is added |
| COMPLIANCE | C0 data only, no regime applies | Customer or personal data enters |
| THREAT_MODEL | Single-process library; controls by threat live in ARCHITECTURE §6 | Persistence, network or multi-tenant use |
| DEPLOYMENT, RUNBOOK | Nothing is deployed or operated | A hosted service wraps the library |
| FEEDBACK_ROUNDS | No client review loop stated | A client starts handing back feedback |
| almanac/ | No product, GTM or AI-reference dimension | Never expected |
| SPIKE / COST_ANALYSIS / AUDIT / PHASE_ARCHIVE | On demand only | An investigation, metered cost, dated audit, or archived work |

## IDs

`BO` objective · `ITM STK RSV MOV ROP ERR DLV` requirement groups · `CON` constraint · `A` assumption · `RSK` risk · `F` feature · `P` principle · `NN` non-negotiable · `NFR-COR/SEC/BLD/TST` · `ADR` · `OD` open decision · `Phase N` · `CHG`.
