# Keel interview transcript — ledger

Non-interactive run (2026-11-16): the founder supplied `prompt.md` (the specification) and a written answer sheet instead of a live interview. Questions marked *(default)* had no answer; keel took its recommended default and tagged it `[ASSUMPTION]` in the docs. The document-set proposal was pre-approved.

## Phase 0 — Intake

**Reflection.** `ledger` is a Node 20+ stdlib-only CLI that records shared expenses in one JSON file, shows exact per-person balances, and prints transfers that settle them.
**Ambition tier.** Founder: *Prototype / weekend* — personal tool for a few friends sharing a flat, run by one user on their own laptop. Confirmed.
**Team answers.** Solo (default). Nothing handed to a team.

## Round — Business Analyst

| Question | Founder answer |
|---|---|
| Problem | Friends lose track of who paid for what; settling up takes too many transfers |
| Success | Balances always reconcile to the cent; `settle` prints the fewest practical transfers by the stated algorithm |
| Who pays / market / competition | *(default)* Not applicable: personal tool, no market |

Keel note: "fewest practical transfers" is the greedy algorithm in the spec, not a proven minimum; the BRD (BO-02) measures against the algorithm, not optimality.

## Round — Product Manager

| Question | Founder answer |
|---|---|
| Users | The person who runs the CLI; named people never use it |
| Scope | Every line of `prompt.md` is a confirmed requirement (five commands, money rules, name rules, error contract) |
| Out of scope | *(default)* Editing, unequal splits, currencies, multiple groups, payments, import/export, UI (BRD §7) |
| Input ambiguities (empty ledger output, duplicates, extra args, note rules, participant order) | *(default)* `[ASSUMPTION]` rows EXP-005/006, VAL-003, A-02 |

## Round — Architect

| Question | Founder answer |
|---|---|
| Stack | Node.js 20+, standard library only, `node:test`; no database, one JSON file |
| Interface | CLI only: no UI, web, API or network |
| Data file edge cases (corrupt file, missing file, id reuse, atomicity) | *(default)* DAT-002..004, ADR-002: state object with `nextId`, atomic temp+rename, corrupt file → exit 1 |
| Amount limits | *(default)* MON-004: cap 9,999,999.99 so cents stay safe integers (ADR-001) |

Keel recommendation accepted by default: pure core / thin shell, one error path (ADR-003).

## Round — Security / Compliance (brief)

Data: names and amounts only, no personal data beyond first names, no payments made. Compliance: none applies. Data file is local and trusted; validate all CLI input (VAL-001..003, ARCHITECTURE §7). Security-audit skill offer: **declined** (`securitySkill: never`).

## Round — Designer

Not applicable (no UI). impeccable / modern-web-guidance: **declined**.

## Round — Delivery / Ops

| Question | Answer |
|---|---|
| Team | One developer building with Claude Code |
| Deployment | None; run from a clone, no remote environment, so no DEPLOYMENT.md or RUNBOOK.md |
| Ways of working | *(default)* Git from commit one, branch-per-phase, doc-sync before each completing commit; bounded-retries exit strategy `[ASSUMPTION]`; budgets: keystone 12 KB, plan 64 KB, ADR index 16 KB, other docs 32 KB |
| Update-check hook | **Declined** |
| Almanac | No |

## Document-set proposal (accepted as approved)

| Doc | Included | Why / trigger to add |
|---|---|---|
| `AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`, this transcript | Yes | Always |
| `docs/BRD.md` (lite) | Yes | Always; carries every requirement ID and assumption |
| `docs/ARCHITECTURE.md` (lite) | Yes | Always; money rule, file shape, settle algorithm |
| `docs/adr/` (3 ADRs) | Yes | Prototype default omits; included because three hard bets (cents, file shape, error path) are cheap to record now |
| `docs/IMPLEMENTATION_PLAN.md` | Yes | Always; three phases with exit gates |
| Workflow scripts, doc-sync agent, `.keel/` tooling, Stop hook | Yes | Every project |
| PRD, ENGINEERING_DESIGN, HLD, LLD, NFR | No | Product tier; BRD + ARCHITECTURE cover a five-command tool. Add LLD/NFR if it grows |
| DESIGN, PRODUCT, UI hooks | No | No UI |
| COMPLIANCE, THREAT_MODEL | No | No sensitive data; Phase 4 threat pass reduced to ARCHITECTURE §7 |
| DEPLOYMENT, RUNBOOK, FEEDBACK_ROUNDS | No | No remote environment, no clients. Add DEPLOYMENT if it is ever hosted |
| COMMANDS, `docs/README.md` | No | Command table lives in AGENTS.md; AGENTS.md is the index. `README.md` (the tool's) is a Phase 2 deliverable |
| Security / design agents, area rules | No | Skills declined; no UI. Area rules skipped: no path-specific risks beyond the ADR headers |
| SPIKE, COST_ANALYSIS, AUDIT, almanac | No | On demand only |
