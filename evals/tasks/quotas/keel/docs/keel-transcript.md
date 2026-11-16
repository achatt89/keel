# Keel transcript — filestore

Written 2026-11-16. **Non-interactive run:** the founder supplied the description and every interview answer up front; nobody could be asked follow-ups. Rounds below are the persona hats applied to those answers. Where a question had no answer, the recommended default was taken and marked `[ASSUMPTION]` (provenance table at the end). This file is never edited afterwards.

## Founder's description (verbatim, condensed only by line wrapping)

> Build `filestore`, the metadata core of a small file-storage service for freelancers. Node.js 20+, standard library only, a JavaScript module (no UI, no HTTP yet), in memory for now.
>
> `src/store.js` exports `createStore()` and `StoreError` (with a `code`). The store holds users (`u_1`, `u_2`, ... with a name and a plan: `free`, `pro` or `team`) and each user's files by path (`/docs/a.pdf`), with size in bytes and a version that goes up on every overwrite. It can list files under a prefix, remove a file, change a user's plan, and print a one-line summary for the account page. File content lives in object storage; this module only keeps the metadata.
>
> The work comes in phases: phase 1, the core above; phase 2, per-user storage quotas; phase 3, the HTTP API.

"Treat every line of it as a confirmed requirement."

## Phase 0 — Intake

Keel's read: a freelancer file-storage service whose cost is unbounded because nothing limits storage; the module is the metadata core that will enforce plan limits. **Tier: Product / MVP** (founder: paying customers from launch, maintained, billing depends on it; not a prototype). Confirmed by the founder's answers.

## Round 1 — Business Analyst

| Topic | Founder answer |
|---|---|
| Users | Freelancers who store client files; the founder runs support. |
| Problem | Storage costs are unbounded because nothing limits what a user stores. |
| Success | Every user stays within their plan, and every limit, message and number matches the pricing page exactly. |
| Market / competitors | Not discussed. Keel noted: `team` is unlimited, so the stated problem persists for that plan → `RSK-001`, `OD-05`. |

## Round 2 — Product Manager

| Topic | Founder answer |
|---|---|
| Phase 1 (built, code "exists in the repo") | Users `u_N`; plans `free`/`pro`/`team`; files by path with size and version; overwrite bumps version; `list`, `remove`, `setPlan` (never deletes files), `summary`. Errors `StoreError` with `invalid_input` and `not_found`; an unknown user is reported before bad input. |
| Phase 2 (next) — limits | `free` 2 GB, `pro` 200 GB, `team` unlimited. GB is decimal (1 GB = 1,000,000,000 bytes, not 1,073,741,824). `units.js` display helper stays binary, only for the summary line. |
| Phase 2 — boundary | A write that brings the user exactly to the limit is allowed; one byte more is refused. |
| Phase 2 — overwrite | Counts only the change (new − old). A write that does not increase usage is always allowed, even when over the limit (e.g. `pro` → `free`). |
| Phase 2 — refusal | `StoreError` `quota_exceeded`, `details { limitBytes, usedBytes, requestedBytes }` = plan limit, usage before the write, size of the file being written. A refused write changes nothing. |
| Phase 2 — order | unknown user (`not_found`), then bad input (`invalid_input`), then quota. |
| Phase 2 — `usage(user)` | `{ usedBytes, limitBytes, percent }`; `percent` integer rounded down (99.99 % shows 99). `team`: `limitBytes` and `percent` `null`. Unknown user: `not_found`. |
| Phase 2 — remove | Frees space at once. |
| Phase 3 | HTTP API, later, out of scope now. |
| Interface | JavaScript module API now; HTTP in phase 3. |

All Phase 2 decisions "confirmed against the pricing page".

## Round 3 — Architect / Eng Lead

| Topic | Founder answer |
|---|---|
| Stack | Node.js 20+, standard library only, `node:test`, ES modules. |
| Data | File paths and sizes; account names. Personal data limited to names. |
| Everything else | Defaults taken (see assumptions). |

Keel's technical challenges, recorded because they shaped the docs (founder had no chance to answer; each is an open decision or a design rule):
- `used × 100` can exceed 2^53 after a `team` → `free` downgrade, so percent must use BigInt (`NN-6`, `ADR-005`).
- Sizes are caller-asserted; HTTP in Phase 3 must source sizes from object storage or quotas can be bypassed (`RSK-004`).
- The binary summary line next to decimal limits can look like a pricing mismatch (`RSK-002`, `OD-02`).
- The working tree contains no code, though Phase 1 is "built" (`OD-07`).

## Round 4 — Security / Compliance

| Topic | Founder answer |
|---|---|
| Security | Validate every input; never trust caller-supplied ids; paths are confined (no `..`). |
| Compliance | GDPR basics for account names (phase 3 concern). |
| Security-audit skill offer | Declined. |

## Round 5 — Designer

Not run: no UI. Design skills (impeccable, modern-web-guidance): not applicable; declined.

## Round 6 — Delivery / Ops

| Topic | Founder answer |
|---|---|
| Team | One developer building with Claude Code. |
| Deployment | A single small server later (phase 3). None for now. |
| Update-check hook | Declined. |
| Almanac | No. |
| Ways of working, budgets, definition of done, exit strategy, evidence level, git | Not answered → Keel's proven defaults, `[ASSUMPTION]`: branch-per-phase off `main`; worktree-parallel tasks; doc-sync after each chunk; default byte budgets; bounded retries (3) then escalate; launch-gate evidence `unit`/`integration` (library); `node --test` green + `node --check` + no dependencies + doc-sync commit as definition of done. |

## Document-set proposal (accepted by the founder's instruction)

Included: AGENTS.md, CLAUDE.md, BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, LLD, `docs/adr/` (6), NFR, IMPLEMENTATION_PLAN, COMMANDS, CHANGELOG, docs/README, this transcript, `.keel/meta.json`, workflow scripts (doc-sync, change, phase-2), `doc-sync` subagent. Omitted with triggers: see `docs/README.md` "Deliberately omitted".

## Phase 4 — Threat-model & harden

Not asked (non-interactive); Keel's recommended default is yes, so a single-pass review of the docs was applied directly, scaled to a no-network library: safe-integer ceiling and BigInt percent (`A-08`, `NN-6`), own-key `Map` lookups (`NN-7`), caller-asserted sizes (`RSK-004`), atomic refusal (`NN-3`), input bounds `[ASSUMPTION]` (`LLD.md §8`). No `THREAT_MODEL.md` (trigger: Phase 3).

## Assumption provenance

| Marker | Where it came from |
|---|---|
| `A-01`, `OD-07` | Working tree empty at generation despite "code exists in the repo". |
| `A-02`, `OD-08` | Version start and ids not specified; typical behaviour assumed. |
| `A-03`, `OD-04` | Size rules not specified. |
| `A-04`, `OD-03` | Founder specified floor and null for `team` but not the over-limit display. |
| `A-05`, `ADR-006` | Synchronous API implied by "in memory, module". |
| `A-06`, `OD-01` | Method names for create user/write not given. |
| `A-07` | Test location not given. |
| `A-08` | Needed because `team` has no limit but numbers are not infinite. |
| Path/name length bounds, NUL/backslash rules | Not specified; Keel defaults (`LLD.md §8`). |
| Pricing-page parity check done by hand | Page not machine-readable in this context. |
| Exit strategy, budgets, git workflow, evidence level | Keel defaults (Round 6). |
| Security skill `declined` | Founder said "decline"; recorded as `declined` (re-asked at `/keel upgrade`), not `never`. |
