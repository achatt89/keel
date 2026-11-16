# inventory — documentation index

Stock-keeping library for a small warehouse. Node.js 20+, standard library only, in memory, ES modules. Tier: Product / MVP. Status: docs generated 2026-11-17; no code yet (Phase 1 not started).

## Document map

| Doc | State | Purpose |
|---|---|---|
| [BRD.md](BRD.md) | full | Problem, requirements (STK/RSV/HIS/ROR/SEC/DEL), constraints, assumptions, risks |
| [PRD.md](PRD.md) | full | Features F-01..F-07, journeys |
| [ENGINEERING_DESIGN.md](ENGINEERING_DESIGN.md) | full | Pillars, non-negotiables NN-1..NN-6 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | full (lite) | Components, data flow, trust boundary, accepted risks |
| [LLD.md](LLD.md) | full | Module, types, validators, per-method steps |
| [adr/README.md](adr/README.md) | full | ADR-001..003 + reserved 004..006; open decisions OD-01..05 |
| [NFR.md](NFR.md) | full | NFR-COR/SEC/MNT/DOC targets with verification |
| [COMMANDS.md](COMMANDS.md) | full | Run and test commands |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | full | Phases 1–3, gates, standing rules |
| [../CHANGELOG.md](../CHANGELOG.md) | full | What shipped |
| [keel-transcript.md](keel-transcript.md) | full | Founder inputs and defaults taken |
| HLD, DESIGN, DEPLOYMENT, RUNBOOK, FEEDBACK_ROUNDS, COMPLIANCE, THREAT_MODEL, CONTRACT_SPEC, `../almanac/README.md` | stub | Each states why not yet and when to write it |

## Reading order

Developer building it: BRD §3 → LLD → NFR → IMPLEMENTATION_PLAN (current phase). Founder: BRD §5 assumptions → [adr/README.md](adr/README.md) Open decisions.
