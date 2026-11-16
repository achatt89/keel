# Architecture Decision Records — booking

All decisions derive from constraints and requirements in [BRD](../BRD.md); ADRs record technical reasoning. One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda — a deviation that doesn't fit the one `Build deviation` row is a new ADR.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-module-format.md) | Module format — CommonJS, single entry point | Accepted | engineering | 2026-11-16 |
| [ADR-002](./ADR-002-time-model.md) | Time model — strict parse to integer UTC minutes | Accepted | engineering | 2026-11-16 |
| [ADR-003](./ADR-003-check-order.md) | Rule precedence — fixed check order in `book` | Accepted | founder · engineering | 2026-11-16 |
| [ADR-004](./ADR-004-ids-and-cancel.md) | Ids — minted internally, never reused, lookup only | Accepted | engineering | 2026-11-16 |
| [ADR-005](./ADR-005-state-and-atomicity.md) | State — private Maps, copies out, validate-then-write | Accepted | engineering | 2026-11-16 |

## Open decisions

| # | Question | Locations | Decider | Options surfaced | Status |
|---|---|---|---|---|---|
| OD-01 | [NEEDS DECISION] In what order are multiple broken rules reported? Default assumed: input → time → hours → length → overlap → person_busy | `docs/BRD.md` A-01 · ADR-003 | founder | keep default / other order | Open |
| OD-02 | [NEEDS DECISION] Is a whitespace-only `room`/`who` valid? Default assumed: yes (literal "non-empty"); names are case-sensitive and untrimmed | `docs/BRD.md` A-02 | founder | accept / reject whitespace-only / trim | Open |

---

*Index of `docs/adr/` — booking.*
