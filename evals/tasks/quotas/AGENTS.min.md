# AGENTS.md: filestore

Metadata core of a small file-storage service. Node.js 20+, standard library only, ES modules, in memory.

- `src/store.js` exports `createStore()` and `StoreError` (with a `code`); `src/units.js` formats byte sizes for display.
- Sizes are integer bytes. An unknown user is reported before bad input.
- Tests: `node --test`. Keep them passing; add tests with every change.
- README says how to use the library and run the tests.
