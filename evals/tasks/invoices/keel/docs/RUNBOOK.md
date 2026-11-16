# invoices — Runbook

A library with no deployment or server: this covers how the partners operate their script and what to do when it fails. Environments, deploy and rollback are omitted (no remote environment); trigger to add DEPLOYMENT.md: any hosted component.

## 1. Before issuing real invoices

Until Phase 3 the ledger lives in memory. A new process starts at `INV-<year>-0001` again, so **do not issue real invoices yet** (OD-07, RSK-001). After Phase 3: load the ledger first, issue, save, and keep the file under backup (retention OD-06).

## 2. Monthly accountant export

1. Load the ledger (Phase 3) and call `exportCsv({ from, to })` with the month's first and last day (Berlin dates, both inclusive).
2. Write the string to a `.csv` file as UTF-8 without modification (the BOM is already in the string).
3. Send to the accountant. A month with no invoices yields a header-only file, which is correct.

## 3. Errors → meaning

| `err.code` | Meaning | Action |
|---|---|---|
| `invalid_input` | a field is missing, the wrong type, out of bounds or a name is refused | fix the input; nothing was changed |
| `invalid_date` | an issue time or a `from`/`to` is not a real date in the required format | use `YYYY-MM-DD` for ranges, ISO UTC for issue times |
| `invalid_range` | `from` is after `to` | swap them |
| `not_found` | unknown customer id or invoice number | check the id |
| `already_void` | invoice was voided before | none; voided invoices stay in the ledger and the export |

## 4. Postmortems

| PM | Date | Summary | Prevention |
|---|---|---|---|
| *(none yet)* | — | — | — |
