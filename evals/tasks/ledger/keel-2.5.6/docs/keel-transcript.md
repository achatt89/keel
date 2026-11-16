# Keel transcript — ledger

Non-interactive run (2026-11-16): the founder supplied the full specification (`prompt.md`) and a block of interview answers up front; nobody could be asked follow-ups. This file records that exchange by persona round. Where no answer existed, Keel took its recommended default and marked it `[ASSUMPTION]`; those defaults are the provenance for `docs/adr/README.md` Open decisions OD-01..06 and BRD §5.

## Phase 0 — Intake & framing

**Founder's description (verbatim requirement set, all lines confirmed):** build `ledger`, a CLI that splits shared expenses in a small group. Node.js 20+, stdlib only, entry `node src/cli.js <command> [args]`, JSON data file at `LEDGER_FILE` (default `./ledger.json`, created on first write). Commands `add`, `list`, `remove`, `balances`, `settle` with the exact formats and the greedy settle algorithm; money in integer cents with leftover cents to participants alphabetically; names 1–20 lowercase `a-z`; any invalid input → `error:` on stderr, exit 2; own tests runnable with `node --test`; a README on how to run the tool and the tests. (Full text → BRD §4.)

**Keel's reflection:** a personal flat-sharing expense splitter used by one person at a laptop; the hard parts are exact cents and a deterministic settle. Nothing in the description needs a network, a UI, or a database.

**Ambition tier** — Founder answer: *Prototype / weekend; personal tool for a few friends sharing a flat; one user runs it on their own laptop.* Keel's read matched. Drives: lite BRD + lite ARCHITECTURE, no PRD/NFR/security suite.

## Round 1 — Business Analyst

| Topic | Founder answer |
|---|---|
| Users | The person who runs the CLI; the people named in expenses never use it |
| Problem | Friends lose track of who paid for what; settling up takes too many transfers |
| Success | Balances always reconcile to the cent; `settle` prints the fewest practical transfers *by the stated algorithm* |
| Compliance | None applies |

Keel note: "fewest practical" is bounded by the stated greedy rule, which is not provably minimal → recorded as RSK-003 / ADR-003 rather than promising optimality.

## Round 2 — Product Manager

Scope is exactly the five commands in the description; nothing else was requested. Keel's out-of-scope list (BRD §1) — no UI/web/API/network, no accounts, no payments, no uneven splits, no edit-in-place — follows from the founder's "CLI only … no payments are made by the tool" plus the absence of those features in the spec. Edit-in-place is `remove` + `add`.

Spec ambiguities Keel found (no answer available → defaults, all `[ASSUMPTION]`): participant display order (OD-01), duplicate participants (OD-02), amount upper bound (OD-03), exit code for a corrupt data file (OD-04), no-command / `--help` behaviour (OD-05), `--note` placement and allowed text (OD-06), silent success for `remove` (REM-001), `settle` read-only (SET-003).

## Round 3 — Architect / Eng Lead

| Topic | Founder answer / Keel recommendation |
|---|---|
| Stack | Node.js 20+, stdlib only, `node:test`. No database: one JSON file. |
| Interface | CLI only |
| Never-reused ids | Not specified how. Keel recommends a persisted `nextId` (ADR-002) — `max(id)+1` would reuse an id after removing the newest. |
| Money | Integer cents (ADR-001); upper bound 10^12 cents so sums stay in safe-integer range `[ASSUMPTION]` |
| Write safety | Atomic temp-file + rename `[ASSUMPTION]`, reserved ADR-005 |
| Arg parsing | Hand-rolled vs `node:util` `parseArgs` left open, reserved ADR-004 for Phase 0 |

## Round 4 — Security / Compliance (scaled down)

Founder: names and amounts only, no personal data beyond first names, no payments, no network; the data file is local and trusted; validate all CLI input. Keel's consequence: no COMPLIANCE or THREAT_MODEL doc; a stance paragraph in BRD §7 and a trust-boundary note in ARCHITECTURE §6; input validation is requirement-level (VAL-001..004, MNY-003), and the data file is still shape-checked on load so a hand edit fails cleanly.
**Security-audit skill offer:** declined by the founder (`securitySkill: "declined"` in `.keel/meta.json`; `/keel upgrade` may re-ask).

## Round 5 — Designer

Not run: no UI. **impeccable / modern-web-guidance:** declined (not applicable). No DESIGN.md, PRODUCT.md, hooks or `settings.json` generated.

## Round 6 — Delivery / Ops & ways of working

| Topic | Founder answer / default taken |
|---|---|
| Deployment | None; run from a clone; no remote environment → no DEPLOYMENT.md, RUNBOOK |
| Team | One developer building with Claude Code |
| Git workflow | Keel proven defaults `[ASSUMPTION]`: `git init`/initial commit, branch-per-phase off `main`, parallel agents in `git worktree`s, doc-sync after each phase |
| Goal exit strategy | Not answered → default **bounded retries (3), then escalate** `[ASSUMPTION]` (BRD A-04) |
| Byte budgets | Defaults: keystone 12 KB, plan 64 KB, ADR index 16 KB, others 32 KB |
| Phasing | Keel proposal: Phase 0 foundations → 1 expense commands → 2 balances/settle/README |
| Update-check hook | Declined |
| Almanac | No |

## Phase 2 — Document-set proposal (accepted as approved)

| Doc | Included? | Why / trigger to add |
|---|---|---|
| AGENTS.md + CLAUDE.md | Yes | Always |
| BRD (lite) | Yes | Home of the whole command contract |
| ARCHITECTURE (lite) | Yes | Module contracts, file format, error contract |
| docs/adr/ (3 accepted, 2 reserved) | Yes | Three founder-level bets + two build decisions |
| IMPLEMENTATION_PLAN + 3 phase scripts + change/doc-sync scripts | Yes | Always |
| CHANGELOG, keel-transcript, README | Yes | Always / founder-requested README |
| PRD, ENGINEERING_DESIGN, HLD, LLD | No | One CLI, one user; BRD + ARCHITECTURE suffice. Add PRD if a second surface appears |
| NFR | No | No performance/scale/availability targets. Add if latency or file size matters |
| DESIGN / PRODUCT / FE hooks | No | No UI |
| COMPLIANCE / THREAT_MODEL | No | No personal data beyond first names, no network |
| DEPLOYMENT / RUNBOOK / COMMANDS | No | No remote environment; commands live in README |
| FEEDBACK_ROUNDS, almanac, security/design agents | No | No clients; founder declined |
| SPIKE / COST_ANALYSIS / AUDIT | on demand | Triggers: an investigation, metered spend, a dated audit |

## Phase 4 — Threat-model & harden

Run as a quick single-pass sanity check (prototype tier; nobody to answer the opt-in). Findings, all applied in the docs: (1) a corrupt/hand-edited data file could poison balances → shape validation on load, VAL-004; (2) partial write on crash → atomic write, DAT-004 / ADR-005; (3) overflow of safe-integer cents → amount upper bound, MNY-003; (4) tests overwriting the user's real ledger → invariant 7; (5) unexpected exception breaking the exit-code contract → ARCHITECTURE §5 last row. Residual: no file locking (A-02, ARCHITECTURE §7).
