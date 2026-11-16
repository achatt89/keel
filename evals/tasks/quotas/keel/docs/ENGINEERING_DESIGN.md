# filestore — Engineering Design

**Version:** 0.1 · **References:** [BRD.md](./BRD.md) · [PRD.md](./PRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [LLD.md](./LLD.md)

## 1. What this document is

The bridge from requirements to code: pillars, the domain model, data classes and the numbered **non-negotiables**. The keystone (`AGENTS.md`) lists the load-bearing few; this file holds the full list and the rationale.

## 2. Design pillars

| # | Pillar | Means |
|---|---|---|
| 1 | **Correctness over cleverness** | Money depends on the numbers; every boundary is a named test (`PRD.md` AC-1..AC-13). |
| 2 | **One home per number** | Limits live in one table; no other file mentions a limit (`ADR-003`). |
| 3 | **Fail before mutate** | Validate and decide first; mutate last, in one step (`QTA-005`, `ADR-004`). |
| 4 | **Standard library only** | No dependencies; Node 20+, ES modules, `node:test` (`ADR-001`). |
| 5 | **Callers are untrusted** | Ids, paths, sizes, plan names are all validated (`SEC-001..004`). |

## 3. Domain model

| Entity | Fields | Notes |
|---|---|---|
| User | `id` (`u_N`, store-issued), `name`, `plan`, files, `usedBytes` | `usedBytes` per `ADR-006` (Proposed). |
| File | key = path; `size` (bytes), `version` | metadata only; content is in object storage. |
| Plan | `free` \| `pro` \| `team` → limit in bytes or `null` (unlimited) | table in `plans.js` (`ADR-003`). |

Boundary: a file belongs to exactly one user; every lookup is scoped by user id first. Another user's paths are unreachable by construction (`F-03`).

## 4. Data classification

| Class | Data | Handling |
|---|---|---|
| C0 | Plan names, limits, sizes, versions | No restriction. |
| C1 | File paths | May reveal client names (freelancers store client files): never log paths in telemetry without need `[ASSUMPTION]`. |
| C2 | Account names (personal data) | Only personal data held. GDPR basics are a Phase 3 concern (`OD-06`). |
| C3 | — | Not held (no content, no credentials, no payment data). |

## 5. System decomposition

Single ES-module package: `src/store.js` (public API, `StoreError`), `src/plans.js` (limits; Phase 2), `src/units.js` (binary display helper). Detail: `ARCHITECTURE.md §2`, `LLD.md §1`.

## 6. Non-negotiables

| # | Rule | Rationale | Verified by |
|---|---|---|---|
| NN-1 | Plan limits are defined only in `plans.js`, in decimal-GB bytes (1 GB = 10^9 B). | Pricing-page parity (`BO-02`); binary/decimal mix-ups are the classic bug. | `NFR-CORR-001` |
| NN-2 | A write is allowed iff `delta <= 0` or `used + delta <= limit`. | `QTA-002`, `QTA-003`. | `NFR-CORR-002` |
| NN-3 | A refused write mutates nothing. | `QTA-005`. | `NFR-CORR-004` |
| NN-4 | Check order is user → input → quota, in every method. | `ERR-002`. | `NFR-CORR-005` |
| NN-5 | `usedBytes` changes only inside one internal function that also changes the file map. | Prevents drift (`RSK-007`). | `NFR-CORR-003` |
| NN-6 | Percent uses exact integer arithmetic (BigInt), floor division. | Float rounding must never show 100 % early; `used × 100` can exceed 2^53 after a downgrade from `team`. | `NFR-CORR-006` |
| NN-7 | User lookup is own-key only (`Map`, not a plain object). | `__proto__`/`constructor` ids must be `not_found` (`SEC-002`). | `NFR-SEC-002` |
| NN-8 | Paths are validated by one function; no `..`, absolute only. | `SEC-003`. | `NFR-SEC-001` |
| NN-9 | `units.js` is imported only by the summary code. | `QTA-008`. | `NFR-CORR-007` |
| NN-10 | No runtime dependencies; no `node_modules` required. | `CON-001`. | `NFR-MAINT-001` |
| NN-11 | The store never throws anything but `StoreError` for caller mistakes. | Stable contract for the Phase 3 mapping. | `NFR-CORR-005` |

## 7. Build order rationale

Phase 1 (core) exists. Phase 2 builds the limits table first (one number source), then the enforcement against it, because enforcement without the single table would copy numbers. Phase 3 (HTTP) must not start before Phase 2's error contract is frozen: HTTP status mapping depends on it.

---

*End of ENGINEERING_DESIGN.md — filestore*
