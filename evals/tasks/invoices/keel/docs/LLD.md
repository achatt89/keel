# invoices — Low-Level Design

**Status:** Draft. **Reconcile before build:** the Phase 1 code was reported built but is not in this repo (OD-04). Names marked `[ASSUMPTION]` are proposals; if the built code differs, record it as a Build deviation, not silently.
Rules: [ENGINEERING_DESIGN.md §4](./ENGINEERING_DESIGN.md#4-non-negotiables) · Verification: [NFR.md](./NFR.md)

## 1. Module map

`src/invoices.js` (exports only `createLedger`, `InvoiceError`). Internal sections, in order: constants · `InvoiceError` · validators · money/VAT · dates · numbering · ledger · CSV. Tests in `test/*.test.js` (`node:test`). Owns nothing outside the file; no I/O.

## 2. Public API

| Export | Signature | Notes |
|---|---|---|
| `InvoiceError` | `class extends Error { code }` | `code` ∈ closed set, §7 |
| `createLedger()` | `() => ledger` | new empty ledger; state in a closure |
| `ledger.addCustomer` `[ASSUMPTION name]` | `({ name, country }) => Customer` | id `C0001`… |
| `ledger.issueInvoice` `[ASSUMPTION name]` | `({ customerId, lines, issuedAt }) => Invoice` | allocates the number last |
| `ledger.voidInvoice` `[ASSUMPTION name]` | `(number) => Invoice` | `not_found`, `already_void` |
| `ledger.getInvoice` / `listInvoices` `[ASSUMPTION names]` | lookup / all, number order | frozen copies |
| `ledger.summary` `[ASSUMPTION name]` | `() => string` or prints | one line per invoice, number order (F-06) |
| `ledger.exportCsv` | `({ from, to }) => string` | Phase 2, §6 |

Customer = `{ id, name, country }`; Invoice per [ENGINEERING_DESIGN.md §2](./ENGINEERING_DESIGN.md#2-domain-model). All returned values are deep-frozen copies.

## 3. Validation (SEC-001, N-05) — all before any state change

| Input | Rule | Code |
|---|---|---|
| argument object | plain object (not null/array); unknown keys ignored `[ASSUMPTION]` | `invalid_input` |
| `name` | string, trimmed length 1–200; control-character policy OD-08 | `invalid_input` |
| `country` | `/^[A-Z]{2}$/` (A-05) | `invalid_input` |
| id / number lookups | string in expected pattern, else `invalid_input`; well-formed but unknown → `not_found` | both |
| `lines` | array of 1–500 plain objects `[ASSUMPTION bound]` | `invalid_input` |
| `quantity` | finite number > 0; integer-only vs decimal is OD-03 (default `[ASSUMPTION]`: positive integer) | `invalid_input` |
| `unitPrice` | integer cents ≥ 0, `Number.isSafeInteger` | `invalid_input` |
| line amount, net, `net × rate` | every intermediate stays a safe integer, else reject | `invalid_input` |
| `issuedAt` | ISO-8601 UTC string `YYYY-MM-DDTHH:mm:ss[.fff]Z` that round-trips through `Date` (rejects `2026-02-30…`); `[ASSUMPTION]` strings only | `invalid_date` |
| customer | must exist | `not_found` |

## 4. Money and VAT

### 4.1 Representation
Integer cents everywhere ([ADR-001](./adr/ADR-001-money-integer-cents.md)). Line amount = `quantity × unitPrice`; `net` = sum of line amounts.

### 4.2 Rate table and rounding ([ADR-002](./adr/ADR-002-vat-rounding-and-rates.md))
`RATES = { DE: 19, FR: 20, NL: 21, AT: 20 }`, any other country 0. `vat = Math.floor((net * ratePercent + 50) / 100)` (half up, once, on the net total); `gross = net + vat`. The rate is stored on the invoice (A-06). Open legal question on cross-border rates: OD-05.

### 4.3 Worked examples

| Case | net (cents) | rate | vat | gross | Shows |
|---|---|---|---|---|---|
| DE, 1 × 10050 | 10050 | 19 | 1910 | 11960 | `190950 + 50 = 191000 → 1910` (half up: 19,095 → 19,10) |
| FR, 1 × 10050 | 10050 | 20 | 2010 | 12060 | |
| DE, 1 × 10049 | 10049 | 19 | 1909 | 11958 | rounds down below the half |
| DE, 9 lines of 1 × 1 | 9 | 19 | 2 | 11 | once per invoice: 0,0171 € → 0,02 € (per-line rounding gives 9 × 0 = 0) |
| NL, 1 × 100000 | 100000 | 21 | 21000 | 121000 | |
| US, 1 × 5000 | 5000 | 0 | 0 | 5000 | other countries 0 % |

## 5. Numbering ([ADR-003](./adr/ADR-003-gapless-numbering-per-year.md))

`INV-<year>-<seq padded to 4>`. Per-year counter in a `Map<year, n>`. Order inside `issueInvoice`: validate → compute → read `n+1` → build invoice → store and bump counter (nothing can throw between bump and store). `seq > 9999` throws `invalid_input` rather than emit 5 digits. Year basis (Berlin vs UTC) and back-dating into a past year: OD-02; default `[ASSUMPTION]` year of the Europe/Berlin issue date, number allocated in call order (so a back-dated invoice keeps its number's place).
Void flips `status` to `void`; the invoice, number and amounts stay.

## 6. CSV export (Phase 2) — authoritative format: [ADR-008](./adr/ADR-008-csv-export-format.md)

### 6.1 Dates and range
Berlin date = `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year, month, day })` parts, assembled manually as `YYYY-MM-DD` (no locale-dependent string). `from`/`to`: string matching `^\d{4}-\d{2}-\d{2}$` **and** a real calendar date, else `invalid_date` (`from` checked first, then `to`; missing → `invalid_date`); only then `from > to` (string compare) → `invalid_range`. Non-object argument → `invalid_input` `[ASSUMPTION]`. Filter: `from <= berlinDate <= to`.

### 6.2 Writer
Output = `"﻿"` + header row + one row per invoice, each ending `\r\n`. Header `invoice;date;customer;country;net;vat;gross;status`. Rows sorted by `(year, seq)` numerically. Cents → `Math.trunc(c/100)` + `,` + two-digit remainder, no thousands separator, no currency sign (no `toFixed`). `customer` is the customer's name. A field containing `;`, `"`, `\r` or `\n` is wrapped in `"` with inner `"` doubled; others unquoted. Formula-leading characters: [ADR-009](./adr/ADR-009-csv-formula-injection-policy.md). The BOM is part of the returned string; callers write it as UTF-8 and must not add or strip one.

### 6.3 Worked example
Ledger: `C0001` `Atelier "Lune"` FR; `C0002` `Müller GmbH` DE. `INV-2026-0001` (C0001, net 10050, issued `2026-03-31T23:30:00Z`); `INV-2026-0002` (C0002, net 10050, issued `2026-04-02T09:00:00Z`, then voided). `exportCsv({ from: '2026-04-01', to: '2026-04-30' })` returns (`⟨BOM⟩` = U+FEFF; each line ends CRLF):

```
⟨BOM⟩invoice;date;customer;country;net;vat;gross;status
INV-2026-0001;2026-04-01;"Atelier ""Lune""";FR;100,50;20,10;120,60;issued
INV-2026-0002;2026-04-02;Müller GmbH;DE;100,50;19,10;119,60;void
```
Empty range → `⟨BOM⟩invoice;date;customer;country;net;vat;gross;status\r\n`.

## 7. Errors ([ADR-005](./adr/ADR-005-error-model.md))

Closed code set: `invalid_input`, `invalid_date`, `not_found`, `already_void`, `invalid_range` (Phase 2). `InvoiceError.name === 'InvoiceError'`; message is human text with no customer data beyond the offending field name. Never throw a plain `Error` or `TypeError` for caller mistakes.
