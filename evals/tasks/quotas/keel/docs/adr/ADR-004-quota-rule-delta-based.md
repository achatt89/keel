# ADR-004 — Quota rule — delta-based, inclusive limit, non-increasing writes always allowed

| | |
|---|---|
| **Status** | Proposed 2026-11-16 (Phase 2 scope) · Accepted 2026-11-16 (founder, confirmed against the pricing page) |
| **Deciders** | founder · engineering |
| **Bounded by** | QTA-002, QTA-003, QTA-005, SEC-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 2 |

## Context

Overwrites replace bytes, and a downgrade can leave a user above the new limit; a naive `used + size > limit` check would refuse legitimate overwrites and block removals' follow-ups.

## Decision

| | |
|---|---|
| **Decision** | In the context of per-plan limits with overwrites and downgrades, facing a check on the new size alone or a hard block while over limit, we chose **`delta = new − old`; allow iff `delta <= 0` or `used + delta <= limit`; check completes before any mutation; a write that would pass `Number.MAX_SAFE_INTEGER` is refused as `quota_exceeded`**, accepting that an over-limit user can shrink and delete but not grow. |
| **Revisit trigger** | Pricing introduces soft limits, grace periods or per-folder limits. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Check new size vs remaining space | Simple | Wrong for overwrites | ✗ |
| Block all writes while over limit | Simple | Also blocks shrinking overwrites; hostile | ✗ |
| **Delta rule** | Exact; downgrade-safe | Needs the old size at hand | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | AC-1..AC-13 are directly derivable (`PRD.md §4 F-05`). |
| Harder | Over-limit users generate support (`RSK-005`). |
| Off the table | Soft limits, grace periods. |
| Build deviation | none — built as decided |
