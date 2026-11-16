# AGENTS.md: ledger

Shared-expense splitting CLI. Node.js 20+, standard library only, no npm dependencies.

- Entry point: `node src/cli.js`. Data file: `$LEDGER_FILE` (default `./ledger.json`).
- Money is integer cents everywhere; format only at output.
- Errors: message starting `error:` on stderr, exit code 2.
- Tests: `node --test`. Keep them passing; add tests with every change.
- README says how to run the tool and the tests.
