# House style & conventions

Apply these across every generated document so the suite reads as one coherent system.

## Voice & formatting

- **Reference material, not narrative.** Terse, scannable, imperative. The reader is looking
  something up, not reading a story.
- **Tables over prose** for anything enumerable: requirements, risks, components, decisions,
  env vars, metrics. Bold headers; terse cells; full prose lives in surrounding sections.
- **One fact, one home.** State each fact in exactly one document; reference it elsewhere. Never
  copy-paste a requirement, decision, or threshold into two docs.
- **Section numbering.** Use hierarchical `§` numbering for docs that get cross-referenced by
  section (ARCHITECTURE, LLD, NFR): `## 1. …`, `### 1.2 …`. Cross-reference as `ARCHITECTURE.md §5`.
- **Active voice, present tense.** "The worker validates the URL," not "URLs will be validated."

## ID conventions

Each document **owns** an ID namespace. IDs are stable once assigned — never renumber; retire with
a tombstone if needed. Use a consistent width (zero-pad: `REQ-001`, not `REQ-1`).

| Namespace | Owner doc | Example |
|---|---|---|
| `BO-xx` | BRD | Business objective |
| `<GROUP>-xxx` | BRD | Requirement, grouped by outcome (e.g. `AUTH-001`, `SEC-003`) |
| `CON-xxx` | BRD | Constraint |
| `A-xx` | BRD | Assumption |
| `RSK-xxx` | BRD | Risk (mirrored in ARCHITECTURE accepted-risk register) |
| `F-xx` | PRD | Feature |
| `P-xx` | ARCHITECTURE | Architecture principle |
| `ADR-xxx` | `docs/adr/` | Decision record — one file per ADR: `docs/adr/ADR-xxx-<slug>.md`; `docs/adr/README.md` is the index |
| `NFR-<AREA>-xxx` | NFR | Non-functional requirement (`NFR-SEC-001`, `NFR-PERF-002`) |
| `THR-xxx` | THREAT_MODEL | Threat |
| `C0`–`C3` | ENGINEERING_DESIGN | Data classification tiers |
| `Phase 0..N` | IMPLEMENTATION_PLAN | Build phase (gated milestone) |
| `CHG-xxx` | IMPLEMENTATION_PLAN | Change — hotfix-weight work unit (no phase block, no script) |
| `PM-xxx` | RUNBOOK | Postmortem (incident record) |
| `FR-xx` | FEEDBACK_ROUNDS | Client / stakeholder feedback round |

Choose requirement group prefixes from the project's own domain (3–4 uppercase letters per outcome
area). Define them once in the BRD and reuse everywhere.

## Cross-references

- **By ID** for requirements/decisions/features: "implements `AUTH-002`", "see `ADR-014`".
- **By doc + section** for structural references: "see `ARCHITECTURE.md §6`", "`LLD.md §3`".
- **By phase** for build sequencing: "delivered in `IMPLEMENTATION_PLAN` Phase 3".
- When a topic spans abstraction levels, reference in order: BRD (*what/why*) → ARCHITECTURE
  (*how, component*) → LLD (*how, module/type*) → ADR (*why this way*) → NFR (*how verified*) →
  DEPLOYMENT (*how shipped*) → RUNBOOK (*how operated*).
- Prefer relative links so the suite is portable: `[ADR-014](./adr/ADR-014-<slug>.md)` (the index `adr/README.md` resolves number → file).

## Status markers

Use a consistent set across all docs:

- `✅` complete / accepted / done · `🔄` in progress · `⬜` not started · `⚠️` superseded /
  needs attention · `[NEEDS DECISION]` open question with options surfaced · `[ASSUMPTION]` a stated
  assumption to validate.
- Priorities: `Must` / `Should` / `Could` / `Won't` (MoSCoW) in requirement and feature tables.

## Immutability & change rules

- **Accepted records are immutable.** Once an ADR (or a numbered requirement) is accepted, don't
  edit its meaning. Supersede it: write a new ADR that references and replaces the old, and mark the
  old `⚠️ Superseded by ADR-xxx`. ADRs carry **no addenda** — see "ADR lifecycle" below.
- **Append-only registers** (risk register, decision log) grow downward; entries aren't deleted,
  they're marked resolved/retired with a date.
- **Living docs** (`AGENTS.md` current-status, `IMPLEMENTATION_PLAN` phase status, `CHANGELOG`,
  `DEPLOYMENT` deploy log, `COMMANDS`, `RUNBOOK`) are updated freely as the build progresses — that's their job.
- **Archiving relocates, never deletes.** `/keel archive` moves finished/superseded detail
  (completed phase write-ups, resolved deferred items, superseded ADR bodies, CHANGELOG overflow,
  closed postmortems) out of the living docs into `PHASE_ARCHIVE.md`, leaving a one-line summary + link behind. IDs never move; only
  the prose body of a *closed* record relocates. See `references/keel-archive-guide.md`.

## Evidence ladder

Every `✅` — on an exit gate, a phase, a deferred item, a status line — carries **the level at
which it was verified and the artefact that proves it**. "Verified" with no level is an unfinished
claim, and doc-sync treats it as a lint failure.

| Level | Meaning | Artefact that proves it |
|---|---|---|
| `code-read` | someone read the diff and it looks right | commit hash |
| `unit` | unit tests cover the logic | test file + run output / CI URL |
| `integration` | cross-module behaviour exercised against real local services | test file + run output |
| `local-browser` | driven in a browser against the local stack (`claude-in-chrome`) | transcript / screenshot path |
| `staging` | exercised on a deployed non-prod environment | env + deploy id + check performed |
| `prod-live` | observed on production, by a human or a scripted check | env + deploy id + check performed |

Rules: the level is the **lowest** that the claim actually rests on, never the highest available.
Evidence inherited from an earlier phase is cited as inherited (`inherited: Phase 3 integration`),
not restated as this phase's own. A gate whose mechanism is tested but whose stated outcome was
never observed is `⬜ mechanism proven, gate not verified` — not `✅`.

The Verify stage of each phase script writes `.keel/evidence/phase-N.json` (gate → level →
artefact); doc-sync **cites** that file, it does not re-run the suites.

## Deploy-state ladder

Merge is not done. Each unit of work moves through: `on-branch` → `merged` → `deployed vNN` →
`live-verified`. Data scripts run against production carry their own `run-against-prod (date)`.

The state has **one home**: `CHANGELOG.md` (per change/phase) and `DEPLOYMENT.md`'s deploy log
(per deploy). Status tables reference it; ADRs and `AGENTS.md` prose never restate it. Doc-sync
writes state-neutral wording (`gates green on phase-N-x`) so nothing needs a "now merged" flip
commit later.

## ADR lifecycle

`Proposed` (written at phase scope, before build) → `Accepted` → `Built` (build confirmed, with
deviations recorded) → `⚠️ Superseded by ADR-xxx`. The Status cell carries the lifecycle with
commit + date for each transition.

- **No addenda.** The only post-acceptance edit is filling the single `Build deviation` row in
  the Consequences table. A deviation that doesn't fit one row is a new ADR that supersedes.
- **Deploy state and incidents never enter an ADR.** Deploy state → CHANGELOG / DEPLOYMENT.
  What went wrong afterwards → `RUNBOOK.md` Postmortems (`PM-xxx`), which may *cite* the ADR.
- **Open questions are not decisions.** They live in `docs/adr/README.md` "Open decisions",
  one row per *question* (not per marker location), until a human resolves them. Never invent a
  decision to close a row.
- **Deciders are tagged** `founder` / `engineering` / `legal` on every ADR and every open
  question — a founder call and an engineering call are revisited by different people.

## Two work units

| Unit | When | What it carries |
|---|---|---|
| **Phase** (`Phase N`) | a gated milestone — new capability, new boundary, launch | IMPLEMENTATION_PLAN block (goal/scope/deliverables/exit-gate table), workflow script, Verify evidence file, ADRs reserved at scope |
| **Change** (`CHG-xxx`) | hotfix, copy fix, config tweak, client-feedback item — anything that has no exit gate of its own | branch + one row in IMPLEMENTATION_PLAN "Changes" + CHANGELOG line; optional ADR |

Phases are numbered `N`, inserted as `N.1`, split as `N.1/N.2`. A Change is never promoted to a
phase for bookkeeping reasons; a phase is never demoted to a Change to skip its gates.
Every K deferred rows or N phases (project-set), a **closeout phase** clears the deferred table.

## Parallel-work ID rules

Parallel worktrees + sequentially allocated IDs = collisions at Integrate. Therefore:

- **Migrations** are timestamp-named (`20260909T1530_<slug>.sql` or the tool's equivalent),
  never `0013_`.
- **ADR IDs are reserved at phase scope** by the phase script (stub files committed on the phase
  branch before tasks fan out). A task that needs an unplanned ADR takes the next free number
  **at Integrate**, not in its worktree.
- **One file per ADR** (`docs/adr/ADR-xxx-<slug>.md`) so two ADRs never conflict in one file.
- Any registry with a uniqueness rule (tags, slugs, route names) gets a uniqueness test that runs
  at Integrate, not only in each worktree.

## Byte budgets & auto-archive

`AGENTS.md` (and therefore `CLAUDE.md`) is loaded into every session. It has a hard budget:
**12 KB**. Other living docs have budgets too; all live in `.keel/meta.json` (`"budgets"`), set at
generation, editable per project. Doc-sync's last step measures each budgeted file; a breach runs
the `/keel archive` rules automatically and commits separately (`docs: auto-archive — …`). If
nothing is archivable, doc-sync reports `BUDGET_EXCEEDED` rather than forcing it.

## Negative results are recorded

"Confirmed not a bug", "re-benchmarked, still deferred", "investigated, no change needed" each get
a row (deferred-items note, Changes row, or postmortem) — a future session must not redo the
investigation because the last one left no trace.

## AGENTS.md is canonical

`AGENTS.md` is the keystone index (cross-tool standard). `CLAUDE.md` is one line — `@AGENTS.md`
— plus Claude-only sections (Active skills, Workflow-tool notes). Never maintain two copies.

## Traceability checklist (run before handoff)

- [ ] Every requirement has a unique ID and at least one downstream reference (feature, component,
      or phase).
- [ ] Every ADR has context, options, decision, consequences, and a revisit trigger.
- [ ] Every NFR has a target *and* a verification method.
- [ ] Every cross-reference resolves to a real ID / section / file.
- [ ] `CLAUDE.md`'s document map lists exactly the files that exist on disk — no more, no less.
- [ ] No two documents state the same fact (one is the home; the rest reference it).
- [ ] Every `[NEEDS DECISION]` is surfaced in the handoff summary and has a row in
      `docs/adr/README.md` "Open decisions" (one per question, with locations and decider tag).
- [ ] Every `✅` states an evidence level and an artefact; no gate is `✅` on inherited evidence alone.
- [ ] No ADR carries an addendum; deploy state and incidents live in CHANGELOG / DEPLOYMENT / RUNBOOK.
- [ ] `AGENTS.md` is under its byte budget; `CLAUDE.md` is `@AGENTS.md` + Claude-only sections.

## Honesty rules for generation

- Do **not** invent specifics the interview didn't establish (numbers, SLAs, vendor names, scale
  figures). Use `[NEEDS DECISION]` / `[ASSUMPTION]` markers instead.
- If a section would be empty because the project doesn't warrant it, omit the section (and the
  doc) rather than padding it.
- If the interview revealed a contradiction or a risk, it belongs in the docs (risk register,
  open decision) — not smoothed over.
