# invoices

Invoicing core for a small consultancy: customers, invoices with line items, VAT by customer country.
Node.js 20+, standard library only, in memory (storage comes in a later phase).

```js
import { createLedger } from './src/invoices.js';
const L = createLedger();
const c = L.addCustomer({ name: 'Berg GmbH', country: 'DE' });
const id = L.issue({ customer: c, lines: [{ desc: 'Consulting', qty: 3, unitCents: 41150 }], issuedAt: '2026-03-10T10:00:00Z' });
L.get(id); // { id: 'INV-2026-0001', netCents: 123450, taxCents: 23456, grossCents: 146906, status: 'issued', ... }
L.void(id);
console.log(L.summary());
```

- Money is integer cents. VAT: DE 19 %, FR 20 %, NL 21 %, AT 20 %, others 0; rounded half up once per invoice.
- Invoice numbers: `INV-<year>-<4 digits>`, gapless per year. Customer ids: `C` + 4 digits.
- `issuedAt` is a UTC timestamp `YYYY-MM-DDTHH:MM:SSZ`.
- Errors are `InvoiceError` with a `code`: `invalid_input`, `invalid_date`, `not_found`, `already_void`.

## Tests

```bash
node --test
```

## CSV export

`L.exportCsv({ from, to })` returns the CSV text for the accountant (German Excel / DATEV): invoices whose issue date in Europe/Berlin is within `from`..`to` (inclusive, `YYYY-MM-DD`), in invoice-number order, void invoices included with status `void`.
Format: UTF-8 BOM, CRLF line endings, `;` separator, decimal comma (`1234,50`), header `invoice;date;customer;country;net;vat;gross;status`; fields with `;`, `"` or line breaks are quoted. Errors: `invalid_date`, then `invalid_range`.
