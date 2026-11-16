# Rubric: shortlinks

Grade the submission against the specification. Each item is pass or fail. Items marked MUST decide the verdict: the verdict is "pass" only if every MUST item passes.

1. MUST no-deps: no npm dependencies or frameworks; only node: built-ins are imported.
2. MUST url-validation: only absolute http and https URLs up to 2048 characters are accepted (e.g. `javascript:` and `ftp:` are rejected), parsed with a real URL parser rather than a loose regex.
3. MUST rate-limit: a rolling 60-second window per client IP (not a fixed bucket that resets on the minute), using the injected clock, with a correct Retry-After.
4. MUST own-tests: the submission includes its own tests that run with `node --test` and cover creation, redirect, and the rate limit.
5. MUST readme: a README says how to run the service and how to run the tests.
6. errors: every error response is JSON `{"error":"<code>"}` with the specified status, through one consistent path.
7. body-safety: a request body that is not JSON is handled without crashing the server.
8. clarity: code is coherent and small; no dead code, stubs, or TODOs left in place of behaviour.
