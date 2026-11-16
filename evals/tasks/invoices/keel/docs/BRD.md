# invoices — Business Requirements Document

**Version:** 0.1 · **Status:** Draft, founder answers 2026-11-16 · **Tier:** Product / MVP
**Next:** [PRD.md](./PRD.md) · [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md) · Provenance: [keel-transcript.md](./keel-transcript.md)

## 1. Problem

A two-person Berlin consultancy writes invoices by hand in a word processor. Numbers have gaps and
VAT is miscalculated. Invoices are legal documents (German invoicing rules), kept for years.

| Who | Need |
|---|---|
| The two partners (issuers) | Issue correct, gaplessly numbered invoices without arithmetic by hand |
| External accountant (Steuerberater) | Monthly CSV that imports into German Excel and DATEV without editing |

## 2. Objectives & success

| ID | Objective | Success measure | Verified by |
|---|---|---|---|
| BO-01 | Every invoice is correct to the cent | net + VAT = gross exactly; VAT per rule in every test case | NFR-COR-001..003 |
| BO-02 | Gapless numbering | `INV-<year>-NNNN` has no gap or reuse per year, including voided invoices | NFR-COR-004 |
| BO-03 | Accountant imports without editing | Export opens in German Excel with umlauts, columns and amounts intact; accountant sign-off | NFR-COR-006, Phase 2 gate |
| BO-04 | Replace the word-processor process | Both partners issue from the module (a small script) | Phase 3 launch gate |

## 3. Requirements

Groups: `CUS` customers · `INV` invoices/lines · `VAT` · `NUM` numbering · `EXP` export · `ERR` errors ·
`SEC` input safety · `STO` storage · `CMP` compliance. Priority = MoSCoW. Phase = [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md).

| ID | Requirement | Pri | Phase | Satisfied by |
|---|---|---|---|---|
| CUS-001 | Customers have a ledger-generated id `C0001`, `C0002`… (never caller-supplied), a name and an ISO country code | Must | 1 | F-01 |
| INV-001 | An invoice has a customer, ≥1 line items (quantity, unit price) and an issue time as UTC timestamp | Must | 1 | F-02 |
| INV-002 | Net, VAT and gross are computed per invoice, never typed in | Must | 1 | F-03 |
| INV-003 | A console summary prints one line per invoice | Must | 1 | F-06 |
| VAT-001 | VAT rate by customer country: DE 19 %, FR 20 %, NL 21 %, AT 20 %, all others 0 % | Must | 1 | F-03 |
| VAT-002 | VAT rounded half up, once per invoice, on the net total | Must | 1 | F-03 |
| NUM-001 | Invoice numbers are `INV-<year>-<4 digits>`, gapless per year | Must | 1 | F-04 |
| NUM-002 | Voiding keeps the invoice and its number; a number is never reused | Must | 1 | F-05 |
| EXP-001 | `exportCsv({ from, to })` returns the accountant CSV text (format: [ADR-008](./adr/ADR-008-csv-export-format.md)) | Must | 2 | F-07 |
| EXP-002 | Range filter and `date` column use the issue date in Europe/Berlin, inclusive of `from` and `to` | Must | 2 | F-07 |
| EXP-003 | Void invoices stay in the export with status `void` and original amounts | Must | 2 | F-07 |
| ERR-001 | All failures are `InvoiceError` with a stable `code`: `invalid_input`, `invalid_date`, `not_found`, `already_void`, `invalid_range` (Phase 2) | Must | 1–2 | F-08 |
| SEC-001 | Validate every input; never trust caller-supplied ids | Must | 1 | F-08, [ADR-006](./adr/ADR-006-ledger-isolation-no-caller-ids.md) |
| SEC-002 | Spreadsheet formula injection from names is handled per OD-01 | Should | 2 | [ADR-009](./adr/ADR-009-csv-formula-injection-policy.md) |
| STO-001 | Save and load the ledger as a JSON file | Should | 3 (later; out of scope now) | — |
| STO-002 | Invoices retained 10 years (retention period: OD-06) | Must | 3 | [COMPLIANCE.md](./COMPLIANCE.md) |
| CMP-001 | German invoicing rules: gapless numbers, VAT shown ([COMPLIANCE.md](./COMPLIANCE.md)) | Must | 1 | F-03, F-04 |

## 4. Constraints, assumptions

| ID | Item |
|---|---|
| CON-001 | Node.js 20+, standard library only (no runtime or dev dependencies), ES modules, `node:test` |
| CON-002 | A JavaScript module API only: no UI, no HTTP, no CLI |
| CON-003 | In memory until Phase 3: nothing survives process exit |
| CON-004 | Business time zone is Europe/Berlin; stored times are UTC |
| CON-005 | One developer, building with Claude Code |
| A-01 | `[ASSUMPTION]` Single currency, EUR. Amounts stored as integer cents ([ADR-001](./adr/ADR-001-money-integer-cents.md)) |
| A-02 | `[ASSUMPTION]` Callers are the two partners' trusted scripts in one process; the library is still hardened against bad input, not against a hostile host process |
| A-03 | `[ASSUMPTION]` The API is synchronous and single-process; no concurrent writers |
| A-04 | `[ASSUMPTION]` The VAT table is fixed in code (not configurable); a rate change is a code change + CHANGELOG entry |
| A-05 | `[ASSUMPTION]` Country codes are validated for format (two uppercase letters), not against the full ISO 3166 list |
| A-06 | `[ASSUMPTION]` The VAT rate is taken from the customer's country at issue time and stored on the invoice |

## 5. Out of scope

UI, HTTP, CLI, PDF/legal invoice rendering, credit notes, multi-currency, payments, customer edit/delete, e-invoicing (XRechnung/ZUGFeRD), DATEV-native format (the accountant imports the CSV; see EXP-001). Triggers to revisit: a partner asks for it (PRD roadmap).

## 6. Risk register

| ID | Risk | L / I | Mitigation / where | Status |
|---|---|---|---|---|
| RSK-001 | In-memory ledger loses invoices on exit; next run reuses numbers from `0001` | High / Critical | Do not issue real invoices before Phase 3 (OD-07); Phase 3 gate | Open |
| RSK-002 | Customer name starting with `= + - @` executes as a spreadsheet formula in Excel | Med / High | THR-001, [ADR-009](./adr/ADR-009-csv-formula-injection-policy.md), OD-01 | Open |
| RSK-003 | Phase 1 code was described as existing but is absent from this repo; correctness is unverified | High / High | OD-04; Phase 1 re-verifies every rule | Open |
| RSK-004 | Charging FR/NL/AT VAT to EU business customers may be wrong (reverse charge / OSS) | Med / High | OD-05 (legal) | Open |
| RSK-005 | Retention period stated as 10 years; GoBD/AO rules may differ for invoices | Low / Med | OD-06 (legal); keep ≥ the longer value meanwhile | Open |
| RSK-006 | Numbering year vs. Berlin date mismatch near New Year; back-dating into a closed year | Med / Med | OD-02, [ADR-003](./adr/ADR-003-gapless-numbering-per-year.md) | Open |
| RSK-007 | Module output lacks legally required invoice content (addresses, tax number, delivery date) | Med / High | OD-09; the rendering step outside this module must add it | Open |

Open questions: [adr/README.md](./adr/README.md) "Open decisions".
