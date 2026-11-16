# Architecture — ledger (lite)

**References:** [BRD](./BRD.md) · [ADR index](./adr/README.md) · [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md)

## 1. Principles

| ID | Principle |
|---|---|
| P-01 | Pure core, thin shell: money, split, balances and settle are pure functions; only `store.js` and `cli.js` touch the outside world |
| P-02 | Integer cents everywhere inside the program; strings only at the I/O edge (MON-001) |
| P-03 | Validate once, at the edge, before any state changes (VAL-002) |
| P-04 | One error path: modules throw `CliError`; only `cli.js` prints and exits |
| P-05 | Node 20 stdlib only (`node:fs`, `node:path`, `node:test`, `node:assert`) |

## 2. Components

| Module | Responsibility | Owns |
|---|---|---|
| `src/cli.js` | Entry point: parse argv, dispatch, print, map errors to exit codes | exit codes, stdout/stderr |
| `src/commands.js` | One function per command; orchestrates validate → store → core → output lines | command behaviour |
| `src/validate.js` | Parse and validate name, amount, participants, id, note, flags; throws `CliError` | VAL-001..003, MON-003/004 |
| `src/money.js` | `parseAmount(str)→cents`, `formatCents`, `formatSigned`, `splitEqually(cents, names)→Map` | MON-001..002 |
| `src/balances.js` | `computeBalances(expenses)`, `settle(balances)` (pure) | BAL-002..004 |
| `src/store.js` | Locate `LEDGER_FILE`, load (missing → empty), validate shape, atomic save | DAT-001..004 |
| `src/errors.js` | `CliError` (exit 2) and `DataError` (exit 1) | error contract |
| `tests/*.test.js` | `node:test` suites, one per module plus CLI end-to-end (spawn `node src/cli.js` with a temp `LEDGER_FILE`) | QUA-002 |

## 3. Data flow

`argv → cli.js → commands.<cmd> → validate (CliError on bad input) → store.load → core (money/balances) → store.save (mutating cmds only) → lines on stdout → exit 0`.
Any thrown `CliError` → `error: <message>` on stderr, exit 2. `DataError` → `error: <message>`, exit 1 (DAT-003). Anything else is a bug: stderr `error: internal: <message>`, exit 1.

## 4. Money and split rule ([ADR-001](./adr/ADR-001-integer-cents-and-split-rule.md))

Amount string → cents by regex `^\d{1,7}(\.\d{1,2})?$` (> 0 after parse), no floats. Split of `C` cents among `n` distinct participants: base `floor(C/n)`, remainder `r = C mod n`; participants sorted alphabetically, the first `r` get `base+1`. Shares sum to `C`. Payer balance `+C`, each participant `−share`; a payer who is also a participant nets `C − share`. Formatting: sign `+` for positive, `-` for negative, none for zero; always two decimals.

## 5. Data file ([ADR-002](./adr/ADR-002-single-json-file-store.md))

```json
{ "version": 1, "nextId": 3, "expenses": [
  { "id": 1, "payer": "alice", "cents": 1250, "participants": ["alice", "bob"], "note": "pizza" } ] }
```

`note` omitted when absent. Load checks: object shape, `nextId` positive integer greater than every id, ids unique and ascending, names valid, `cents` safe positive integer, participants non-empty and distinct. Violation → `DataError` (exit 1), file untouched. `remove` never lowers `nextId` (EXP-002). Save: write `<file>.tmp-<pid>`, then `rename` over the target.

## 6. Settle algorithm (BAL-004)

Input: balances in cents (sum is 0). Loop while any non-zero balance: debtor = most negative (tie: alphabetically first name), creditor = most positive (tie: alphabetically first name); `t = min(−debtor, creditor)`; emit `debtor -> creditor: t`; adjust both. Each step zeroes at least one person, so it terminates in at most `n−1` steps. Deterministic for a given input.

## 7. Trust boundaries and security

Single local user; data file trusted but validated on load (RSK-004). No network, no child processes, no `eval`, no dynamic `require` of user input. Note text is stored and printed verbatim as data (newlines rejected so `list` stays one line per expense). No secrets.

## 8. Accepted residual risks

| ID | Risk | Revisit trigger |
|---|---|---|
| RSK-003 | Concurrent runs can lose an update (no locking; A-04) | Two people share one data file |
