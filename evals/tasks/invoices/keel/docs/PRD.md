# invoices — Product Requirements Document

**Version:** 0.1 · **Status:** Draft · Requirements: [BRD.md](./BRD.md) · Design: [LLD.md](./LLD.md)

## 1. Personas & journeys

| Persona | Journey |
|---|---|
| Partner (issuer) | Runs a small script: `createLedger()` → add customer → issue invoice with lines → read the one-line summary → void if wrong |
| Accountant (Steuerberater) | Receives `exportCsv({from,to})` output once a month; opens in German Excel / imports to DATEV, no edits |

## 2. Features

| ID | Feature | Pri | Phase | Implements | Acceptance criteria (testable) |
|---|---|---|---|---|---|
| F-01 | Customers | Must | 1 | CUS-001 | ids `C0001…` in creation order; name non-empty; country 2 uppercase letters; invalid → `invalid_input` |
| F-02 | Invoice with lines | Must | 1 | INV-001 | needs existing customer (else `not_found`), ≥1 line, quantity > 0, unit price ≥ 0, issue time valid UTC timestamp (else `invalid_date`) |
| F-03 | Net / VAT / gross | Must | 1 | INV-002, VAT-001/002 | worked examples [LLD.md §4.3](./LLD.md#43-worked-examples) pass; `net + vat = gross` always; VAT rounded once on the net total |
| F-04 | Gapless numbering | Must | 1 | NUM-001 | first 2026 invoice `INV-2026-0001`, then `…0002`; a failed issue consumes no number; new year restarts at `0001` |
| F-05 | Void | Must | 1 | NUM-002 | voided invoice remains listed with its number and amounts; voiding twice → `already_void`; unknown id → `not_found` |
| F-06 | Console summary | Must | 1 | INV-003 | exactly one line per invoice, in number order, showing number, date, customer, gross, status |
| F-07 | CSV export | Must | 2 | EXP-001..003 | byte-exact output per [ADR-008](./adr/ADR-008-csv-export-format.md); `2026-03-31T23:30:00Z` is dated `2026-04-01`; range inclusive; void rows kept; empty range = BOM + header + CRLF; bad date → `invalid_date`, `from > to` → `invalid_range`, format checked before range |
| F-08 | Errors & input validation | Must | 1–2 | ERR-001, SEC-001 | every failure is an `InvoiceError` with a code from [ADR-005](./adr/ADR-005-error-model.md); no other exception type escapes for bad input |
| F-09 | JSON file save/load | Should | 3 | STO-001/002 | out of scope now; scoped later with `/keel phase new` |

## 3. Roadmap

| Phase | Content | State |
|---|---|---|
| 1 | Core ledger (F-01..F-06, F-08) | Reported built by the founder; absent from this repo (OD-04) — adopt and verify |
| 2 | CSV export (F-07) | Next |
| 3 | File storage (F-09) | Later; gate for real use (OD-07) |

## 4. Non-goals

See [BRD.md §5](./BRD.md#5-out-of-scope). Success metrics: BO-01..BO-04 in the BRD; there is no analytics.
