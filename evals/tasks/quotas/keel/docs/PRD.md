# Product Requirements Document
## filestore — metadata core of a small file-storage service for freelancers

**Version:** 0.1 · **Date:** 2026-11-16 · **References:** [BRD.md](./BRD.md)

---

## 1. Product vision

A dependency-free JavaScript module that is the single source of truth for who stores what and how much they may store. A later HTTP layer (Phase 3) and the app's account page call it; nothing else decides a limit.

## 2. Personas

| Persona | Role | Cares about |
|---|---|---|
| Freelancer | End user of the future app | Their plan, how full they are, a clear refusal when full, never losing files on a downgrade. |
| Founder | Runs support; owns pricing | One table of limits equal to the pricing page; errors that explain themselves. |
| Developer (founder + Claude Code) | Builds and maintains | Small API, fixed error contract, tests that pin the boundaries. |

## 3. Journeys

| Journey | Steps (module-level) |
|---|---|
| Normal upload | create user → write `/docs/a.pdf` (size) → `usage` shows used / limit / percent. |
| Hit the limit | write brings user to exactly the limit (allowed) → next write of 1 byte refused with `quota_exceeded` and `details`. |
| Overwrite | write same path with a bigger/smaller file → version +1; only the difference counts. |
| Downgrade | `setPlan` `pro` → `free` while at 50 GB → files stay; writes that grow usage are refused; removals and shrinking overwrites work. |
| Free space | `remove` a file → `usage` drops immediately; a previously refused write now succeeds. |

## 4. Feature list (MoSCoW)

Phase 1 features are described by the founder as built; their acceptance criteria are the contract tests to confirm against the code (`RSK-003`).

### Outcome: users and files (Phase 1)

#### F-01 — Users and plans
`Must` · Phase 1 · satisfies `USR-001`, `USR-002`, `USR-003`, `SEC-002`
- Ids are issued by the store (`u_1`, `u_2`, …); a caller-made id such as `u_99` or `__proto__` is `not_found`.
- Plans are exactly `free`, `pro`, `team`; anything else is `invalid_input`.
- `setPlan` keeps every file and every version.
- `summary(user)` returns one line (unchanged in Phase 2, `OD-02`).

#### F-02 — Write files with versions
`Must` · Phase 1 · satisfies `FIL-001`, `FIL-002`, `SEC-001`, `SEC-003`, `SEC-004`
- First write of a path → version 1 (`A-02`); each overwrite → previous version + 1.
- Invalid path (relative, contains `..`, empty, non-string) or invalid size → `invalid_input`.

#### F-03 — List and remove
`Must` · Phase 1 · satisfies `FIL-003`, `FIL-004`
- `list(user, prefix)` returns only that user's files under the prefix; another user's files never appear.
- `remove` of a missing path → `not_found`.

### Outcome: storage stays within the plan (Phase 2)

#### F-04 — Plan limits table
`Must` · Phase 2 · satisfies `QTA-001`, `QTA-008`, `BO-02`
- `free` = 2,000,000,000 B; `pro` = 200,000,000,000 B; `team` = unlimited (`null`).
- 1 GB = 1,000,000,000 B; the binary helper in `units.js` is never consulted (`ADR-003`).

#### F-05 — Quota check on write
`Must` · Phase 2 · satisfies `QTA-002`, `QTA-003`, `QTA-005`, `ERR-002`, `SEC-004`
Acceptance criteria (each is a test, free plan unless noted):

| # | Given | When | Then |
|---|---|---|---|
| AC-1 | empty free user | write 2,000,000,000 B | allowed; `usedBytes` 2,000,000,000 |
| AC-2 | empty free user | write 2,000,000,001 B | `quota_exceeded`; nothing changed |
| AC-3 | free user at 1,999,999,999 B | write a new 1 B file | allowed (exactly at limit) |
| AC-4 | free user at limit | write a new 1 B file | `quota_exceeded` |
| AC-5 | file of 1,000 B, user has 500 B headroom | overwrite with 1,500 B | allowed (delta 500) |
| AC-6 | same, user has 499 B headroom | overwrite with 1,500 B | `quota_exceeded` (delta 500 > 499) |
| AC-7 | user at limit | overwrite a file with a smaller or equal size | allowed; version +1 |
| AC-8 | `pro` user at 50 GB, downgraded to `free` | write a new 1 B file | `quota_exceeded` |
| AC-9 | same user | overwrite a file smaller / remove a file | allowed; `usedBytes` drops |
| AC-10 | over-limit user | write a new 0 B file | allowed (does not increase usage) |
| AC-11 | unknown user, invalid path, size that would exceed | each | `not_found` before `invalid_input` before `quota_exceeded` |
| AC-12 | `team` user | write 10^12 B | allowed |
| AC-13 | any refused write | inspect store | files, versions, usage identical to before |

#### F-06 — `quota_exceeded` contract
`Must` · Phase 2 · satisfies `QTA-004`, `BO-03`
- `StoreError.code === 'quota_exceeded'`; `details` = `{ limitBytes, usedBytes, requestedBytes }`.
- `limitBytes` = plan limit; `usedBytes` = usage before the write; `requestedBytes` = size of the file being written (the new size, **not** the delta).
- Example: free user at 1,500,000,000 B writes a new 600,000,000 B file → `{ limitBytes: 2000000000, usedBytes: 1500000000, requestedBytes: 600000000 }`.

#### F-07 — `usage(user)`
`Must` · Phase 2 · satisfies `QTA-006`
- Returns `{ usedBytes, limitBytes, percent }`; `percent` = floor(used × 100 / limit).
- 1,999,999,999 B of 2,000,000,000 → 99 (never 100 before full); exactly full → 100; empty → 0.
- `team` → `limitBytes: null`, `percent: null`. Unknown user → `not_found`.
- Over-limit user (after downgrade) → percent above 100, not capped `[ASSUMPTION A-04, OD-03]`.

#### F-08 — Space is freed at once
`Must` · Phase 2 · satisfies `QTA-007`
- `remove` lowers `usedBytes` by the file's size in the same call; no deferred cleanup.

### Later

#### F-09 — HTTP API
`Won't` (now) · Phase 3 · not scoped; scope with `/keel phase new`. Brings GDPR basics for account names (`OD-06`).

## 5. UX flows

None (no UI). The module's error messages and `details` are the only user-visible surface; the app renders them.

## 6. Roadmap

| Phase | Name | Delivers |
|---|---|---|
| 1 | Core | F-01..F-03 (built per founder) |
| 2 | Storage quotas | F-04..F-08 |
| 3 | HTTP API | F-09 (out of scope) |

## 7. Non-goals (now)

HTTP, UI, persistence, content storage, billing, auth, quota warnings/notifications, per-folder limits, soft limits or grace periods, a cap on `team`.

## 8. Success metrics

Product success is `BRD.md §6`. Feature-level: all of AC-1..AC-13 green on `node --test` before Phase 2 closes.

---

*End of PRD.md — filestore*
