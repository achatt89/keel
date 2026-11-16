# Founder answers (for a non-interactive /keel run)

The idea is in the description above; treat every line of it as a confirmed requirement.

Answers to the interview, by topic:

- Ambition tier: **Product / MVP**. Real users (the two partners and their accountant), maintained for years, invoices are legal documents. Not a prototype.
- Users: the two partners issue invoices; the external accountant (Steuerberater) imports the CSV export into German Excel and DATEV each month.
- Problem: invoices are made by hand in a word processor; numbers have gaps and VAT is miscalculated.
- Success: every invoice correct to the cent, gapless numbering, and the accountant can import the export without editing it.
- Stack: Node.js 20+, standard library only, `node:test` for tests. ES modules.
- Interface: a JavaScript module API. No UI, no HTTP, no CLI.
- Phases:
  - Phase 1, core (already built: the code exists in the repo): customers (ids `C0001`...), invoices with lines, VAT by customer country (DE 19 %, FR 20 %, NL 21 %, AT 20 %, all others 0 %) rounded half up once per invoice on the net total, numbers `INV-<year>-<4 digits>` gapless per year, void keeps the invoice. Errors are `InvoiceError` with codes `invalid_input`, `invalid_date`, `not_found`, `already_void`.
  - Phase 2, CSV export for the accountant (next): `exportCsv({ from, to })` returns the CSV text. Decisions, all confirmed with the accountant:
    - Format for German Excel: separator is a semicolon `;`; amounts in euros with a decimal comma and always two decimals (`1234,50`), no thousands separator, no currency sign.
    - Encoding: UTF-8 with a byte-order mark (BOM, `﻿`) at the very start, so Excel shows umlauts. Line endings CRLF (`\r\n`), including after the last row.
    - Columns, in this order, with this exact header row: `invoice;date;customer;country;net;vat;gross;status`. `customer` is the customer's name, `date` is the issue date, `vat` is the VAT amount, `status` is `issued` or `void`.
    - Dates: the business is in Berlin. The `date` column and the `from`/`to` filter both use the issue date in the Europe/Berlin time zone (an invoice issued at `2026-03-31T23:30:00Z` is dated `2026-04-01`). The range includes both `from` and `to`.
    - Void invoices stay in the export, with status `void` and their original amounts: the tax office wants the numbering gapless.
    - Rows are in invoice-number order (not date order; a back-dated invoice keeps its number's place).
    - Quoting: a field that contains a semicolon, a double quote or a line break is wrapped in double quotes, with inner quotes doubled (`Atelier "Lune"` becomes `"Atelier ""Lune"""`). Other fields are not quoted.
    - Errors: a `from` or `to` that is not a real `YYYY-MM-DD` date throws `InvoiceError` code `invalid_date`; `from` after `to` throws `invalid_range`. The date format is checked before the range.
    - No invoices in range: the BOM and the header row only (with its CRLF).
  - Phase 3, storage: save and load the ledger as a JSON file (later; out of scope for now).
- Data: customer names and amounts. No personal data beyond business names. Invoices must be kept 10 years (that is the storage phase's concern).
- Deployment: none; a library used by a small script the partners run.
- Compliance: German invoicing rules (gapless numbers, VAT shown). GoBD retention is phase 3.
- Security: validate every input; never trust caller-supplied ids.
- Team: one developer building with Claude Code.
- Design skills (impeccable, modern-web-guidance): not applicable (no UI). Decline.
- Security-audit skill offer: decline.
- Update-check hook: decline.
- Almanac: no.
- Anything else you would ask: take your recommended default and mark it [ASSUMPTION].
