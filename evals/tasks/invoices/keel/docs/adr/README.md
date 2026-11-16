# Architecture Decision Records — invoices

All decisions derive from [BRD.md](../BRD.md) constraints and requirements; ADRs record technical reasoning, they do not relitigate product choices. One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda — a deviation that does not fit the one `Build deviation` row is a new ADR.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-money-integer-cents.md) | Money representation — integer cents | Proposed | engineering | 2026-11-16 |
| [ADR-002](./ADR-002-vat-rounding-and-rates.md) | VAT — half-up once per invoice on the net total | Accepted | founder · engineering | 2026-11-16 |
| [ADR-003](./ADR-003-gapless-numbering-per-year.md) | Invoice numbers — `INV-<year>-NNNN`, gapless, never reused | Accepted | founder · engineering | 2026-11-16 |
| [ADR-004](./ADR-004-dates-utc-and-berlin.md) | Time — store UTC instants, derive the Berlin date with Intl | Proposed | founder · engineering | 2026-11-16 |
| [ADR-005](./ADR-005-error-model.md) | Errors — `InvoiceError` with a closed `code` set | Accepted | founder · engineering | 2026-11-16 |
| [ADR-006](./ADR-006-ledger-isolation-no-caller-ids.md) | Ledger state — closure-owned, generated ids, frozen copies out | Proposed | founder · engineering | 2026-11-16 |
| [ADR-007](./ADR-007-stack-node20-stdlib-esm.md) | Stack — Node 20+, standard library only, ES modules, node:test | Accepted | founder | 2026-11-16 |
| [ADR-008](./ADR-008-csv-export-format.md) | CSV export format for German Excel and DATEV | Accepted | founder | 2026-11-16 |
| [ADR-009](./ADR-009-csv-formula-injection-policy.md) | CSV formula injection — policy for names starting `= + - @` | Proposed (reserved) | founder · engineering | 2026-11-16 |
| [ADR-010](./ADR-010-json-file-storage.md) | Storage — JSON file save/load | Proposed (reserved) | founder · engineering · legal | 2026-11-16 |

## Open decisions

One row per question. Closing a row = a human decided → write/accept the ADR, remove every marker, delete the row.

| # | Question | Locations | Decider | Options surfaced | Status |
|---|---|---|---|---|---|
| OD-01 | Customer names are written into the CSV; a leading `=` `+` `-` `@` runs as an Excel formula. Reject such names at input, neutralise in the export, or accept the risk? | BRD RSK-002 · ADR-009 · THREAT_MODEL THR-001 · IMPLEMENTATION_PLAN Phase 2 | founder + accountant | reject at `addCustomer` (recommended) / prefix `'` in export / accept | Open |
| OD-02 | Numbering year: year of the Berlin issue date (recommended) or of the UTC instant? Which year's counter does a back-dated invoice into a closed year use? | ADR-003 · LLD §5 · RSK-006 | founder | Berlin year, next number of that year / UTC year / forbid back-dating into a closed year | Open |
| OD-03 | Line quantity: integers only, or decimals (e.g. 1.5 hours)? If decimal, how is `quantity × unitPrice` rounded to cents? | LLD §3 · ENGINEERING_DESIGN §2 | engineering + founder | integers only / decimals with half-up per line / decimals as thousandths | Open |
| OD-04 | The brief says the Phase 1 code exists in the repo; this repo has no commits or files. Where is it, and should it be imported or rebuilt from these docs? | IMPLEMENTATION_PLAN Phase 1 · LLD header · BRD RSK-003 · PRD §3 | founder | import the existing code / rebuild from docs and compare | Open |
| OD-05 | Is charging FR/NL/AT VAT to EU business customers correct, or does reverse charge / OSS apply? Are 0 % for all other countries (incl. non-EU) correct and does the invoice need a legal note? | BRD RSK-004 · ADR-002 · COMPLIANCE §2 | legal (Steuerberater) | keep the founder's table / add customer VAT-ID + reverse charge / other | Open |
| OD-06 | Retention: founder says 10 years; recent German law may allow 8 years for invoices (books and accounts stay 10). Which period is the storage phase's requirement? | BRD STO-002 · RSK-005 · COMPLIANCE §3 · ADR-010 | legal | 10 years (conservative default) / 8 years for invoices | Open |
| OD-07 | In-memory ledgers lose data on exit, so the next run reuses `INV-<year>-0001`. May the partners issue real invoices before Phase 3? | BRD RSK-001 · ARCHITECTURE §5 · IMPLEMENTATION_PLAN Phase 3 · RUNBOOK §1 | founder | no real invoices until Phase 3 (recommended) / interim manual start-number option | Open |
| OD-08 | Customer-name rules: max length, control characters, line breaks (the CSV quoting rule allows line breaks)? | LLD §3 · THREAT_MODEL THR-009 | engineering | 1–200 chars, reject control chars and line breaks (recommended) / allow line breaks | Open |
| OD-09 | Invoices are legal documents; the module holds no seller data, customer address, tax number or delivery date. Which step adds the legally required content? | BRD RSK-007 · COMPLIANCE §2 | legal + founder | out of scope here, partners' template adds it / extend the data model | Open |

---

*Index of `docs/adr/` — invoices.*
