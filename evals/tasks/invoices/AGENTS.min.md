# AGENTS.md: invoices

Invoicing core for a small consultancy. Node.js 20+, standard library only, ES modules, in memory.

- `src/invoices.js` exports `createLedger()` and `InvoiceError` (with a `code`); `src/money.js` formats amounts for the console.
- Money is integer cents; VAT is rounded half up once per invoice.
- Tests: `node --test`. Keep them passing; add tests with every change.
- README says how to use the library and run the tests.
