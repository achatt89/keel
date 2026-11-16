# ledger

Split shared expenses. Node.js 20+, no dependencies.

Run: `node src/cli.js add alice 30 alice,bob,carol --note dinner`, then `node src/cli.js balances` and `node src/cli.js settle`. Data file: `$LEDGER_FILE` (default `./ledger.json`).

Tests: `node --test`.
