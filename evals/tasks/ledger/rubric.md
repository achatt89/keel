# Rubric: ledger

Grade the submission against the specification. Each item is pass or fail. Items marked MUST decide the verdict: the verdict is "pass" only if every MUST item passes.

1. MUST money-cents: all money arithmetic uses integer cents; no floating-point money arithmetic (parsing via parseFloat then multiplying is a fail unless it is rounded safely and immediately to an integer).
2. MUST no-deps: no npm dependencies (package.json, if present, has no dependencies; only node: built-ins are imported).
3. MUST errors: invalid input writes a message starting with `error:` to stderr and exits with code 2, through one consistent path.
4. MUST own-tests: the submission includes its own tests that run with `node --test` and cover splitting with leftover cents and settle.
5. MUST readme: a README says how to run the tool and how to run the tests.
6. remainder-rule: leftover cents go one each to participants in alphabetical order.
7. settle-algorithm: settle follows the stated algorithm (largest debtor with largest creditor, ties by name).
8. clarity: code is coherent and small; no dead code, stubs, or TODOs left in place of behaviour.
