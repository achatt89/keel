# Rubric: quotas (per-user quota follow-up)

Grade the submission against the specification. Each item is pass or fail. Items marked MUST decide the verdict: the verdict is "pass" only if every MUST item passes.

1. MUST no-deps: no npm dependencies; only node: built-ins are imported; no I/O.
2. MUST existing-intact: the existing store behaviour (users, put/overwrite/version, stat, remove, list, setPlan, summary) still works and no existing test was deleted or weakened.
3. MUST own-tests: the submission's own tests (runnable with `node --test`) cover quota refusal, overwrites and `usage`.
4. MUST atomic: a refused write changes nothing (no partial update of the file or of the usage).
5. MUST readme: the README documents the quotas and `usage`.
6. errors: a refused write throws `StoreError` with a code; no other error type escapes for bad input.
7. clarity: the change is coherent and small; no dead code, stubs or TODOs in place of behaviour.
