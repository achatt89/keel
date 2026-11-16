# Low-Level Design
## filestore

**Version:** 0.1 · **References:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md) · [PRD.md](./PRD.md)

Phase 1 signatures are **not** confirmed against code (absent from the tree, `A-01`, `OD-01`). Names below marked ⟨confirm⟩ must be read from `src/store.js` before Phase 2 starts; the contract (behaviour) is what matters.

## 1. Module map

| File | Exports | Phase | Owns |
|---|---|---|---|
| `src/store.js` | `createStore()`, `StoreError` | 1 (+2) | state, validation, API, quota decision |
| `src/plans.js` | `GB`, `PLANS`, `PLAN_LIMITS_BYTES`, `limitFor(plan)` | 2 | limits (only home of any limit number) |
| `src/units.js` | size formatter (binary) ⟨confirm name⟩ | 1 | summary-line display only |
| `test/*.test.js` | — | 1, 2 | `node:test` suites |

## 2. Core types (JSDoc shapes)

| Type | Shape |
|---|---|
| `Plan` | `'free' \| 'pro' \| 'team'` |
| `FileMeta` | `{ size: number, version: number }` (size: non-negative safe integer; version: integer ≥ 1) |
| `Usage` | `{ usedBytes: number, limitBytes: number \| null, percent: number \| null }` |
| `QuotaDetails` | `{ limitBytes: number \| null, usedBytes: number, requestedBytes: number }` |
| `StoreError` | `extends Error`; `code: 'invalid_input' \| 'not_found' \| 'quota_exceeded'`; `details?: QuotaDetails` (only on `quota_exceeded`) |

## 3. Public API contract

| Operation | Returns | Errors (in check order) |
|---|---|---|
| create user ⟨confirm name⟩ `(name, plan)` | user record with `id` `u_N` | `invalid_input` (name, plan) |
| write ⟨confirm name⟩ `(userId, path, size)` | file record `{ path, size, version }` ⟨confirm⟩ | `not_found` → `invalid_input` → `quota_exceeded` |
| `list(userId, prefix)` | files under prefix | `not_found` → `invalid_input` |
| `remove(userId, path)` | — ⟨confirm⟩ | `not_found` (user, then path) → `invalid_input` |
| `setPlan(userId, plan)` | updated user ⟨confirm⟩ | `not_found` → `invalid_input`; never touches files; allowed when it leaves the user over the new limit |
| `summary(userId)` | one-line string | `not_found` |
| `usage(userId)` *(Phase 2)* | `Usage` | `not_found` |

An unknown user is always reported before bad input (`ERR-002`), in every method, including a bad-input `usage` call.

## 4. Quota algorithm (Phase 2)

Inside write, after user lookup and input validation (steps 1–2 exist in Phase 1):

| Step | Action |
|---|---|
| 1 | Look up user by exact key; else `not_found`. |
| 2 | Validate path and size; else `invalid_input`. |
| 3 | `old = files.get(path)?.size ?? 0`; `delta = size - old`. |
| 4 | `limit = limitFor(user.plan)` (`null` = unlimited). |
| 5 | If `delta > 0` and (`used + delta > Number.MAX_SAFE_INTEGER` or (`limit !== null` and `used + delta > limit`)) → throw `quota_exceeded` with `details { limitBytes: limit, usedBytes: used, requestedBytes: size }`. Nothing mutated. |
| 6 | Mutate in one internal function: `files.set(path, { size, version: existing ? existing.version + 1 : 1 })`; `usedBytes += delta`. |

Rules the steps encode: limit inclusive (`used + delta == limit` passes); `delta <= 0` always passes (shrink, same size, new 0 B file) even when `used > limit`; `requestedBytes` is the new file size, not `delta`; `usedBytes` in details is the usage before the write.

`remove`: `usedBytes -= size` in the same internal function that deletes the entry.

## 5. `usage()` and percent

| Case | `limitBytes` | `percent` |
|---|---|---|
| `team` | `null` | `null` |
| `free` / `pro` | `limitFor(plan)` | `Number(BigInt(used) * 100n / BigInt(limit))` (BigInt division floors) |

Never `Math.round`, never float division (`NN-6`). `percent` may exceed 100 for an over-limit user `[ASSUMPTION A-04]`.

## 6. `plans.js` (Phase 2)

```
GB = 1_000_000_000                       // decimal, ADR-003
PLAN_LIMITS_BYTES = { free: 2 * GB, pro: 200 * GB, team: null }   // null = unlimited
limitFor(plan) -> number | null          // throws StoreError('invalid_input') on an unknown plan
```

`PLAN_LIMITS_BYTES` is frozen. The test for `NFR-CORR-001` asserts the literal pricing-page figures (2000000000, 200000000000, null), not `2 * GB`, so a wrong `GB` is caught.

## 7. Error handling

| Rule | Detail |
|---|---|
| One class | `StoreError(code, message, details?)`; `name` = `'StoreError'`; `code` own property. |
| Closed codes | `invalid_input`, `not_found`, `quota_exceeded`. A new code needs an ADR (it is HTTP-visible in Phase 3). |
| Messages | Human-readable, English, contain no other user's data; the `code` and `details` are the contract, not the message text. |
| Unexpected errors | Not wrapped; a non-`StoreError` thrown for a caller mistake is a bug (`NN-11`). |

## 8. Input validation rules

| Input | Valid | Else |
|---|---|---|
| userId | a string equal to an issued id | `not_found` |
| name | non-empty string, trimmed length ≤ 200 `[ASSUMPTION]` | `invalid_input` |
| plan | exactly `free`, `pro`, `team` | `invalid_input` |
| path | string, leading `/`, segments non-empty and not `.`/`..`, no NUL, ≤ 1024 chars `[ASSUMPTION]` | `invalid_input` |
| size | `Number.isSafeInteger(size) && size >= 0` | `invalid_input` |
| prefix | same rules as path, but may end with `/` | `invalid_input` |

Phase 1 may already differ in detail ⟨confirm against code; where it differs, the code is right and this table is corrected by doc-sync⟩.

---

*End of LLD.md — filestore*
