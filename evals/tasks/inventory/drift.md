# Drift check: inventory (keel condition, after each session)

Compare the project's documents with its code. Each item is pass or fail. Items marked MUST decide the verdict: the verdict is "pass" (no drift) only if every MUST item passes.

1. MUST plan-status: the implementation plan's status for each phase matches the code: a phase whose functions the code implements is not shown as not started, and a phase the code does not implement is not shown as done.
2. MUST no-contradiction: no statement in the documents contradicts the code's behaviour (function names, error codes, rules, file layout).
3. MUST changelog: the changelog records each phase the code implements.
4. readme: the README covers every function the code exports.
