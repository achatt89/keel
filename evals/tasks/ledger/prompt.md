Build `ledger`, a command-line tool that splits shared expenses in a small group.

Constraints: Node.js 20 or later, standard library only (no npm dependencies). Entry point: `node src/cli.js <command> [args]`. Data lives in a JSON file whose path is the `LEDGER_FILE` environment variable (default `./ledger.json`); create it on first write.

Commands:
- `add <payer> <amount> <participants> [--note <text>]`: record an expense paid by `<payer>`, split equally among the comma-separated `<participants>` (the payer shares the cost only if listed). `<amount>` is a positive decimal with at most two decimal places, e.g. `12.5` or `12.50`. Print the new expense id (a positive integer, starting at 1, never reused).
- `list`: one line per expense, oldest first: `<id> <payer> <amount with 2 decimals> <participants comma-separated>`, followed by ` # <note>` when there is a note.
- `remove <id>`: delete an expense.
- `balances`: one line per person who appears in any expense, sorted by name: `<name>: <signed amount>`, e.g. `alice: +10.00`, `bob: -10.00`, `carol: 0.00`. Positive means the person is owed money.
- `settle`: print the transfers that settle every balance, one per line: `<from> -> <to>: <amount>`. Algorithm: repeatedly take the person who owes the most and the person owed the most (ties broken by name, alphabetical) and transfer the smaller of the two amounts. Print nothing when everyone is settled.

Rules:
- Money is exact: work in integer cents. When an amount does not split evenly, the leftover cents go one each to participants in alphabetical order, so shares always add up to the amount.
- Names are 1 to 20 lowercase letters `a-z`.
- Any invalid input (unknown command, bad name, bad amount, unknown id, missing argument) prints a message starting with `error:` to stderr and exits with code 2. Success exits with code 0.

Also write your own tests (runnable with `node --test`) and a README that says how to run the tool and the tests.
