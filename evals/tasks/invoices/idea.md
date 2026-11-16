Build `invoices`, the invoicing core for a small two-person consultancy in Berlin. Node.js 20+, standard library only, a JavaScript module (no UI, no HTTP), in memory for now.

`src/invoices.js` exports `createLedger()` and `InvoiceError` (with a `code`). The ledger holds customers (name, ISO country code) and invoices (customer, line items with quantity and unit price, issue time as a UTC timestamp). It computes net, VAT and gross per invoice, numbers invoices gaplessly per year (`INV-2026-0001`), and can void an invoice (the invoice and its number stay). A console summary prints one line per invoice.

The work comes in phases (see the founder answers): phase 1, the core above; phase 2, a CSV export for the accountant; phase 3, file storage.
