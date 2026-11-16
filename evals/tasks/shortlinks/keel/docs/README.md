# shortlinks — Documentation index

Prototype-tier suite. Status: 🔄 docs laid; no application code yet. Tier and every default below trace to [keel-transcript.md](./keel-transcript.md).

## Document map

| Doc | Purpose | Status |
|---|---|---|
| [BRD.md](./BRD.md) | Objectives, requirement IDs, constraints, assumptions, risks | 🔄 |
| [PRD.md](./PRD.md) | The API contract (`F-01`..`F-09`) | 🔄 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Components, module contracts, data model, controls | 🔄 |
| [adr/README.md](./adr/README.md) | ADR-001..004 and the Open decisions (OD-01..OD-05) | ✅ accepted, `code-read` |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Phase 0 (core API), Phase 1 (rate limit), exit gates | 🔄 |
| [COMMANDS.md](./COMMANDS.md) | Run and test commands, `PORT` | 🔄 |
| [keel-transcript.md](./keel-transcript.md) | The interview record | ✅ |
| `../CHANGELOG.md` | What shipped and its deploy state | 🔄 |

## Reading order

1. Builder: PRD → ARCHITECTURE → adr/README (Open decisions) → IMPLEMENTATION_PLAN.
2. Founder: BRD → adr/README (confirm OD-01..OD-05) → PRD.

## Deliberately omitted

| Doc | Why | Brings it back |
|---|---|---|
| ENGINEERING_DESIGN, HLD, LLD | One small service; ARCHITECTURE §3 carries the module contracts | More than one component or a team |
| NFR | No measurable targets beyond the spec; the rate limit is a requirement (RAT-001) | A latency/availability target appears |
| DESIGN, PRODUCT | No UI | A UI |
| COMPLIANCE, THREAT_MODEL | No compliance regime; client IPs only, in memory; one VPN boundary (ARCHITECTURE §6) | Persisted IPs/logs, public exposure |
| DEPLOYMENT, RUNBOOK | One process on a dev box or VM, no environments or pipeline | A remote environment or on-call |
| FEEDBACK_ROUNDS | Solo internal tool | External reviewers |
| almanac/ | No product/GTM dimension | — |
| SPIKE, AUDIT, COST_ANALYSIS, PHASE_ARCHIVE | On demand only | An investigation, audit, metered cost, or byte-budget breach |
