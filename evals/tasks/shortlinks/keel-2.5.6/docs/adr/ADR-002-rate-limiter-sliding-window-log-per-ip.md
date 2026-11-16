# ADR-002 — Rate limiter — sliding-window log per IP, successful creations only

| | |
|---|---|
| **Status** | Proposed 2026-11-16 — `[ASSUMPTION]` details; implement as written unless the founder overrides (OD-02) |
| **Deciders** | founder (what counts) · engineering (algorithm) |
| **Bounded by** | ABU-001, ABU-002, CON-004, A-04, RSK-002, RSK-006 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

"At most 5 links in any rolling 60-second window" plus an exact `Retry-After` rules out fixed-window counters, which allow 10 creations across a boundary and cannot compute a precise wait. The spec does not say whether failed creations count.

## Decision

| | |
|---|---|
| **Decision** | In the context of a per-IP creation limit with an exact `Retry-After`, facing fixed-window, token-bucket and sliding-log designs, we chose a **sliding-window log**: per IP an ascending array of creation timestamps from `options.now()`; entries with `t + 60000 <= now` are dropped; at 5 live entries the request is refused with `Retry-After = max(1, ceil((oldest + 60000 - now)/1000))`; only successful creations are recorded; an IP whose array empties is deleted from the map — accepting O(5) memory per active IP and that failed requests are unlimited. |
| **Revisit trigger** | Memory for the window map is observed growing, or failed-request spam (400/409) becomes a problem. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Fixed window counter | trivial | 10 creations across a boundary violates "any rolling window"; imprecise `Retry-After` | ✗ |
| Token bucket | smooth | `Retry-After` and "at most 5 in any 60 s" harder to prove exactly | ✗ |
| **Sliding-window log** | exactly the spec; trivially testable with a fake clock | stores ≤ 5 timestamps per IP | ✓ |
| Count every attempt | stronger anti-abuse | a typo (400) burns a slot; spec says "create" | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Deterministic tests: fake clock, exact `Retry-After` at any offset |
| Harder | Limiter check and record must stay in the same synchronous step as the store write (no `await` between) |
| Off the table | Limiting failed requests; shared state across processes |
| Build deviation | *(filled at Built)* |
