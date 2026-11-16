# booking — Docs Index

> All product and technical documentation for booking. Keystone: [`../AGENTS.md`](../AGENTS.md) (Claude adds [`../CLAUDE.md`](../CLAUDE.md)).

## Documents

| File | Status | Description |
|------|--------|-------------|
| [BRD.md](BRD.md) | 🔄 Draft | Requirements (BKG/QRY/PKG/SEC), constraints, assumptions A-xx, risks |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 🔄 Draft | Module shape, public contract, check order, invariants, security controls |
| [adr/](adr/README.md) | ADR-001..004 Accepted (nothing Built yet) | One file per decision; index + open decisions |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | ⬜ Phases 0–2 not started | Phases, exit-gate tables, Changes, deferred items |
| [COMMANDS.md](COMMANDS.md) | 🔄 Draft | `node --test` and doc tooling |
| [keel-transcript.md](keel-transcript.md) | Complete | The interview and the assumptions taken |

Also: [`../CHANGELOG.md`](../CHANGELOG.md) — what changed, with its state tag.

## Reading order

- **New developer / builder:** AGENTS.md → BRD §6 → ARCHITECTURE §3–§6 → IMPLEMENTATION_PLAN phase you are on.
- **Founder reviewing assumptions:** BRD §8 → ADR-003 → keel-transcript.
- **Reviewer:** ARCHITECTURE §6–§8 → plan exit gates.

## ID conventions

`BO-xx` objectives · `BKG-/QRY-/PKG-/SEC-xxx` requirements · `CON-xxx` constraints · `A-xx` assumptions · `RSK-xxx` risks (BRD) · `P-xx` principles, `I-x` invariants (ARCHITECTURE) · `ADR-xxx` · `Phase N` · `CHG-xxx`.
