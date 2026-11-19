# 2.6.5 checks replayed on the eval v2 folders (19 Nov 2026, no model calls)

`node .keel/check.mjs` (2.6.5) run inside each saved 2.6.4 attempt-2 session folder. No tokens spent; this is not a measurement of 2.6.5.

| session | judge (2.6.4) | new findings |
|---|---|---|
| r1-s1 | fail: deferred-item text, NFR overstating a test | deliverable-unticked ×2 (not what the judge cited) |
| r1-s2 | pass | deliverable-unticked ×2 |
| r1-s3 | pass | adr-mention-stale (docs/README calls ADR-006 reserved; it is Built), deliverable-unticked ×2 |
| r2-s1 | pass | deliverable-unticked ×2 |
| r2-s2 | pass | deliverable-unticked ×2 |
| r2-s3 | fail: invariant 5 "uncovered"; ADR-006 "reserved" | adr-mention-stale (ADR-006), deliverable-unticked ×2 |
| r3-s1 | fail: invariants rules 1 and 3 "Not built yet: Phase 1" | adr-status-stale ×5 (AGENTS.md:27–32), deliverable-unticked ×2 |
| r3-s2 | pass | deliverable-unticked ×2 |
| r3-s3 | fail: ADR-006 "reserved"; Phase 1 deliverables unticked | adr-mention-stale (ADR-006), deliverable-unticked ×2 |

**Caught:** 3 of the 4 failing sessions get a finding on the drift the judge cited (r2-s3, r3-s1, r3-s3). **Not caught:** r1-s1 (needs reading; doc sync Step 7 now re-reads deferred rows) and r2-s3's "uncovered" cell (whether a test covers a rule is not deterministic; that session is caught by its other item).

**Also reported:** real slips the judge passed: ADR-006 "reserved" in r1-s3; unticked Phase 1 deliverables in all 9 (no session ticked them; the 2.6.5 merge step now does).

**False positives:** none seen. Earlier saved runs (eval v1, 2.6.2, 2.6.3, 2.6.4 attempt 1) gave no new keystone or ADR-mention findings; their deliverable-unticked findings name files that exist under unticked boxes.
