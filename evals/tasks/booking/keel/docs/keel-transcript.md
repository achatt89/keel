# Keel transcript — booking

Provenance for every decision and `[ASSUMPTION]` in this suite. **Non-interactive run (2026-11-16):** nobody could be asked; the founder supplied the full description (`prompt.md`) and a complete answer sheet up front. Where a question was unanswered the recommended default was taken and marked `[ASSUMPTION]`. Keel skill 2.5.6.

## Phase 0 — Intake & framing

**Founder's description (verbatim, treated as confirmed requirements):**

> Build `booking`, a meeting-room booking library.
>
> Constraints: Node.js 20 or later, standard library only (no npm dependencies). Pure in-memory logic, no I/O. `src/booking.js` must export `createBookings()` and the error class `BookingError`.
>
> `createBookings()` returns an object with:
> - `book({ room, start, end, who })`: returns a new booking id (a string). `room` and `who` are non-empty strings. `start` and `end` are UTC timestamps written exactly as `YYYY-MM-DDTHH:MMZ`, e.g. `2026-03-02T09:15Z`.
> - `cancel(id)`: removes a booking.
> - `list(room, day)`: the room's bookings on `day` (`YYYY-MM-DD`), sorted by start, each as `{ id, room, start, end, who }` with times in the same format as given.
> - `free(room, day)`: the free intervals of the room within opening hours on `day`, sorted, each as `{ start, end }`. Adjacent bookings leave no gap between them.
>
> Rules, each broken rule throws a `BookingError` whose `code` property is the name in brackets:
> - Timestamps must match the format and be real dates and times, minutes on a quarter hour (00, 15, 30, 45), and `start` before `end` [`invalid_time`].
> - Bookings are Monday to Friday, within 09:00 to 18:00 UTC, starting and ending on the same day [`outside_hours`].
> - A booking lasts at most 4 hours [`too_long`].
> - A room cannot hold two overlapping bookings; times are half-open, so 10:00-11:00 and 11:00-12:00 do not overlap [`overlap`].
> - A person (`who`) cannot hold two overlapping bookings in any rooms [`person_busy`]. When both this and `overlap` apply, throw `overlap`.
> - `cancel` of an unknown id [`not_found`].
> - Missing or empty `room` or `who` [`invalid_input`].
> - On a Saturday or Sunday, `list` and `free` return empty arrays.
>
> Also write your own tests (runnable with `node --test`) and a README that says how to use the library and run the tests.

**Keel's reflection:** double-booked rooms and people in two meetings at once are the problem; the solution is a pure, exactly specified in-memory library that a later office-booking app builds on. Confirmed by the founder's answers.

**Ambition tier** (Keel recommended Prototype / weekend; asked via the answer sheet): **Prototype / weekend** — core library for a later app; app and storage come later. Drives a lite suite and one-line-per-doc interview depth.

## Phase 1 — Interview rounds (answers from the founder's sheet)

### Business Analyst
| Question | Answer |
|---|---|
| Problem? | Double-booked rooms; people booked into two meetings at once. |
| Success? | Every rule holds exactly as specified with the stated error codes; no double booking is ever possible. |
| Who pays / market / competition? | Not applicable: internal foundation for a later app (not asked further; out of scope for a prototype). |

### Product Manager
| Question | Answer |
|---|---|
| Users? | Developers building the app on this library; office staff are later end users. |
| MVP cut / out of scope? | The spec is the MVP. Keel's out-of-scope list (BRD §10): persistence, UI/HTTP/CLI, other time zones, recurring/updates, auth. |
| Where does input come from on day 1? | Callers of the JS API only. |

### Architect / Eng Lead
| Question | Answer |
|---|---|
| Stack | Node.js 20+, standard library only, `node:test`; in-memory only. |
| Interface | JavaScript module API; no UI, no HTTP, no CLI. |
| Data | Room names, people's names, times. Nothing sensitive. |
| Hard technical bets (Keel's recommendation, adopted as ADRs) | CommonJS single file (ADR-001); strict parse to integer minutes (ADR-002); fixed check order (ADR-003); UUID ids in a `Map` (ADR-004). |

### Security / Compliance
| Question | Answer |
|---|---|
| Sensitivity / regime | Nothing sensitive; no compliance applies. |
| Security stance | Validate every input; never trust caller-supplied ids. → SEC-001..003, ARCHITECTURE §7. |
| Security-audit skill offer | **Declined.** (`securitySkill: "declined"`; no security role set up, so AGENTS.md workflow step 9 is omitted.) |

### Designer
Not run — no UI. Impeccable / modern-web-guidance: **declined** (not applicable).

### Delivery / Ops (ways of working)
| Question | Answer |
|---|---|
| Team | One developer building with Claude Code. |
| Deployment | None; a library imported by a later app. → no DEPLOYMENT.md; deploy ladder stops at `merged` (A-14). |
| Git/working workflow, doc-sync cadence, byte budgets, goal exit strategy | Unanswered → keel proven defaults `[ASSUMPTION]`: branch-per-phase off `main`, parallel worktrees, doc-sync after each phase, keystone 12 KB / plan 64 KB / default 32 KB, bounded retries (3) then escalate. |
| Update-check hook | **Declined.** |
| Almanac | **No.** |
| Anything else | Defaults taken — see assumptions below. |

### Phase 2 — Proposed document set (approved by the founder's instruction)

| Doc | Include? | Why / trigger to add later |
|---|---|---|
| `AGENTS.md`, `CLAUDE.md` | Yes | keystone pair |
| `docs/BRD.md` (lite) | Yes | owns requirement IDs |
| `docs/ARCHITECTURE.md` (lite) | Yes | module shape, contract, pipeline, invariants (stands in for LLD) |
| `docs/adr/` (4 ADRs) | Yes | the four hard bets; even a prototype benefits |
| `docs/IMPLEMENTATION_PLAN.md` | Yes | phases + gates |
| `CHANGELOG.md` | Yes | always |
| `docs/keel-transcript.md` | Yes | always |
| `docs/COMMANDS.md` | Yes | small; gives the single test command |
| `docs/README.md` | Yes | docs/ has 3+ files |
| `.claude/workflows/*`, `.claude/agents/doc-sync.md`, `.keel/*` | Yes | build loop, doc-sync owner (no full-time agent exists) |
| PRD, ENGINEERING_DESIGN, HLD, LLD, NFR | No | prototype with no UI/end users; ARCHITECTURE carries the contract. Add LLD/NFR if the library grows modules or perf targets. |
| DESIGN, PRODUCT | No | no UI |
| COMPLIANCE, THREAT_MODEL | No | no sensitive data; a sanity pass lives in ARCHITECTURE §7. Add THREAT_MODEL if the app exposes it to untrusted callers at scale. |
| DEPLOYMENT, RUNBOOK | No | nothing is operated. Add when a service wraps the library. |
| FEEDBACK_ROUNDS | No | no client review loop. SPIKE/COST_ANALYSIS/AUDIT: on demand only. |
| almanac | No | declined |

### Phase 4 — Threat-model pass
Opt-in question unanswered in the sheet → quick single-pass sanity check (prototype depth), applied directly to the design: hostile ids → `Map` + typeof (SEC-002, ADR-004); check/use mismatch via getters → single property read (P-02); coercion → strict typeof; returned-object mutation → copies (P-05). Residual: no string-length cap; async-storage atomicity (RSK-003). No THREAT_MODEL.md.

## Assumptions taken (full list in `BRD.md` §8)

A-02 CommonJS · A-03 check order · A-04 literal non-empty, no trim, case-sensitive · A-05 bad/missing `start`/`end` → `invalid_time` · A-06 non-object `book` arg → `invalid_input` · A-07 `list`/`free` argument errors · A-08 implicit rooms · A-09 non-string `cancel` id → `not_found` · A-10 UUID ids · A-11 boundary inclusivity · A-12 cross-day end → `outside_hours` · A-13 extra keys ignored · A-14 no deployment. The founder can overturn any; an accepted default changes only through a superseding ADR.
