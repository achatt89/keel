# Architecture Decision Records — ledger

All decisions derive from constraints and requirements in `BRD.md`; ADRs record technical reasoning, they do not relitigate product choices. One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda — a deviation that doesn't fit the one `Build deviation` row is a new ADR.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-integer-cents-and-split-rule.md) | Money representation — integer cents with alphabetical leftover | Proposed | founder · engineering | 2026-11-16 |
| [ADR-002](./ADR-002-single-json-file-store.md) | Persistence — one JSON file with atomic writes | Proposed | founder · engineering | 2026-11-16 |
| [ADR-003](./ADR-003-single-error-path-and-exit-codes.md) | Error handling — throw CliError, one catch in cli.js | Proposed | engineering | 2026-11-16 |

## Open decisions

| # | Question | Locations | Decider | Options surfaced | Status |
|---|---|---|---|---|---|
| *(none — every ambiguity was taken as an `[ASSUMPTION]` in BRD §4/§6)* | | | | | |
