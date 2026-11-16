# System Architecture Document
## filestore

**Version:** 0.1 · **References:** [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md) · [LLD.md](./LLD.md) · [adr/README.md](./adr/README.md)

A small system: one in-process module. This document replaces a separate HLD (omitted; trigger: more than one deployable component, i.e. Phase 3).

## 1. Architecture principles

| ID | Principle | Source |
|---|---|---|
| P-01 | One module, one state: all metadata lives inside the object returned by `createStore()`. | `ADR-001` |
| P-02 | Decide, then mutate: no state change before every check has passed. | `ADR-004` |
| P-03 | One number, one place: limits are data in `plans.js`, not logic. | `ADR-003` |
| P-04 | Errors are values of one type (`StoreError`) with a closed set of codes. | `ADR-002` |
| P-05 | Metadata only: bytes of content never enter this module. | `CON-002` |

## 2. Components

```
caller (tests now; HTTP layer in Phase 3)
   │  createStore() → store
   ▼
src/store.js ──── StoreError(code, message, details?)
   │  uses                    │ summary only
   ▼                          ▼
src/plans.js (limits, GB)   src/units.js (binary display)
   state: Map<userId, User{ name, plan, files: Map<path,{size,version}>, usedBytes }>
```

| Component | Responsibility | Does not own |
|---|---|---|
| `src/store.js` | Public API; validation; quota decision; state; `StoreError`. | Limit numbers; unit formatting. |
| `src/plans.js` *(Phase 2)* | `PLAN_LIMITS_BYTES`, `limitFor(plan)`, the decimal `GB` constant. | Any state. |
| `src/units.js` | Binary size formatting for the summary line. | Limits (`QTA-008`). |
| Object storage *(external)* | File content. | Metadata. |

## 3. Data

In-memory only (`CON-002`). `Map` for users and for each user's files. `usedBytes` is the sum of that user's file sizes (`ADR-006`). Restart loses everything (`RSK-006`); a persistence phase would replace the `Map`s behind the same API.

## 4. API

Module API only (signatures: `LLD.md §3`). HTTP arrives in Phase 3: it must map `StoreError.code` to status codes without changing the codes (`invalid_input`→400, `not_found`→404, `quota_exceeded`→ a 4xx; mapping decided then).

## 5. Security architecture

Trust boundary: everything that calls the store is untrusted input, including sizes.

| Threat category | Control |
|---|---|
| Forged or guessed user id | Ids are looked up by exact key in a `Map`; unknown → `not_found` (`NN-7`). `__proto__`, `constructor`, `u_01`, `U_1`, numbers, objects → `not_found`. |
| Path traversal / confinement | Single `validatePath`: string, starts with `/`, no empty, `.` or `..` segment, no NUL/backslash `[ASSUMPTION]`, bounded length `[ASSUMPTION: 1024]`. |
| Bad numbers | Size must be a non-negative safe integer (not NaN, float, negative, string, `Infinity`). |
| Quota bypass by overwrite tricks | Delta-based rule (`ADR-004`); overwrite grows are checked, shrinks free space. |
| Quota bypass via integer overflow | Usage ceiling `Number.MAX_SAFE_INTEGER` (`A-08`); BigInt for percent (`NN-6`). |
| Quota bypass via lying sizes | **Not solvable in this module**: sizes are caller-asserted (`RSK-004`). Phase 3 must source size from object storage. |
| State corruption on refusal | Decide-then-mutate (`NN-3`). |
| Prototype pollution via names/paths | `Map` everywhere; no dynamic property writes with caller keys. |
| Information disclosure | Errors carry only the user's own `limitBytes/usedBytes/requestedBytes`; no other user's data. |
| Supply chain | No dependencies (`NFR-MAINT-001`). |

## 6. Observability, cost

No logging or metrics yet (library). Cost model: out of scope here; this module exists to bound storage cost (`BO-01`). `team` stays unbounded (`RSK-001`).

## 7. Concurrency

All public methods are synchronous; Node runs them to completion one at a time, so decide-then-mutate is atomic without locks (`A-05`). Any future `await` between the quota check and the mutation breaks this: `ADR-006` revisit trigger.

## 8. Residual & accepted risks

| ID (BRD) | Risk | Revisit trigger |
|---|---|---|
| RSK-001 | `team` unlimited | first `team` user above an agreed cost threshold |
| RSK-004 | caller-asserted sizes | start of Phase 3 scoping |
| RSK-005 | downgraded users stuck over limit | first support case |
| RSK-006 | in-memory data loss | first paying customer |

---

*End of ARCHITECTURE.md — filestore*
