# ledger — Business Requirements Document (lite)

**Tier:** Prototype / weekend · **Source of truth for behaviour.** The founder's description (`prompt.md`) is confirmed in full; every line is a requirement below. No PRD exists (omitted — one CLI, one user); the command contract lives here.
**Markers:** `[ASSUMPTION]` = default taken without founder input (non-interactive run) — each maps to a row in `docs/adr/README.md` Open decisions or is listed in §7.

## 1. Problem & users

| | |
|---|---|
| Problem | Friends sharing a flat lose track of who paid for what; settling up takes too many transfers. |
| User | The one person who runs the CLI on their own laptop. People named in expenses never use the tool. |
| Out of scope | UI, web, API, network access, accounts, auth, payments (the tool moves no money), currencies other than one implicit currency, uneven splits, editing an expense (remove + re-add), import/export. |

## 2. Objectives

| ID | Objective | Measured by |
|---|---|---|
| BO-01 | Balances always reconcile to the cent | Sum of all balances = 0.00 after any command sequence (property test, Phase 2) |
| BO-02 | `settle` prints the fewest practical transfers by the stated algorithm | Worked examples + "applying transfers zeroes every balance" property test (Phase 2) |
| BO-03 | Zero-friction personal tool | Runs from a clone with `node src/cli.js …`; no install step |

## 3. Constraints

| ID | Constraint |
|---|---|
| CON-001 | Node.js 20+; standard library only — no npm dependencies |
| CON-002 | Entry point `node src/cli.js <command> [args]` |
| CON-003 | Data in one JSON file at `$LEDGER_FILE` (default `./ledger.json`), created on first write |
| CON-004 | CLI only; no network access |
| CON-005 | Tests use `node:test`, run with `node --test` |

## 4. Requirements

Groups: `ADD` add · `LST` list · `REM` remove · `BAL` balances · `SET` settle · `MNY` money · `VAL` validation/errors · `DAT` data file · `QA` tests & docs. All `Must`.

### Commands

| ID | Requirement | Phase |
|---|---|---|
| ADD-001 | `add <payer> <amount> <participants> [--note <text>]` records an expense paid by `<payer>`, split equally among the comma-separated `<participants>`. The payer shares the cost only if listed. | 1 |
| ADD-002 | `add` prints the new expense id on stdout: a positive integer, starting at 1. | 1 |
| ADD-003 | Ids are never reused, including after `remove` (the next id is persisted; see DAT-003). | 1 |
| ADD-004 | `--note <text>` attaches free text to the expense. [ASSUMPTION] OD-06: accepted before or after the positional args; value must be non-empty and free of control characters. | 1 |
| LST-001 | `list` prints one line per expense, oldest first: `<id> <payer> <amount, 2 decimals> <participants, comma-separated>`. | 1 |
| LST-002 | When the expense has a note, the line ends with ` # <note>`. Empty ledger → no output, exit 0. | 1 |
| REM-001 | `remove <id>` deletes the expense with that id; success prints nothing, exit 0. [ASSUMPTION] silent on success. | 1 |
| REM-002 | Unknown id, or an id that is not a positive integer → error (VAL-002). | 1 |
| BAL-001 | `balances` prints one line per person who appears in any expense (as payer or participant), sorted by name: `<name>: <signed amount>`, e.g. `alice: +10.00`, `bob: -10.00`, `carol: 0.00`. Positive = the person is owed money. | 2 |
| BAL-002 | Balance = (sum of amounts the person paid) − (sum of the person's shares). Zero prints as `0.00` with no sign. | 2 |
| BAL-003 | A person who appears only in since-removed expenses no longer appears. [ASSUMPTION] derived from "appears in any expense". | 2 |
| SET-001 | `settle` repeatedly takes the person who owes the most and the person owed the most (ties broken by name, alphabetical) and transfers the smaller of the two amounts, until every balance is zero. See ADR-003. | 2 |
| SET-002 | Output: one transfer per line, `<from> -> <to>: <amount, 2 decimals>`. Nothing printed when everyone is settled. | 2 |
| SET-003 | `settle` is read-only: it never modifies the data file. [ASSUMPTION] | 2 |

### Money

| ID | Requirement | Phase |
|---|---|---|
| MNY-001 | Money is exact: all arithmetic in integer cents; no floating point in any balance, share or transfer. See ADR-001. | 0 |
| MNY-002 | When an amount does not split evenly, leftover cents go one each to participants in alphabetical order, so shares always sum to the amount. | 0 |
| MNY-003 | `<amount>` is a positive decimal with at most two decimal places (`12.5`, `12.50`). Grammar `^[0-9]+(\.[0-9]{1,2})?$`, value > 0. Rejected: zero, negative, `.5`, `1.`, `1.234`, exponent, thousands separators, signs. Upper bound [ASSUMPTION] OD-03: total cents ≤ 10^12 (keeps all sums in safe-integer range). | 0 |

### Validation & errors

| ID | Requirement | Phase |
|---|---|---|
| VAL-001 | Names are 1–20 lowercase letters `a-z` (`^[a-z]{1,20}$`), for payer and every participant. | 0 |
| VAL-002 | Any invalid input — unknown command, bad name, bad amount, unknown id, missing argument — prints a message starting `error:` to stderr, prints nothing to stdout, and exits with code 2. Success exits 0. | 0 |
| VAL-003 | Also invalid [ASSUMPTION]: extra/unknown arguments or flags, `--note` without a value, empty participant list or empty entry (`a,,b`), duplicate participant (OD-02), no command at all (OD-05). Each is an `error:` + exit 2. | 0 |
| VAL-004 | A data file that exists but is unreadable or not valid ledger JSON → `error:` + exit 2, and the file is left untouched. [ASSUMPTION] OD-04: spec defines only exit codes 0 and 2, so no third code is introduced. | 0 |

### Data

| ID | Requirement | Phase |
|---|---|---|
| DAT-001 | The data file path is `$LEDGER_FILE`, default `./ledger.json` (relative to the current directory). | 0 |
| DAT-002 | A missing file is an empty ledger. The file is created on the first write only; read commands never create it. | 0 |
| DAT-003 | The file persists the next id, so ids are never reused. See ADR-002 for the format. | 0 |
| DAT-004 | Writes are atomic (temp file + rename) so a crash never leaves a half-written file. [ASSUMPTION] reserved ADR-005. | 0 |

### Quality & docs

| ID | Requirement | Phase |
|---|---|---|
| QA-001 | `README.md` says how to run the tool and how to run the tests. | 2 |
| QA-002 | Tests written by the builder, runnable with `node --test`, cover every requirement above; each phase ships its own tests. | 0–2 |

## 5. Assumptions

| ID | Assumption | Validate by |
|---|---|---|
| A-01 | One implicit currency; amounts have no symbol | Founder confirms; revisit if two currencies are ever needed |
| A-02 | Single user, single process: no file locking | Revisit if two terminals ever write at once |
| A-03 | The data file is local and trusted (founder answer); input from argv is the only untrusted surface | — |
| A-04 | Goal-exit strategy for build agents: bounded retries (3), then escalate | Founder may change in IMPLEMENTATION_PLAN Standing rules |

## 6. Risks

| ID | Risk | Mitigation |
|---|---|---|
| RSK-001 | Float or rounding creep breaks reconcile-to-the-cent | ADR-001; MNY-001; property test for BO-01 |
| RSK-002 | Spec ambiguity (participant order, duplicates, error on corrupt file) resolved differently than the founder intends | Defaults marked `[ASSUMPTION]`, tracked as OD-01..OD-06 in `docs/adr/README.md`; cheap to flip |
| RSK-003 | `settle` is greedy: it is not guaranteed to produce the mathematically minimal number of transfers | Accepted — "fewest practical transfers by the stated algorithm" is the success criterion (ADR-003) |

## 7. Compliance & security

No compliance regime applies (founder answer). Data: first names and amounts only; no payments made. Security stance: the data file is local and trusted; every CLI input is validated (VAL-001..003, MNY-003). No COMPLIANCE/THREAT_MODEL/NFR docs: see `AGENTS.md` omissions.
