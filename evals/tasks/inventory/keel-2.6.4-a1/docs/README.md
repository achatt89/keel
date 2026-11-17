# Documentation index — inventory

Status: ⬜ no phase built yet. Stubs say why they are not needed yet and when to write them in full.

| Doc | State | Purpose |
|---|---|---|
| [BRD.md](BRD.md) | full | Problem, objectives, requirement IDs, constraints, assumptions, risks |
| [PRD.md](PRD.md) | full | Personas, journeys, features F-01..F-13 |
| [ENGINEERING_DESIGN.md](ENGINEERING_DESIGN.md) | full | Pillars, domain model, non-negotiables |
| [ARCHITECTURE.md](ARCHITECTURE.md) | full | State, flow, trust boundary, accepted risks |
| [LLD.md](LLD.md) | full | API, types, error codes, validation order, movements |
| [adr/README.md](adr/README.md) | full | ADR-001..005 and open decisions OD-01..OD-04 |
| [NFR.md](NFR.md) | full | Correctness, input-trust, doc targets and their verification |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | full | Phases 1–3, gates, standing rules |
| [COMMANDS.md](COMMANDS.md) | full | Test and check commands |
| [keel-transcript.md](keel-transcript.md) | full | The interview and the assumptions taken |
| [HLD.md](HLD.md) · [DESIGN.md](DESIGN.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [RUNBOOK.md](RUNBOOK.md) · [FEEDBACK_ROUNDS.md](FEEDBACK_ROUNDS.md) · [COMPLIANCE.md](COMPLIANCE.md) · [THREAT_MODEL.md](THREAT_MODEL.md) · [CONTRACT_SPEC.md](CONTRACT_SPEC.md) · [../almanac/README.md](../almanac/README.md) | stub | Not needed yet |

Also at the root: [../AGENTS.md](../AGENTS.md) (keystone), [../CLAUDE.md](../CLAUDE.md), [../CHANGELOG.md](../CHANGELOG.md).

## Reading order

| Reader | Order |
|---|---|
| Founder | BRD → adr/README (open decisions) → IMPLEMENTATION_PLAN |
| Builder (Claude Code) | AGENTS → ENGINEERING_DESIGN → LLD → ADRs → IMPLEMENTATION_PLAN phase → NFR |
