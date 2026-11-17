# Commands — inventory

Copy-paste ready. Node.js 20 or later; nothing to install (no dependencies, [ADR-001](adr/ADR-001-runtime-and-test-stack.md)).

| Task | Command |
|---|---|
| Run all tests | `node --test` |
| Run one suite | `node --test test/items-stock.test.js` |
| Run the README examples | `node examples/<name>.js` (also run by `test/examples.test.js`) |
| Check docs size and links | `node .keel/doc-size.mjs` |
| Check docs for drift | `node .keel/check.mjs` |
| Check Node version | `node --version` (must be ≥ 20) |

## Environment variables

None. The library reads no environment and no files.

## Using the library

```js
import { createInventory, InventoryError } from './src/inventory.js';
```

Usage and the error table live in the root `README.md` (a Phase 1 deliverable, under test: NFR-DOC-001).
