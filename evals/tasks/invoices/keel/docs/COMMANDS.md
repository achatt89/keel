# invoices — Commands

Prerequisite: Node.js 20 or newer (`node --version`). No `npm install` is ever needed (zero dependencies, ADR-007). Nothing exists to run until Phase 1 lands `package.json` and `src/invoices.js`.

## Everyday

| Task | Command |
|---|---|
| Run all tests | `npm test` (= `node --test`) |
| Run one test file | `node --test test/export-csv.test.js` |
| Check docs size/links | `node .keel/doc-size.mjs` |
| Run a phase | `claude --workflow .claude/workflows/phase-N-<slug>.js` |

No linter, formatter, build or env vars exist or are planned (add only via ADR).

## Using the module (monthly export; names per LLD §2 `[ASSUMPTION]`)

```js
import { writeFileSync } from 'node:fs';
import { createLedger, InvoiceError } from './src/invoices.js';
// Phase 3 will load the ledger from file; until then the ledger starts empty (RSK-001).
const ledger = createLedger();
const csv = ledger.exportCsv({ from: '2026-04-01', to: '2026-04-30' });
writeFileSync('export-2026-04.csv', csv, 'utf8'); // keep the BOM: do not strip, do not add another
```

Catch `InvoiceError` and branch on `err.code` (LLD §7).

## Env vars

None.
