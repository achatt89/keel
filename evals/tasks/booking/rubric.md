# Rubric: booking

Grade the submission against the specification. Each item is pass or fail. Items marked MUST decide the verdict: the verdict is "pass" only if every MUST item passes.

1. MUST no-deps: no npm dependencies; only node: built-ins are imported; no I/O.
2. MUST strict-time: timestamps are validated strictly (exact format, real calendar date, quarter-hour minutes), not by trusting `new Date()` parsing alone (which accepts many formats and rolls invalid dates over).
3. MUST half-open: overlap checks treat intervals as half-open, for rooms and for people, and `overlap` takes precedence over `person_busy`.
4. MUST own-tests: the submission includes its own tests that run with `node --test` and cover overlap, person_busy, and opening hours.
5. MUST readme: a README says how to use the library and how to run the tests.
6. errors: every rule violation throws BookingError with the specified code; no other error types escape for bad input.
7. free-intervals: free() computes gaps within 09:00-18:00 correctly, merging nothing it should not.
8. clarity: code is coherent and small; no dead code, stubs, or TODOs left in place of behaviour.
