# Business Requirements Document
## filestore — metadata core of a small file-storage service for freelancers

**Version:** 0.1 · **Date:** 2026-11-16 · **Tier:** Product / MVP · **Owner:** founder
**Status of inputs:** every line of the founder's description is a confirmed requirement (`docs/keel-transcript.md`). `[ASSUMPTION]` marks anything the interview did not settle.

---

## 1. Executive summary

`filestore` is the in-memory metadata core of a file-storage service: users (with a plan), and each user's files by path (size in bytes, version). File content lives in object storage; this module keeps metadata only. It ships as a Node.js 20+ ES module with no dependencies (`ADR-001`). Phase 1 (core) is built per the founder; Phase 2 adds per-user storage quotas; Phase 3 (HTTP API) is out of scope for now.

## 2. The problem

| | |
|---|---|
| Who has it | The founder: storage cost is unbounded because nothing limits what a user stores. |
| Who is affected | Freelancers who store client files (paying customers from launch); the founder, who runs support. |
| Why now | Paying customers and billing depend on this module; plans exist on the pricing page but nothing enforces them. |

## 3. Business objectives

| ID | Objective | Measure |
|---|---|---|
| BO-01 | Every user stays within their plan's storage limit. | No accepted write ever leaves a user above the limit it started under (`NFR-CORR-002`). |
| BO-02 | Every limit, message and number matches the pricing page exactly. | Limits table test equals pricing-page figures (`NFR-CORR-001`); decimal GB (`ADR-003`). |
| BO-03 | The founder can resolve a storage support case from the error alone. | `quota_exceeded` carries `{ limitBytes, usedBytes, requestedBytes }` (`QTA-004`). |
| BO-04 | The core stays small, dependency-free and maintainable by one developer. | Zero runtime dependencies (`NFR-MAINT-001`). |

## 4. Positioning & users

| User | Need |
|---|---|
| Freelancer (end user, via a future app) | Store client files; see usage and plan limits that match what they bought. |
| Founder / support | Explain any refusal or number precisely; change a plan without losing files. |

Competitive positioning is out of scope for this document (no market research in the interview). Almanac: not included.

## 5. Business requirements

Group prefixes: `USR` users & plans · `FIL` files · `ERR` errors · `QTA` quotas & usage · `SEC` input & trust. Priorities are MoSCoW. "Phase" is the `IMPLEMENTATION_PLAN` phase that delivers it.

### USR — Users & plans

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| USR-001 | The store issues user ids `u_1`, `u_2`, … itself; each user has a name and a plan `free` \| `pro` \| `team`. | Must | 1 |
| USR-002 | `setPlan` changes a user's plan and never deletes files. | Must | 1 |
| USR-003 | `summary` returns a one-line summary for the account page. | Must | 1 |

### FIL — Files

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| FIL-001 | Each user's files are keyed by path (e.g. `/docs/a.pdf`) with size in bytes and a version. | Must | 1 |
| FIL-002 | Overwriting a path bumps its version. | Must | 1 |
| FIL-003 | `list` returns a user's files under a path prefix. | Must | 1 |
| FIL-004 | `remove` deletes a file's metadata. | Must | 1 |

### ERR — Errors

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| ERR-001 | Failures throw `StoreError` with a `code`: `invalid_input`, `not_found` (Phase 1), `quota_exceeded` (Phase 2). | Must | 1, 2 |
| ERR-002 | Check order is fixed: unknown user (`not_found`), then bad input (`invalid_input`), then quota (`quota_exceeded`). | Must | 1, 2 |

### QTA — Quotas & usage (Phase 2)

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| QTA-001 | Plan limits: `free` 2 GB, `pro` 200 GB, `team` unlimited. GB is decimal: 1 GB = 1,000,000,000 bytes. | Must | 2 |
| QTA-002 | A write that brings usage exactly to the limit is allowed; one byte more is refused. | Must | 2 |
| QTA-003 | An overwrite counts only the change (new size − old size). A write that does not increase usage is always allowed, even when the user is over the limit (e.g. after `pro` → `free`). | Must | 2 |
| QTA-004 | A refused write throws `StoreError` `quota_exceeded` with `details { limitBytes, usedBytes, requestedBytes }` = plan limit, usage before the write, size of the file being written. | Must | 2 |
| QTA-005 | A refused write changes nothing (files, versions, usage). | Must | 2 |
| QTA-006 | `usage(user)` returns `{ usedBytes, limitBytes, percent }`; `percent` is an integer rounded down; `team` → `limitBytes` and `percent` `null`; unknown user → `not_found`. | Must | 2 |
| QTA-007 | Removing a file frees its space at once. | Must | 2 |
| QTA-008 | `units.js` (binary display helper) is used only by the summary line, never for limits. | Must | 2 |

### SEC — Input & trust

| ID | Requirement | Pri | Phase |
|---|---|---|---|
| SEC-001 | Validate every input of every public method. | Must | 1, 2 |
| SEC-002 | Never trust caller-supplied ids: a user id is honoured only if the store issued it; ids cannot reach inherited/prototype keys. | Must | 1 |
| SEC-003 | Paths are confined: absolute, normalised, no `..` segment. | Must | 1 |
| SEC-004 | Sizes are non-negative safe integers; usage can never exceed `Number.MAX_SAFE_INTEGER` (`A-08`). | Must | 2 |

## 6. Success metrics

| Metric | Target |
|---|---|
| Plan-limit correctness | 100 % of boundary cases in the PRD acceptance criteria pass (`NFR-CORR-002`). |
| Pricing-page parity | Zero discrepancies between the limits table and the pricing page, checked at each release `[ASSUMPTION: founder compares by hand — the pricing page is not machine-readable here]`. |
| Support | Founder resolves a refusal from `details` without reading code (qualitative). |

## 7. Constraints

| ID | Constraint |
|---|---|
| CON-001 | Node.js 20+, standard library only, ES modules, `node:test` for tests. |
| CON-002 | In memory for now; metadata only — content stays in object storage. |
| CON-003 | Limits and wording must match the pricing page; GB is decimal. |
| CON-004 | `units.js` stays binary and is display-only. |
| CON-005 | One developer building with Claude Code. |
| CON-006 | No HTTP, no UI, no deployment until Phase 3. |

## 8. Assumptions

| ID | Assumption | Validate by |
|---|---|---|
| A-01 | Phase 1 exists as the founder describes, but **no code is present in this working tree** at generation time; docs are written from the description. | Add the code; run `OD-07`. |
| A-02 | Ids are a store-held counter starting at `u_1`; a file's first write has version 1; remove-then-recreate restarts at 1 (`OD-08`). | Read `src/store.js`. |
| A-03 | Size 0 is valid; size is a non-negative safe integer (`OD-04`). | Read `src/store.js`. |
| A-04 | `percent` is not capped at 100 for an over-limit user (`OD-03`). | Founder. |
| A-05 | The API is synchronous and single-process; no concurrent mutation (`ADR-006`). | Revisit if persistence or HTTP makes it async. |
| A-06 | Method names for create-user and write are whatever `src/store.js` exports; docs say "create user" / "write" (`OD-01`). | Read `src/store.js`. |
| A-07 | Tests live in `test/*.test.js`. | Repo layout. |
| A-08 | A write that would push usage past `Number.MAX_SAFE_INTEGER` is refused with `quota_exceeded` (even for `team`, where `limitBytes` is `null`). | Engineering (`ADR-004`). |

## 9. Out of scope (v1 / now)

HTTP API (Phase 3) · UI · persistence · object-storage access · billing/payment logic · authentication · file content · user deletion · multi-user sharing · rate limiting.

## 10. Risk register

| ID | Risk | L | I | Mitigation / status |
|---|---|---|---|---|
| RSK-001 | `team` is unlimited, so the original problem (unbounded storage cost) remains for that plan. | M | H | Accepted per pricing; founder to confirm no fair-use ceiling (`OD-05`); only hard stop is the safe-integer ceiling (`A-08`). Revisit trigger: first `team` user above an agreed cost threshold. |
| RSK-002 | The summary line uses binary units (`units.js`) beside decimal plan limits; a user could see "1.86 GB" against a "2 GB" plan and think the numbers disagree with the pricing page. | M | M | Summary unchanged in Phase 2 and shows no limit (`OD-02`); `QTA-008`. |
| RSK-003 | Phase 1 is claimed built but absent from the tree: nothing verified, signatures guessed. | H | M | `OD-07`, `A-01`; Phase 1 stays 🔄 until its gates have evidence. |
| RSK-004 | Sizes are caller-asserted; if the future HTTP layer takes them from clients, quotas can be bypassed (declare 1 byte, upload 10 GB). | M | H | Phase 3 must take sizes from object storage, not the client (`ARCHITECTURE.md §5`). Out of scope now. |
| RSK-005 | A downgrade leaves a user over their limit; they can delete or shrink but not add, which generates support load. | M | L | By design (`QTA-003`); `details` explains it (`BO-03`). |
| RSK-006 | In-memory state is lost on restart. | H | M | Accepted until a persistence phase (`CON-002`). Revisit trigger: first paying customer. |
| RSK-007 | Usage counter drifts from the sum of file sizes (if `ADR-006` picks a counter). | L | H | Single mutation path + invariant test (`NFR-CORR-003`). |

## 11. Dependencies

Node.js ≥ 20 · the pricing page (source of `QTA-001`) · object storage (outside this module).

---

*End of BRD.md — filestore*
