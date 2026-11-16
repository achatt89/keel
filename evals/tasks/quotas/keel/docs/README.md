# filestore — Docs Index

Tier: Product / MVP · Library, no UI, no deployment yet. Keystone: [`../AGENTS.md`](../AGENTS.md) (+ [`../CLAUDE.md`](../CLAUDE.md)).

## Documents

| Doc | Purpose | Status |
|---|---|---|
| [BRD.md](./BRD.md) | Problem, objectives `BO-`, requirements `USR/FIL/ERR/QTA/SEC-`, constraints, assumptions, risks | v0.1 |
| [PRD.md](./PRD.md) | Personas, features `F-01..F-09`, acceptance criteria AC-1..AC-13 | v0.1 |
| [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md) | Pillars, domain model, data classes, non-negotiables NN-1..NN-11 | v0.1 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Components, trust boundary, controls, accepted risks | v0.1 |
| [LLD.md](./LLD.md) | Module map, API contract, quota algorithm, validation | v0.1 (Phase 1 names to confirm) |
| [adr/README.md](./adr/README.md) | ADR-001..006 index; open decisions OD-01..OD-08 | v0.1 |
| [NFR.md](./NFR.md) | Targets with verification methods | v0.1 |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Phases 1–3, gates, deferred items, Changes | Phase 1 🔄, Phase 2 ⬜ |
| [COMMANDS.md](./COMMANDS.md) | Commands | v0.1 |
| [keel-transcript.md](./keel-transcript.md) | The interview and assumption provenance | immutable |
| [../CHANGELOG.md](../CHANGELOG.md) | What shipped and in what state | `[Unreleased]` |

## Reading order

| Persona | Read |
|---|---|
| Founder | BRD §3, §10 → PRD §4 (F-04..F-08) → `adr/README.md` Open decisions (8 questions need you) |
| Developer / Claude Code | AGENTS.md → ENGINEERING_DESIGN §6 → LLD §3–§6 → IMPLEMENTATION_PLAN Phase 2 → NFR |
| Reviewer | PRD F-05 acceptance table → NFR-CORR → ADR-003..005 |

## ID conventions

`BO-` objective · `USR/FIL/ERR/QTA/SEC-nnn` requirement (BRD) · `CON-` constraint · `A-` assumption · `RSK-` risk · `F-` feature (PRD) · `AC-` acceptance criterion (PRD F-05) · `NN-` non-negotiable (ENGINEERING_DESIGN) · `P-` principle (ARCHITECTURE) · `ADR-` decision · `OD-` open decision · `NFR-<AREA>-nnn` · `Phase N` · `CHG-nnn`.

## Deliberately omitted (and what brings each back)

| Doc | Why omitted | Trigger |
|---|---|---|
| HLD.md | One module; folded into ARCHITECTURE | a second deployable component |
| DESIGN.md / PRODUCT.md / FE hooks | No UI (design skills declined) | a UI is added |
| DEPLOYMENT.md, RUNBOOK.md | Nothing deployed or operated | Phase 3 scoping |
| COMPLIANCE.md | Only account names held; GDPR is a Phase 3 concern (`OD-06`) | Phase 3 scoping, or any new personal data |
| THREAT_MODEL.md | Product tier, no network surface; controls are in ARCHITECTURE §5 | Phase 3 (HTTP exposes the module) |
| FEEDBACK_ROUNDS.md | No external reviewer | a client or pilot user reviews builds |
| almanac/ | Engineering-only; founder said no | a GTM/methodology knowledge base is wanted |
| SPIKE_/AUDIT_/COST_ANALYSIS, PHASE_ARCHIVE | On demand | an investigation, audit, metered cost, or a budget breach |
| Security agent, update-check hook | Founder declined | `/keel upgrade` re-asks only the security skill if marked `declined` |

---

*End of docs/README.md — filestore*
