# Business Requirements Document
## ledger — CLI that splits shared expenses in a small group

**Version:** 0.1 · **Status:** Draft (generated 2026-11-16) · **Tier:** Prototype / weekend (lite BRD)
**Source:** founder description (`prompt.md`) + interview, recorded in [keel-transcript.md](./keel-transcript.md). Every line of the description is a confirmed requirement; items marked `[ASSUMPTION]` are keel defaults to validate.

## 1. Problem

Friends sharing a flat lose track of who paid for what; settling up takes more transfers than needed. `ledger` records expenses, shows exact balances, and prints a short list of transfers that settles everyone.

## 2. Users

| Who | Role |
|---|---|
| The CLI operator (one developer, own laptop) | Runs every command; sole user |
| People named in expenses | Appear as names only; never use the tool; no payments are made by it |

## 3. Business objectives

| ID | Objective | Measure |
|---|---|---|
| BO-01 | Balances always reconcile to the cent | Sum of all balances is exactly `0.00` after any command sequence (tested) |
| BO-02 | `settle` prints the fewest practical transfers by the stated algorithm | Transfers match the greedy algorithm in BAL-004 on every test case |
| BO-03 | Weekend-sized, zero-dependency tool anyone can run from a clone | `node src/cli.js` and `node --test` work with Node 20+ and nothing installed |

## 4. Requirements

Groups: `EXP` expense recording · `BAL` balances and settlement · `MON` money · `VAL` validation and errors · `DAT` data file · `QUA` quality and docs. Priority is MoSCoW; all are `Must` (founder-confirmed) unless marked.

| ID | Requirement | Pri |
|---|---|---|
| EXP-001 | `add <payer> <amount> <participants> [--note <text>]` records an expense paid by `<payer>`, split equally among the comma-separated `<participants>`; the payer shares the cost only if listed | Must |
| EXP-002 | `add` prints the new expense id: a positive integer, starting at 1, never reused (including after `remove`) | Must |
| EXP-003 | `list` prints one line per expense, oldest first: `<id> <payer> <amount, 2 decimals> <participants comma-separated>`, plus ` # <note>` when a note exists | Must |
| EXP-004 | `remove <id>` deletes that expense | Must |
| EXP-005 | `[ASSUMPTION]` `list` and `balances` on an empty ledger print nothing and exit 0 | Must |
| EXP-006 | `[ASSUMPTION]` `add` and `remove` print nothing else on success; `remove` prints nothing | Must |
| BAL-001 | `balances` prints one line per person appearing in any expense (as payer or participant), sorted by name: `<name>: <signed amount>` (`+10.00`, `-10.00`, `0.00`); positive means owed money | Must |
| BAL-002 | A person's balance = cents they paid − cents of their shares across all expenses | Must |
| BAL-003 | `settle` prints transfers that settle every balance, one per line: `<from> -> <to>: <amount>`; prints nothing when everyone is settled | Must |
| BAL-004 | Settle algorithm: repeatedly take the person who owes the most and the person owed the most (ties broken by name, alphabetical) and transfer the smaller of the two amounts | Must |
| BAL-005 | `[ASSUMPTION]` `settle` is read-only: it never changes the data file | Must |
| MON-001 | Money is exact: all arithmetic and storage in integer cents | Must |
| MON-002 | When an amount does not split evenly, leftover cents go one each to participants in alphabetical order, so shares always sum to the amount | Must |
| MON-003 | `<amount>` is a positive decimal with at most two decimal places (`12.5`, `12.50`); zero, negative, exponent, thousands separators, or >2 decimals are invalid | Must |
| MON-004 | `[ASSUMPTION]` Maximum amount is `9999999.99` per expense, so cents stay far below `Number.MAX_SAFE_INTEGER` | Must |
| VAL-001 | Names are 1 to 20 lowercase letters `a-z` (payer and every participant) | Must |
| VAL-002 | Any invalid input (unknown command, bad name, bad amount, unknown id, missing argument) prints a message starting `error:` to stderr and exits 2; success exits 0 | Must |
| VAL-003 | `[ASSUMPTION]` Also invalid (exit 2): empty participant list or empty entry (`a,,b`), duplicate participant, non-integer or non-positive id, extra positional arguments, unknown flag, `--note` without text or with a newline, no command at all | Must |
| DAT-001 | Data lives in a JSON file at `$LEDGER_FILE`, default `./ledger.json`; created on first write | Must |
| DAT-002 | `[ASSUMPTION]` Read-only commands on a missing file behave as an empty ledger and do not create the file | Must |
| DAT-003 | `[ASSUMPTION]` A data file that is unreadable or not valid ledger JSON prints `error: ...` to stderr and exits 1 (it is not user input, so not 2); the file is never overwritten in that case | Must |
| DAT-004 | `[ASSUMPTION]` Writes are atomic (temp file + rename) so a crash cannot truncate the ledger | Should |
| QUA-001 | Node.js 20+, standard library only, no npm dependencies; entry point `node src/cli.js <command> [args]` | Must |
| QUA-002 | Tests written with `node:test`, runnable with `node --test` | Must |
| QUA-003 | `README.md` states how to run the tool and the tests | Must |

## 5. Constraints

| ID | Constraint |
|---|---|
| CON-001 | Node.js 20+ and standard library only (QUA-001); no package manager step |
| CON-002 | One JSON file, no database, no network access, CLI only (no UI, web or API) |
| CON-003 | Data is names and amounts only; no personal data beyond first names; no compliance regime applies |
| CON-004 | The data file is local and trusted; all CLI input is still validated (VAL-001..003) |

## 6. Assumptions

| ID | Assumption | Validate by |
|---|---|---|
| A-01 | Listed in-line as `[ASSUMPTION]` rows above (EXP-005/006, BAL-005, MON-004, VAL-003, DAT-002..004) | Founder skim at Phase 0 start |
| A-02 | `list` prints participants in the order given on `add` (after validation), not re-sorted; the alphabetical order matters only for leftover cents | Founder skim |
| A-03 | Case: `Alice` is an invalid name (uppercase rejected, not lowercased) | Follows from VAL-001 |
| A-04 | One operator at a time: no file locking for concurrent runs | Revisit if two people share the file |
| A-05 | Output uses `\n` line endings, UTF-8; amounts always use `.` as decimal separator | — |

## 7. Out of scope

Editing an expense, unequal/percentage splits, currencies, multiple groups per file, payments, import/export, a UI or API, colour output, config files. Trigger to revisit: the operator asks for it.

## 8. Risks

| ID | Risk | Mitigation | Where |
|---|---|---|---|
| RSK-001 | Float rounding drifts balances by a cent | Integer cents only; parse amount as string, never `parseFloat` | [ADR-001](./adr/ADR-001-integer-cents-and-split-rule.md), ARCHITECTURE §4 |
| RSK-002 | Spec ambiguity (tie-breaks, empty output) yields surprising output | Every ambiguity is an `[ASSUMPTION]` above; tests pin each | this doc §4 |
| RSK-003 | Crash during write corrupts the only copy of the data | Atomic write (DAT-004) | [ADR-002](./adr/ADR-002-single-json-file-store.md) |
| RSK-004 | Hand-edited data file breaks invariants | Validate file shape on load (DAT-003) | ARCHITECTURE §5 |
