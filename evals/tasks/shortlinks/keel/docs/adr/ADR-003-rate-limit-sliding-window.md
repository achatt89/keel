---
id: ADR-003
status: Accepted
paths: ["src/rate-limit.js", "src/server.js"]
check: test/rate-limit.test.js
---
# ADR-003 — Rate limit — per-IP rolling-window log, counted on success

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (Phase 1 scope; mechanism from founder spec, details [ASSUMPTION]) |
| **Deciders** | founder (limit: 5 per 60 s per IP) · engineering (mechanism, ordering) |
| **Bounded by** | RAT-001, RAT-002, SEC-001, A-02 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context
"At most 5 links in any rolling 60-second window" per client IP is exact, so a fixed-window counter (which allows 10 in a burst across a boundary) is wrong. The spec is silent on what a rejected request costs and on check order.

## Decision
| | |
|---|---|
| **Decision** | In the context of an exact rolling limit, facing fixed-window vs sliding log, we chose **a per-IP list of creation timestamps (from `options.now`), dropping entries ≤ now−60000 on each check; check after input validation and before the code-taken check; record only after a successful create; `Retry-After = max(1, ceil((oldest + 60000 − now)/1000))`** to achieve spec-exact behaviour that tests can drive with a fake clock, accepting O(5) memory per active IP. |
| **Revisit trigger** | A reverse proxy is introduced (client IP then needs `X-Forwarded-For` trust rules) or the limit becomes configurable. |

## Options considered
| Option | Pros | Cons | |
|---|---|---|---|
| Fixed window counter | Tiny | Allows 10 per 60 s at a boundary; violates "any rolling window" | ✗ |
| Token bucket | Smooth | Does not give "5 in any 60 s" exactly | ✗ |
| **Sliding log of ≤5 timestamps** | Exact; derives `Retry-After` directly | Per-IP list (bounded at 5) | ✓ |

## Consequences
| Consequence | Detail |
|---|---|
| Easier | Retry-After is the oldest slot's expiry; the limiter is a pure function of `now` |
| Harder | Counting only successes means invalid or conflicting requests are free (they create nothing); IPv4-mapped IPv6 must be normalised so one client has one key |
| Off the table | Trusting `X-Forwarded-For` (A-02); sharing limits across processes |
| Build deviation | none yet |
