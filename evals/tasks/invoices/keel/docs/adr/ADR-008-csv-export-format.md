# ADR-008 — CSV export format for German Excel and DATEV

| | |
|---|---|
| **Status** | Accepted 2026-11-16 |
| **Deciders** | founder (confirmed with the accountant) |
| **Bounded by** | EXP-001, EXP-002, EXP-003, BO-03 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

The accountant confirmed every point below for German Excel/DATEV import without editing. Phase 2 implements it byte-exactly.

## Decision

| | |
|---|---|
| **Decision** | In the context of the monthly accountant export, facing Excel's German locale, we chose **the format in the table below** to achieve import without editing, accepting a fixed non-configurable format. |
| **Revisit trigger** | the accountant changes tools or asks for a different layout |

### Format

| Aspect | Rule |
|---|---|
| Separator / line end | `;` · CRLF after every row including the last |
| Encoding | UTF-8 with BOM (U+FEFF) first in the returned string |
| Header | `invoice;date;customer;country;net;vat;gross;status` |
| Amounts | euros, decimal comma, always two decimals (`1234,50`), no thousands separator, no currency sign |
| Date | issue date in Europe/Berlin, `YYYY-MM-DD`; `from`/`to` filter the same date, both inclusive |
| Rows | invoice-number order; void invoices included with status `void` and original amounts |
| Quoting | field containing `;` `"` CR or LF is wrapped in `"`, inner `"` doubled; others unquoted |
| Errors | bad `from`/`to` → `invalid_date` (format checked before range); `from` > `to` → `invalid_range` |
| Empty range | BOM + header row + CRLF |

Worked example: [LLD.md §6.3](../LLD.md#63-worked-example).

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| RFC-4180 comma/UTF-8 no BOM | standard | German Excel misreads separators, umlauts | ✗ |
| **Semicolon, decimal comma, BOM, CRLF** | what the accountant confirmed | non-standard for other tools | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Byte-exact tests are possible (LLD §6.3) |
| Harder | Format is fixed; options only via a new ADR |
| Off the table | Locale-dependent formatting |
| Build deviation | pending — filled once, at Built |
