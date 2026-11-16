# AGENTS.md: inventory

Stock-keeping library for a small warehouse. Node.js 20+, standard library only, ES modules, in memory.

- `src/inventory.js` exports `createInventory()` and `InventoryError` (with a `code`).
- Every rule violation throws `InventoryError` with the code the spec names.
- Tests: `node --test`. Keep them passing; add tests with every change.
- README says how to use the library and run the tests.
