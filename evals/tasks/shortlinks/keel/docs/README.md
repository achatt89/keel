# shortlinks — Docs Index

> Documentation for shortlinks, a small in-memory URL-shortener HTTP service. Nothing is built yet: every doc is a spec for the build.

## Documents

| File | Status | Description |
|------|--------|-------------|
| [BRD.md](BRD.md) | 🔄 draft | Business requirements — problem, objectives, requirement IDs, constraints, assumptions, risks |
| [PRD.md](PRD.md) | 🔄 draft | Product requirements — the full HTTP contract, validation order, rate-limit semantics, edge-case defaults |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 🔄 draft | Principles, components, data flow, security controls, accepted risks (lite) |
| [adr/](adr/README.md) | 🔄 draft | Five decisions (one accepted, four proposed) + open founder questions |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | ⬜ not started | Three phases with evidence-ladder exit gates; Changes; deferred items |
| [COMMANDS.md](COMMANDS.md) | 🔄 draft | Run, test, curl, env vars, doc tooling |
| [keel-transcript.md](keel-transcript.md) | ✅ | The generation interview and where each `[ASSUMPTION]` came from |
| [../CHANGELOG.md](../CHANGELOG.md) | 🔄 | What shipped, with deploy state |

## Reading order

1. **New to the project?** `BRD.md` §1–§2 → `PRD.md`.
2. **Building?** `IMPLEMENTATION_PLAN.md` (current phase + gates) → `PRD.md` §4–§6 → `adr/README.md` → `ARCHITECTURE.md`.
3. **Reviewing assumptions?** `adr/README.md` Open decisions → `keel-transcript.md`.
4. **Running it?** `COMMANDS.md`.

## ID conventions

`BO-xx` objectives · `LNK/RDR/ABU/VAL/DLV-xxx` requirements · `CON-xxx` constraints · `A-xx` assumptions · `RSK-xxx` risks (BRD) · `F-xx` features (PRD) · `P-xx` principles (ARCHITECTURE) · `ADR-xxx` / `OD-xx` (`adr/`) · `Phase N`, `CHG-xxx` (IMPLEMENTATION_PLAN).

## Deliberately omitted (trigger to add)

ENGINEERING_DESIGN, HLD, LLD (one small service; ARCHITECTURE covers it) · NFR (no measurable targets beyond functional exactness; add if load or latency targets appear) · DESIGN/PRODUCT (no UI) · COMPLIANCE (no personal data beyond in-memory IPs; add if IPs are persisted or logged) · THREAT_MODEL (add if reachable by untrusted users) · DEPLOYMENT, RUNBOOK (no remote environments; add if deployed beyond one team machine) · FEEDBACK_ROUNDS · almanac · COST_ANALYSIS · SPIKE/AUDIT (on demand).
