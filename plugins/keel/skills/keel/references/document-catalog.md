# Document catalog

The menu Keel selects from in Phase 2. For each document: its purpose, **when to include it**
(adaptivity triggers), what it depends on, and the ID namespace it owns. **Every project gets every
document type** (on-demand types aside). The project's complexity sets each document's depth, and
whether it is written in full or as a **stub**: a short file that says why the type does not apply
yet and when to write it (`references/templates/STUB.md`). A type is never silently omitted, and
removing one needs the Keel maintainer's typed approval.

## Full or stub, by ambition tier (starting point, then adjust)

Every type below is generated at every tier. The table says which are written **in full** by
default; the rest start as stubs, each with its trigger (see "Stubs" below).

| Tier | Written in full by default |
|---|---|
| **Prototype / weekend** | `AGENTS.md` + `CLAUDE.md`, `BRD.md` (lite), `ARCHITECTURE.md` (lite), `IMPLEMENTATION_PLAN.md`, `CHANGELOG.md`, `docs/keel-transcript.md` |
| **Product / MVP** | + `PRD.md`, `ENGINEERING_DESIGN.md`, `HLD.md`, `LLD.md`, `docs/adr/`, `NFR.md`, `DESIGN.md` (if UI), `COMMANDS.md`, `DEPLOYMENT.md`, `RUNBOOK.md`, `docs/README.md`, `FEEDBACK_ROUNDS.md` (if clients review builds) |
| **Platform / regulated** | + `COMPLIANCE.md`, `THREAT_MODEL.md`, plug-in/contract specs (e.g. `CONNECTOR_SPEC.md`), `COST_ANALYSIS.md` (if usage-metered / AI spend), and an `almanac/` if warranted |
| **On demand (any tier)** | `SPIKE_<slug>.md`, `AUDIT_<date>.md`, `PHASE_ARCHIVE.md` — created by a mode or a session, never at generation |

These are starting points. A Product-tier project with no UI gets a DESIGN stub; a Prototype that
happens to touch health data writes COMPLIANCE in full. Always present the proposed set to the user with
a one-line justification per full document and per stub, and adjust.

## Stubs

A stub is the type's file at its usual path, from `references/templates/STUB.md`: the title, **Not
needed yet** (the reason, quoting the interview), **Write it when** (the trigger), **Meanwhile**
(where the facts live now), and the marker `<!-- keel:stub trigger=<id> -->`. It is about 300 B,
listed in the AGENTS.md document map as "(stub)", and never always-loaded. `/keel check` reports a
missing type (`missing-type`) and a stub whose trigger the repo now shows (`stub-triggered`).

| Type | Stub trigger id | Write in full when |
|---|---|---|
| `PRD.md` | `users` | there are real end users and non-trivial scope |
| `ENGINEERING_DESIGN.md` | `nontrivial` | the project has isolation, data-sensitivity or design-pillar rules |
| `HLD.md` | `multi-component` | several components or services interact (checked: 2+ package manifests) |
| `LLD.md`, `NFR.md` | `mvp` | the project is built module by module, or has stated quality targets |
| `DESIGN.md` | `ui` | there is a user-facing UI (checked: front-end files) |
| `COMMANDS.md` | `runs` | anything is run or built (checked: a package manifest or Makefile) |
| `DEPLOYMENT.md`, `RUNBOOK.md` | `deployed` | there is a remote environment (checked: deploy config) |
| `FEEDBACK_ROUNDS.md` | `external-reviewers` | someone outside the build team reviews builds |
| `COMPLIANCE.md` | `pii` | personal or regulated data |
| `THREAT_MODEL.md` | `high-risk` | a breach would be high-impact |
| `<NAME>_SPEC.md` (e.g. `CONNECTOR_SPEC.md`; the stub is `CONTRACT_SPEC.md`) | `extensible` | a real extension or plugin ecosystem exists |
| `almanac/README.md` | `product-dimension` | durable product, positioning or AI-reference knowledge exists |

Always in full: AGENTS.md, CLAUDE.md, BRD, ARCHITECTURE, `docs/adr/` (index plus ADRs),
IMPLEMENTATION_PLAN, CHANGELOG, `docs/keel-transcript.md`, `docs/README.md`. On demand, never at
generation and never stubbed: SPIKE, AUDIT, PHASE_ARCHIVE, COST_ANALYSIS. Tool files (PRODUCT.md,
hooks, settings, `.claude/agents`, `.claude/rules`) follow their own Include lines.

## The catalog

### `AGENTS.md` — the keystone index *(always, canonical)*
- **Purpose:** The entry point every coding agent and contributor reads first. A *light* file
  (12 KB budget, enforced by doc-sync): one-line description, document map, hard-invariants table
  (`Rule · Enforced by · Gap · Source`), the working workflow, a two-row status table with deploy
  state + evidence, working agreements, and a pre-PR checklist derived from the invariants.
- **Include:** Always. It's the spine that points at everything else.
- **Depends on:** Everything (written last, indexes what exists).
- **Owns:** Nothing (no IDs). When AGENTS.md and a referenced doc disagree, the doc wins. Narrative
  never lives here — CHANGELOG.md and PHASE_ARCHIVE.md do.

### `CLAUDE.md` — Claude-only additions *(always, thin)*
- **Purpose:** First line `@AGENTS.md`; then only Claude Code specifics — Workflow tool, `/goal`,
  `/keel` modes, impeccable / modern-web-guidance hooks. Never a copy of AGENTS.md.
- **Include:** Always, next to AGENTS.md. Counts toward the same session byte budget.

### `BRD.md` — Business Requirements Document *(always, scaled)*
- **Purpose:** Problem, objectives, market positioning, business requirements, constraints,
  assumptions, success metrics, out-of-scope, risk register. The *why* and *what* at the business
  level.
- **Include:** Always (lite for prototypes — problem + objectives + constraints + a few risks).
- **Depends on:** Business Analyst interview round.
- **Owns:** `BO-xx` (objectives), requirement groups by outcome prefix (e.g. `ING-xxx`, `RET-xxx`,
  `SEC-xxx`), `CON-xxx` (constraints), `A-xx` (assumptions), `RSK-xxx` (risks).

### `PRD.md` — Product Requirements Document *(product+)*
- **Purpose:** Personas, user journeys, feature list (MoSCoW-prioritized with acceptance
  criteria), UX flows, roadmap, non-goals, user stories, product success metrics. The *what* at
  the product level.
- **Include:** Product tier and up, or whenever there are real end users and non-trivial scope. Otherwise a stub (`users`).
  A stub for a pure internal script/library.
- **Depends on:** BRD; Product Manager + Designer interview rounds.
- **Owns:** `F-xx` (features). References `BRD` requirement IDs for traceability.

### `ENGINEERING_DESIGN.md` — design pillars & non-negotiables *(product+)*
- **Purpose:** The bridge between requirements and code. Design pillars, the core domain model
  (e.g. a tenancy/isolation model), data classification, the numbered **non-negotiables**, system
  decomposition (module map summary), and build-order rationale.
- **Include:** Product tier and up, especially anything with isolation/data-sensitivity rules. Otherwise a stub (`nontrivial`).
  A stub for trivial projects.
- **Depends on:** Architect (+ Security) rounds.
- **Owns:** Data classification scheme (e.g. `C0`–`C3`), the non-negotiables list. Referenced by
  ARCHITECTURE, LLD, NFR, COMPLIANCE.

### `ARCHITECTURE.md` — system architecture *(always, scaled)*
- **Purpose:** Architecture principles, component breakdown, data flows, DB schema, API design,
  trust boundaries, security controls by threat category, observability, cost model, and **accepted
  residual risks** with revisit triggers.
- **Include:** Always (lite for prototypes — components + data flow + key decisions). The security
  controls / trust boundaries / residual-risk depth scales with tier.
- **Depends on:** ENGINEERING_DESIGN; Architect + Security rounds.
- **Owns:** `P-xx` (architecture principles), §-numbered sections. Hosts the accepted-risk register
  (mirrors `RSK` entries from BRD with operational detail).

### `HLD.md` — High-Level Design *(product+; else a stub)*
- **Purpose:** System overview, component-interaction diagrams (ASCII), the end-to-end data flows
  (e.g. ingestion + retrieval) with per-step state, integration touchpoints with failure modes,
  deployment topology.
- **Include:** When the system has several interacting components/services and the data flow isn't
  obvious. For a simple system, a stub (`multi-component`) pointing at ARCHITECTURE's flow section.
- **Depends on:** ARCHITECTURE.
- **Owns:** Nothing; visual/flow elaboration of ARCHITECTURE.

### `LLD.md` — Low-Level Design *(product+)*
- **Purpose:** Module map, shared type definitions (single source of truth for core types), key
  interfaces/signatures per module, what each module does and does *not* own, error-handling
  strategy, security-module implementations. The implementer's contract reference.
- **Include:** Product tier and up — anything a team (or Claude Code) will build module by module. Otherwise a stub (`mvp`).
- **Depends on:** ARCHITECTURE; Architect round.
- **Owns:** Module map; the canonical type/interface namespace. References ADRs for decisions baked
  into type shapes.

### `docs/adr/` — Architecture Decision Records *(always: the index, plus one file per decision)*
- **Purpose:** One **file** per decision (`docs/adr/ADR-xxx-<slug>.md`), table-based: header
  (Status carrying the lifecycle `Proposed → Accepted → Built → Superseded` with commits, Deciders
  `founder/engineering/legal`, Bounded by), ≤2-sentence context, a Y-statement decision + revisit
  trigger, options with ✓/✗, and a consequences table whose `Build deviation` row is the only
  post-acceptance edit. `docs/adr/README.md` is the index plus the **Open decisions** register
  (one row per question, with locations and decider). No addenda; deploy state → CHANGELOG /
  DEPLOYMENT; incidents → RUNBOOK postmortems.
- **Include:** Whenever there are non-obvious technical bets (almost always at product tier+). Even
  a prototype benefits from 3–5 ADRs on its hard bets.
- **Depends on:** Architect (+ Security) rounds; the "hard bets" surfaced there.
- **Owns:** `ADR-xxx` (reserved in the index at phase scope, so parallel worktrees never collide).
  Referenced from nearly every other technical doc.

### `NFR.md` — Non-Functional Requirements *(product+)*
- **Purpose:** Measurable targets for performance, scalability, availability, security, cost,
  observability, data governance, maintainability — each with a **verification method**. Plus
  build-time enforcement gates.
- **Include:** Product tier and up. The security section scales heavily with data sensitivity. Otherwise a stub (`mvp`).
- **Depends on:** ARCHITECTURE, ENGINEERING_DESIGN; all rounds.
- **Owns:** `NFR-PERF`, `NFR-SEC`, `NFR-COST`, etc. with per-group numbering. Verification targets
  drive RUNBOOK alert thresholds and IMPLEMENTATION_PLAN exit gates.

### `DESIGN.md` — UX/UI design system *(if UI)*
- **Purpose:** Design language/principles, brand (identity, color, type), design tokens (primitive/
  semantic/component), component inventory (atoms/molecules/organisms), responsiveness, multi-
  interface rules, trust/privacy UX patterns, accessibility floor, implementation stack notes.
- **Include:** Any project with a user-facing UI. A stub (`ui`) for headless/API/CLI-only tools.
- **Depends on:** PRD; Designer round.
- **Owns:** Design tokens, component names. Referenced by PRD flows and front-end work.

### `PRODUCT.md` — impeccable product context *(if UI + skills integration opted-in)*
- **Purpose:** The context file impeccable reads to understand the product register (brand vs
  product), target users, and design direction. Required for `/impeccable` to work without
  prompting the user on first use.
- **Include:** Whenever `DESIGN.md` is generated and skills integration is opted-in (Designer
  round). Register is **brand** for marketing/landing/portfolio sites (design IS the product);
  **product** for app UI, dashboards, admin, tools (design SERVES the product).
- **Depends on:** Designer interview round; PRD (personas); brand/experience direction.
- **Owns:** Nothing. Consumed by impeccable's context.mjs. Referenced in DESIGN.md §12 and
  CLAUDE.md "UI work" line.

### `.claude/hooks/modern-web-guidance-hook.mjs` — modern-web-guidance PostToolUse hook *(if UI + skills integration)*
- **Purpose:** A PostToolUse hook that fires after any FE file edit (.html, .css, .js, .ts, .tsx,
  .jsx, .vue, .svelte, .astro, .scss) and reminds to check modern-web-guidance for current web
  platform patterns before implementing new UI features.
- **Include:** Whenever the project has a UI and skills integration is opted-in.
- **Depends on:** Skills integration decision (Designer round).
- **Owns:** Nothing. Generated verbatim from `references/templates/modern-web-guidance-hook.mjs`.

### `.claude/settings.json` — Claude Code hook configuration *(if UI + skills integration)*
- **Purpose:** Configures PostToolUse hooks for impeccable and modern-web-guidance. Generated from
  `references/templates/hooks-settings.json`. If a `.claude/settings.json` already exists in
  the target project, **merge** the hook entries; never overwrite the entire file.
- **Include:** Whenever skills integration is active. Pair with entries in `skills-lock.json`.
- **Owns:** Nothing.

### `.claude/agents/{doc-sync,security,design}.md` — role subagents *(only for roles with no full-time agent)*
- **Purpose:** Repo-local Claude Code subagents that own a role: `doc-sync` (every project),
  `security` (security-audit installed), `design` (impeccable / modern-web-guidance installed).
  Each ends with the fixed `## Report` block it returns to its caller.
- **Include:** Per role, only when the project has no full-time agent for it (then that agent gets
  the role and no file is written). Recorded in `.keel/meta.json` `agents`.
- **Owns:** Nothing. Rules: doc-sync → `.claude/workflows/doc-sync.js`; delegation → AGENTS.md.

### `.claude/rules/<area>.md` — path-scoped area rules *(every project with ADRs or NFRs that name code paths)*
- **Purpose:** Loads only when matching files are touched: `paths:` frontmatter, then one or two
  lines per rule ending in the ADR or NFR ID. From `references/templates/rules/area.md`.
- **Include:** One per area that a decision or NFR governs; none for an area with no known path.
- **Owns:** Nothing. The ADR / NFR is the home; `/keel check` flags dead IDs and missing `paths:`.

### `COMPLIANCE.md` — data protection & compliance *(regulated / PII)*
- **Purpose:** Data inventory (keyed to the data classification), data-minimization stance, data-
  subject rights implementation, consent, retention schedule, subprocessors, breach response,
  DPIA/review triggers.
- **Include:** Any project holding personal/regulated data or subject to GDPR/CCPA/HIPAA/etc.
  Otherwise a stub (`pii`).
- **Depends on:** ENGINEERING_DESIGN (data classes); Security/Compliance round.
- **Owns:** Data inventory, retention schedule. References RSK/NFR-SEC and RUNBOOK breach steps.

### `THREAT_MODEL.md` — threat model *(regulated / high-risk)*
- **Purpose:** Assets, trust boundaries, threat actors, threats (e.g. STRIDE or per-boundary),
  mitigations, and residual/accepted risks. The concentrated security reasoning.
- **Include:** Platform/regulated tier, or any project where a breach is high-impact. Otherwise a stub (`high-risk`).
- **Depends on:** ARCHITECTURE trust boundaries; Security round.
- **Owns:** `THR-xxx` (threats). Maps to NFR-SEC controls and ARCHITECTURE §6.

### Plug-in / contract specs, e.g. `CONNECTOR_SPEC.md` *(extensible systems)*
- **Purpose:** The binding contract for a pluggable extension point (connectors, adapters,
  plugins): the interface, validation rules, lifecycle, error handling, the universal test suite
  every implementation must pass.
- **Include:** Only when the system has a real extension/plugin ecosystem. Otherwise a stub `docs/CONTRACT_SPEC.md` (`extensible`).
- **Depends on:** LLD, ARCHITECTURE.
- **Owns:** The plugin interface contract.

### `IMPLEMENTATION_PLAN.md` — build plan & phase gates *(always)*
- **Purpose:** Phases (0..N) with goal, scope (cross-refs), deliverables, and an **exit-gate table**
  (`Gate · Evidence level · Artefact · Verified by · Status`); a phase-status table with deploy
  state; standing rules (incl. "claims carry evidence"); a **Changes** table (`CHG-xxx`, the
  hotfix-weight unit); deferred items with owner + revisit trigger; a requirement-coverage map.
- **Include:** Always. For a prototype it's a short checklist; for a platform it's the master
  build sequence with gates.
- **Depends on:** All requirement + technical docs; Delivery/Ops round.
- **Owns:** `Phase 0..N`, `CHG-xxx`. References BRD/PRD/ADR/NFR per phase. Updated by doc-sync
  as the build progresses (this is the doc the builder touches most).

### `PHASE_ARCHIVE.md` — relocated detail for finished/superseded work *(created on-demand)*
- **Purpose:** The overflow tank for the living docs. Holds full detail moved out of `AGENTS.md`,
  `IMPLEMENTATION_PLAN.md`, `docs/adr/`, `CHANGELOG.md` and `RUNBOOK.md` — completed phase
  write-ups, resolved deferred items and changes, superseded ADR bodies, released CHANGELOG
  sections, closed postmortems — so those stay light while the detail stays one link away.
- **Include:** Never part of initial generation — there's nothing to archive yet. Created the
  first time `/keel archive` runs, or automatically by doc-sync on a byte-budget breach.
- **Depends on:** Whichever doc each entry was moved from.
- **Owns:** No new IDs. Every entry keeps the ID it had in its source (`Phase N`, `ADR-xxx`) —
  archiving relocates prose, not the record.

### `COMMANDS.md` — command & env reference *(if it runs)*
- **Purpose:** Dev/test commands, seed/test-data tooling, local↔remote data reconciliation, and the
  environment-variable reference (per-env *values* live in DEPLOYMENT.md). Copy-paste ready.
- **Include:** Anything that's actually run/built/deployed. Otherwise a stub (`runs`).
- **Depends on:** Architect + Delivery/Ops rounds.
- **Owns:** Nothing; the operational command surface.

### `DEPLOYMENT.md` — how it ships *(operated systems)*
- **Purpose:** The environment matrix (local / dev / staging / prod — URL, host+region, DB, secrets
  store, who deploys, command), the promotion path and its gates, the **build-time vs runtime
  config table** per env, pre-deploy checklist, post-deploy live-verification checklist, rollback
  per component, known gotchas, and the **deploy log** (`vNN · date · commit · env · verified-by`)
  — the only place deploy state is authored (with CHANGELOG.md).
- **Include:** Anything deployed. One doc, one matrix — never one file per environment. Otherwise a stub (`deployed`).
- **Depends on:** ARCHITECTURE, COMMANDS, NFR, what's on disk (`fly.toml`, `deploy.sh`, CI).
- **Owns:** The env matrix, the deploy log. `/keel archive` trims the log, never the matrix.

### `CHANGELOG.md` — what shipped, and is it live *(always)*
- **Purpose:** Keep-a-Changelog. `[Unreleased]` is appended by doc-sync per phase/change; the deploy
  step stamps entries `deployed vNN` → `live-verified`. The home for the merged/deployed/verified
  history that otherwise leaks into ADRs and status lines.
- **Include:** Always. Released sections older than the retention window move to PHASE_ARCHIVE.md.
- **Owns:** Deploy state per change/phase (shared with DEPLOYMENT's deploy log per deploy).

### `RUNBOOK.md` — operations & incident response *(operated systems)*
- **Purpose:** Incident-response playbooks (`Symptom · Check · Fix · Escalate`), monitoring
  dashboards/SLOs/alerts, backup & recovery, security-review cadence, routine operations,
  data-subject-rights procedures, pre-launch checklist, and **Postmortems** (`PM-xxx`: date,
  trigger, root cause, fix, prevention) — the home for "what went wrong after the decision".
  Environments, deploy and rollback live in DEPLOYMENT.md.
- **Include:** Anything deployed and operated (not weekend prototypes). Otherwise a stub (`deployed`).
- **Depends on:** NFR (thresholds), COMMANDS, DEPLOYMENT, ARCHITECTURE.
- **Owns:** `PM-xxx`, incident playbooks, the pre-launch checklist.

### `FEEDBACK_ROUNDS.md` — client / stakeholder feedback *(products with external reviewers)*
- **Purpose:** One row per feedback round (`FR-xx · date · source · items → Phase/CHG · status`),
  so a client request traces to the work that answered it, and a session can see what is still
  unanswered. The input side of the post-launch loop.
- **Include:** When someone outside the build team reviews builds (client, founder-as-client,
  design partner). A stub (`external-reviewers`) for solo internal tools.
- **Owns:** `FR-xx`.

### `SPIKE_<slug>.md` — investigation record *(on demand)*
- **Purpose:** A time-boxed investigation before a decision: what exists, what does **not**
  exist, structural constraints that will bite, related open items, a decision checklist, and an
  appendix of negative-result checks (the greps that found nothing), so nobody redoes it.
- **Include:** Created by a session when a phase needs research before it can be scoped. Feeds
  one or more ADRs; never a decision itself.

### `AUDIT_<date>.md` — dated audit snapshot *(on demand)*
- **Purpose:** A point-in-time audit (UI/UX, security, accessibility, performance): dimension
  scores, P0/P1/P2 findings, positive findings worth preserving, systemic patterns (fix once).
  Findings become deferred items or a phase; the snapshot itself is never edited.
- **Include:** When an audit is run (`/impeccable audit`, pen test, review). Dated, immutable.

### `COST_ANALYSIS.md` — measured cost model *(usage-metered / AI spend)*
- **Purpose:** Per-unit cost formulas built from **measured** token/usage data, not estimates; the
  methodology so a future reader can reproduce or challenge it; caveats the data surfaced; the
  revisit trigger.
- **Include:** Anything with per-request AI/LLM or metered-infrastructure cost that bounds a `BO-xx`
  or `NFR-COST`. Omit when cost is flat hosting.

### `docs/keel-transcript.md` — the interview *(always)*
- **Purpose:** The Keel interview verbatim — the founder's own words that every requirement traces
  back to. Read when a requirement's intent is disputed.
- **Include:** Always, written at the end of generation. Never edited afterwards.

### `docs/README.md` — documentation index *(when docs/ has 3+ files)*
- **Purpose:** Catalog of all docs with status badges and a per-persona reading order.
- **Include:** Whenever the `docs/` folder has enough files to need a map. With every type present, that is every project.
- **Depends on:** All docs.
- **Owns:** Nothing; the docs index.

### `almanac/` — topology-stable knowledge base *(products with a product/GTM/AI dimension)*
- **Purpose:** A numbered knowledge base decoupled from sprint cadence — positioning, capabilities,
  methodology, stakeholder/domain intelligence, pricing/GTM, website copy, and any LLM-reference
  data. See `references/almanac-guide.md`.
- **Include:** Only when there's meaningful, durable product/positioning/methodology/AI-reference
  knowledge worth a stable home. Otherwise a stub `almanac/README.md` (`product-dimension`); most
  engineering-only tools keep the stub.
- **Depends on:** Business Analyst + Product Manager + Designer rounds.
- **Owns:** A numbered file scheme (`01-…` … `NN-…`).

## Generation order (dependency-respecting)

1. **Requirements spine:** `BRD` → `PRD` → `ENGINEERING_DESIGN`
2. **Technical:** `ARCHITECTURE` → `HLD` → `LLD` → `ADR` → `NFR` (+ `THREAT_MODEL`, `COMPLIANCE`,
   plug-in specs), then `.claude/rules/<area>.md` from the ADR headers and NFRs
3. **Experience:** `DESIGN` (alongside PRD)
   3a. **FE skill infrastructure** (if skills integration): `PRODUCT.md` + `.claude/hooks/modern-web-guidance-hook.mjs` + `.claude/settings.json` — generated immediately after `DESIGN.md`, before operational docs.
4. **Operational:** `IMPLEMENTATION_PLAN` → `COMMANDS` → `DEPLOYMENT` → `RUNBOOK` → `CHANGELOG`
   (seeded with `[Unreleased]` and the generation entry) → `FEEDBACK_ROUNDS` (if included)
5. **Knowledge base:** `almanac/*` (if included)
6. **Indexes last:** `docs/README.md`, `docs/adr/README.md`, then `AGENTS.md` + `CLAUDE.md` — so
   they map what actually exists. `docs/keel-transcript.md` is written with them.
7. **On-demand:** `PHASE_ARCHIVE.md` (first archive), `SPIKE_*.md` / `AUDIT_*.md` (sessions),
   `COST_ANALYSIS.md` (first measurement) — never during initial generation.

Fix the ID namespace and the BRD/PRD spine *before* parallelizing any later docs, so every parallel
document references a stable base.
