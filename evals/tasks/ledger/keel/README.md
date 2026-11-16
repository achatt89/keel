# ledger

A command-line tool that splits shared expenses in a small group. Node.js 20+, standard library only (no `npm install`). Data lives in one JSON file.

> **Status: design stage.** The documentation suite exists; the code and tests are built in Phases 0–2 of [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md). The commands below describe the contract (`docs/BRD.md`); until Phase 2 closes, `node src/cli.js` does not exist yet.

## Run

```sh
node src/cli.js <command> [args]
```

Data file: the path in the `LEDGER_FILE` environment variable, default `./ledger.json` (created on the first write).

| Command | Effect |
|---|---|
| `add <payer> <amount> <participants> [--note <text>]` | Record an expense, split equally among the comma-separated participants (the payer shares only if listed). Prints the new id. |
| `list` | One line per expense, oldest first: `<id> <payer> <amount> <participants>` plus ` # <note>` |
| `remove <id>` | Delete an expense |
| `balances` | `<name>: <+/-amount>` per person, sorted; positive = owed money |
| `settle` | Transfers that settle everyone: `<from> -> <to>: <amount>` |

```sh
node src/cli.js add alice 30 alice,bob,carol --note "groceries"   # prints 1
node src/cli.js add bob 12.50 alice,bob                           # prints 2
node src/cli.js balances
node src/cli.js settle
```

Names are 1–20 lowercase letters. Amounts are positive with at most two decimals. Any invalid input prints `error: …` to stderr and exits with code 2; success exits 0.

## Test

```sh
node --test
```

Tests use `node:test` and a temporary data file; they never touch your real `ledger.json`.

## Docs

Start at [`AGENTS.md`](AGENTS.md) (index and rules), then `docs/BRD.md` (requirements), `docs/ARCHITECTURE.md`, `docs/adr/README.md`, `docs/IMPLEMENTATION_PLAN.md`.
