# Rubric: invoices (CSV export follow-up)

Grade the submission against the specification. Each item is pass or fail. Items marked MUST decide the verdict: the verdict is "pass" only if every MUST item passes.

1. MUST no-deps: no npm dependencies; only node: built-ins are imported; the export does no file or network I/O (it returns a string).
2. MUST existing-intact: the existing ledger behaviour (customers, numbering, VAT, void, summary) still works and no existing test was deleted or weakened.
3. MUST own-tests: the submission's own tests (runnable with `node --test`) cover `exportCsv`, including quoting and the date range.
4. MUST csv-quoting: fields that contain the separator, a double quote or a line break are quoted and inner quotes doubled, whatever separator is used.
5. MUST readme: the README documents `exportCsv`.
6. errors: bad input to `exportCsv` throws `InvoiceError` with a code; no other error type escapes for bad input.
7. clarity: the change is coherent and small; no dead code, stubs or TODOs in place of behaviour.
