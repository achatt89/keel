# ledger — Architecture (lite)

Requirements: `BRD.md`. Decisions: `adr/README.md`. No LLD: module contracts are §4 here (prototype tier).

## 1. Principles

| ID | Principle |
|---|---|
| P-01 | Integer cents everywhere; strings only at the edges (parse in, format out). ADR-001 |
| P-02 | Pure core, thin shell: money, balances and settle are pure functions; only `store.js` touches disk and only `cli.js` touches argv/stdout/stderr/exit. |
| P-03 | One error path: every invalid input throws `UsageError`; one top-level handler prints `error: <msg>` to stderr and exits 2. Nothing else sets a non-zero exit code. |
| P-04 | Validate before any write; a failed command never changes the file. |
| P-05 | Standard library only (`node:fs`, `node:path`, `node:test`, `node:assert`). |

## 2. Components & data flow

```
argv ──► cli.js ──► commands/{add,list,remove,balances,settle}.js
                         │  parse+validate (names.js, money.js)
                         ▼
                    store.js  ◄──► $LEDGER_FILE (JSON)
                         │
          balances.js ◄──┘ (pure)      settle.js (pure) ◄── balances
                         ▼
                  lines → stdout       UsageError → stderr, exit 2
```

Read commands (`list`, `balances`, `settle`): load → compute → print. Write commands (`add`, `remove`): load → validate → mutate in memory → atomic save → print.

## 3. Data file (ADR-002)

```json
{ "version": 1, "nextId": 3,
  "expenses": [
    { "id": 1, "payer": "alice", "amountCents": 1250, "participants": ["alice","bob"], "note": "pizza" }
  ] }
```

`note` omitted when absent. `expenses` ordered by id ascending (= oldest first, since ids only increase). `participants` kept in the order entered [ASSUMPTION OD-01]. Shares are **not** stored; they are recomputed from `amountCents` + participants (single source of truth, no drift).

## 4. Modules (the contract the builder implements)

| § | Module | Exports | Owns / does not own |
|---|---|---|---|
| 4.1 | `src/money.js` | `parseAmount(str) → cents` · `formatCents(c) → "12.50"` · `formatSigned(c) → "+10.00"/"-10.00"/"0.00"` · `splitCents(total, names) → Map name→cents` | Owns all cents math (MNY-001..003). `splitCents`: sort names, `base = floor(total/n)`, `r = total mod n`, first `r` names get `base+1`. Never uses floats; `parseAmount` splits the string on `.`, no `parseFloat`. |
| 4.2 | `src/names.js` | `parseName(str)` · `parseParticipants(str) → string[]` | VAL-001, VAL-003 (empty entry, duplicates). Throws `UsageError`. |
| 4.3 | `src/errors.js` | `class UsageError extends Error` | Only error type that maps to exit 2 (P-03). |
| 4.4 | `src/store.js` | `ledgerPath()` · `load() → {nextId, expenses}` · `save(ledger)` | DAT-001..004, VAL-004. Missing file → `{nextId:1, expenses:[]}`. `save` writes `<file>.tmp-<pid>` then `rename` (ADR-005). Validates shape on load. |
| 4.5 | `src/cli.js` | (entry; no exports) | Parses argv, dispatches to `commands/*`, owns the single try/catch, writes stdout lines, sets `process.exitCode` (0 or 2). Argument parsing approach: ADR-004. |
| 4.6 | `src/commands/*.js` | one `run(args, ledger) → { lines, ledger? }` each | Command-specific validation and output formatting. Return lines, do not print — keeps them unit-testable. |
| 4.7 | `src/balances.js` | `computeBalances(expenses) → Map name→cents` | BAL-001..003. For each expense: payer `+= amountCents`; each participant `-= share` (via `splitCents`). Sum is always 0 (BO-01). |
| 4.8 | `src/settle.js` | `settle(balances) → [{from,to,cents}]` | SET-001, ADR-003. Loop: debtor = most negative (tie: name asc), creditor = most positive (tie: name asc), `t = min(-d, c)`, emit, adjust, stop when all zero. |

## 5. Error & exit contract

| Situation | stdout | stderr | exit |
|---|---|---|---|
| Success | result lines (or nothing) | — | 0 |
| Any `UsageError` (VAL-002/003/004) | nothing | `error: <message>` (one line) | 2 |
| Unexpected exception (a bug) [ASSUMPTION] | nothing | `error: internal: <message>` | 2 |

The unexpected-exception row exists so the "only 0 or 2" contract holds even on a defect; the handler still prints `error:` first.

## 6. Security & trust boundaries

One boundary: argv/env → validators. Everything after validation is trusted internal data. The data file is trusted-local (founder answer) but shape-checked on load (VAL-004) so a hand-edited file fails cleanly rather than corrupting balances. No network, no subprocess, no `eval`, no dynamic `require` of user input. `LEDGER_FILE` is used as given (the user owns their environment); the tool never reads or writes any other path.

## 7. Accepted risks

| ID | Risk | Accepted because | Revisit when |
|---|---|---|---|
| RSK-003 | Greedy settle may not be globally minimal in transfer count | It is the founder-specified algorithm (ADR-003) | Founder wants provably-minimal transfers |
| A-02 | No file locking; two concurrent writers can lose an update | One user, one laptop | Two terminals/processes ever write at once |

## 8. Observability, cost, deployment

None. No logging, metrics, hosting, or spend. Run from a clone (`node src/cli.js`); no `DEPLOYMENT.md` (no remote environment).
