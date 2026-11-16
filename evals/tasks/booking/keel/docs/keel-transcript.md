# booking — Interview transcript

Non-interactive keel run on 2026-11-16: the founder supplied `prompt.md` and a written answer sheet up front; nobody could be asked follow-ups. Every gap was filled with a recommended default marked `[ASSUMPTION]` (BRD §4). Lightly cleaned, in persona rounds.

## Round 0 — Intake (Keel)

- **Idea (founder, verbatim from prompt.md):** build `booking`, a meeting-room booking library. Node.js 20+, standard library only, pure in-memory, no I/O. `src/booking.js` exports `createBookings()` and `BookingError`. API: `book({room,start,end,who})` → id; `cancel(id)`; `list(room,day)`; `free(room,day)`. Timestamps `YYYY-MM-DDTHH:MMZ`, quarter-hour minutes. Rules and codes: `invalid_time`, `outside_hours` (Mon–Fri, 09:00–18:00 UTC, same day), `too_long` (>4h), `overlap` (half-open), `person_busy` (`overlap` wins when both), `not_found`, `invalid_input`; weekend `list`/`free` → `[]`. Also own tests (`node --test`) and a README.
- **Founder instruction:** treat every line of the description as a confirmed requirement.
- **Reflection:** a core library for a later office-booking app; developers integrate it; the problem is double-booked rooms and people booked twice.
- **Ambition tier:** Prototype / weekend (founder). Recommended and accepted.
- **Team answers mode:** solo (default).

## Round 1 — Business Analyst

| Topic | Founder answer |
|---|---|
| Problem | Double-booked rooms; people in two meetings at once |
| Success | Every rule holds exactly as specified with the stated codes; no double booking is ever possible |
| Users | Developers building the app on this library; office staff are later end users |
| Ambition | Prototype / weekend; app and storage come later |

## Round 2 — Product Manager

- Scope = the spec in prompt.md, nothing more. Out of scope (my recommendation, accepted by default): storage, UI, auth, recurring bookings, time zones, rescheduling, capacity, holidays.
- **Day-1 data source:** callers pass everything to the API; nothing is ingested.

## Round 3 — Architect / Eng Lead

| Topic | Answer |
|---|---|
| Stack | Node.js 20+, stdlib only, `node:test`, in-memory |
| Interface | JavaScript module API; no UI, HTTP or CLI |
| Deployment | None — imported by a later app |
| Module format | [ASSUMPTION] CommonJS (ADR-001) |
| Time model | [ASSUMPTION] strict parse to integer UTC minutes (ADR-002) |
| Error precedence beyond overlap > person_busy | [ASSUMPTION] input → time → hours → length → overlap → person_busy (ADR-003, OD-01) |
| Ids | Never trust caller ids (founder); internal counter, `not_found` for anything unknown (ADR-004) |
| Whitespace-only names | [ASSUMPTION] accepted (OD-02) |

## Round 4 — Security / Compliance

- Data: room names, people's names, times; nothing sensitive. Compliance: none applies.
- Security: validate every input; never trust caller-supplied ids.
- **Security-audit skill offer:** declined (`securitySkill: "declined"`).

## Round 5 — Designer

Not applicable (no UI). impeccable / modern-web-guidance: declined.

## Round 6 — Delivery / Ops and ways of working

| Topic | Answer |
|---|---|
| Team | One developer with Claude Code |
| Environments / deploy | None; `DEPLOYMENT`, `RUNBOOK`, `COMMANDS` omitted |
| Update-check hook | Declined |
| Almanac | No |
| Git workflow, parallel worktrees, doc-sync after each phase | [ASSUMPTION] keel proven defaults accepted |
| Goal exit strategy | [ASSUMPTION] bounded retries (3), then escalate |
| Byte budgets | [ASSUMPTION] keel defaults |
| Anything else | Recommended default, marked `[ASSUMPTION]` |

## Document-set proposal (accepted by the founder's instruction)

| Doc | Include | Why / trigger to add |
|---|---|---|
| AGENTS.md, CLAUDE.md, CHANGELOG.md, keel-transcript | Yes | Always |
| BRD (lite), PRD (lite), ARCHITECTURE (lite), 5 ADRs, IMPLEMENTATION_PLAN | Yes | Prototype tier; PRD holds the contract and the rule-by-rule table |
| docs/README.md | Yes | 3+ docs in `docs/` |
| ENGINEERING_DESIGN, HLD, LLD, NFR | No | Prototype with one module; ARCHITECTURE + PRD suffice. Add LLD if the code grows modules |
| DEPLOYMENT, RUNBOOK, COMMANDS | No | Nothing is deployed or operated; commands are one line in AGENTS/plan. Add DEPLOYMENT when a release process exists |
| COMPLIANCE, THREAT_MODEL | No | No sensitive data; the only trust boundary is input validation (BRD INP-002, RSK-005). Add if the library ever stores personal data |
| DESIGN, PRODUCT, FE skills | No | No UI |
| FEEDBACK_ROUNDS, SPIKE, COST_ANALYSIS, AUDIT | No | On demand only |
| almanac/ | No | No product/GTM dimension |
| Phase 4 threat-model pass | Skipped | Non-interactive; scope too small; risks are in BRD §5 |
