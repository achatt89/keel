# Document catalog

The menu Keel selects from in Phase 2. For each document: its purpose, **when to include it**
(adaptivity triggers), what it depends on, and the ID namespace it owns. **Do not generate every
document for every project** — match the set to the project's real complexity.

## Selection by ambition tier (starting point, then adjust)

| Tier | Default set |
|---|---|
| **Prototype / weekend** | `CLAUDE.md`, `BRD.md` (lite), `ARCHITECTURE.md` (lite), `IMPLEMENTATION_PLAN.md` |
| **Product / MVP** | + `PRD.md`, `ENGINEERING_DESIGN.md`, `HLD.md`, `LLD.md`, `ADR.md`, `NFR.md`, `DESIGN.md` (if UI), `COMMANDS.md`, `RUNBOOK.md`, `docs/README.md` |
| **Platform / regulated** | + `COMPLIANCE.md`, `THREAT_MODEL.md`, plug-in/contract specs (e.g. `CONNECTOR_SPEC.md`), and an `almanac/` if warranted |

These are starting points. A Product-tier project with no UI drops DESIGN; a Prototype that
happens to touch health data pulls COMPLIANCE up. Always present the proposed set to the user with
a one-line justification per inclusion and per omission, and adjust.

## The catalog

### `CLAUDE.md` — the keystone index *(always)*
- **Purpose:** The entry point Claude Code reads first. A *light* file: one-line project
  description, a document-map table (which doc to read when), the hard invariants/non-negotiables,
  the git/working workflow, and a "current status" line updated as the build progresses.
- **Include:** Always. It's the spine that points at everything else.
- **Depends on:** Everything (written last, indexes what exists).
- **Owns:** Nothing (no IDs); references all other docs. Keep it light — detail lives in the docs
  it points to. When CLAUDE.md and a referenced doc disagree, the doc wins.

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
- **Include:** Product tier and up, or whenever there are real end users and non-trivial scope.
  Skip for a pure internal script/library.
- **Depends on:** BRD; Product Manager + Designer interview rounds.
- **Owns:** `F-xx` (features). References `BRD` requirement IDs for traceability.

### `ENGINEERING_DESIGN.md` — design pillars & non-negotiables *(product+)*
- **Purpose:** The bridge between requirements and code. Design pillars, the core domain model
  (e.g. a tenancy/isolation model), data classification, the numbered **non-negotiables**, system
  decomposition (module map summary), and build-order rationale.
- **Include:** Product tier and up, especially anything with isolation/data-sensitivity rules.
  Skip for trivial projects.
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

### `HLD.md` — High-Level Design *(product+, optional)*
- **Purpose:** System overview, component-interaction diagrams (ASCII), the end-to-end data flows
  (e.g. ingestion + retrieval) with per-step state, integration touchpoints with failure modes,
  deployment topology.
- **Include:** When the system has several interacting components/services and the data flow isn't
  obvious. Fold into ARCHITECTURE for simple systems.
- **Depends on:** ARCHITECTURE.
- **Owns:** Nothing; visual/flow elaboration of ARCHITECTURE.

### `LLD.md` — Low-Level Design *(product+)*
- **Purpose:** Module map, shared type definitions (single source of truth for core types), key
  interfaces/signatures per module, what each module does and does *not* own, error-handling
  strategy, security-module implementations. The implementer's contract reference.
- **Include:** Product tier and up — anything a team (or Claude Code) will build module by module.
- **Depends on:** ARCHITECTURE; Architect round.
- **Owns:** Module map; the canonical type/interface namespace. References ADRs for decisions baked
  into type shapes.

### `ADR.md` — Architecture Decision Records *(product+)*
- **Purpose:** One record per significant decision: context, options considered (with pros/cons),
  the decision, consequences (easier/harder/off-the-table), and a **revisit trigger**. Immutable
  once accepted; superseded decisions get new ADRs.
- **Include:** Whenever there are non-obvious technical bets (almost always at product tier+). Even
  a prototype benefits from 3–5 ADRs on its hard bets.
- **Depends on:** Architect (+ Security) rounds; the "hard bets" surfaced there.
- **Owns:** `ADR-xxx`. Referenced from nearly every other technical doc.

### `NFR.md` — Non-Functional Requirements *(product+)*
- **Purpose:** Measurable targets for performance, scalability, availability, security, cost,
  observability, data governance, maintainability — each with a **verification method**. Plus
  build-time enforcement gates.
- **Include:** Product tier and up. The security section scales heavily with data sensitivity.
- **Depends on:** ARCHITECTURE, ENGINEERING_DESIGN; all rounds.
- **Owns:** `NFR-PERF`, `NFR-SEC`, `NFR-COST`, etc. with per-group numbering. Verification targets
  drive RUNBOOK alert thresholds and IMPLEMENTATION_PLAN exit gates.

### `DESIGN.md` — UX/UI design system *(if UI)*
- **Purpose:** Design language/principles, brand (identity, color, type), design tokens (primitive/
  semantic/component), component inventory (atoms/molecules/organisms), responsiveness, multi-
  interface rules, trust/privacy UX patterns, accessibility floor, implementation stack notes.
- **Include:** Any project with a user-facing UI. Skip for headless/API/CLI-only tools.
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
  CLAUDE.md "Active skills".

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

### `COMPLIANCE.md` — data protection & compliance *(regulated / PII)*
- **Purpose:** Data inventory (keyed to the data classification), data-minimization stance, data-
  subject rights implementation, consent, retention schedule, subprocessors, breach response,
  DPIA/review triggers.
- **Include:** Any project holding personal/regulated data or subject to GDPR/CCPA/HIPAA/etc.
- **Depends on:** ENGINEERING_DESIGN (data classes); Security/Compliance round.
- **Owns:** Data inventory, retention schedule. References RSK/NFR-SEC and RUNBOOK breach steps.

### `THREAT_MODEL.md` — threat model *(regulated / high-risk)*
- **Purpose:** Assets, trust boundaries, threat actors, threats (e.g. STRIDE or per-boundary),
  mitigations, and residual/accepted risks. The concentrated security reasoning.
- **Include:** Platform/regulated tier, or any project where a breach is high-impact.
- **Depends on:** ARCHITECTURE trust boundaries; Security round.
- **Owns:** `THR-xxx` (threats). Maps to NFR-SEC controls and ARCHITECTURE §6.

### Plug-in / contract specs, e.g. `CONNECTOR_SPEC.md` *(extensible systems)*
- **Purpose:** The binding contract for a pluggable extension point (connectors, adapters,
  plugins): the interface, validation rules, lifecycle, error handling, the universal test suite
  every implementation must pass.
- **Include:** Only when the system has a real extension/plugin ecosystem.
- **Depends on:** LLD, ARCHITECTURE.
- **Owns:** The plugin interface contract.

### `IMPLEMENTATION_PLAN.md` — build plan & phase gates *(always)*
- **Purpose:** Phases (0..N) with goal, scope (cross-refs), deliverables, and **exit gates**; a
  phase-status table; standing rules; and a requirement-coverage map (requirement → phase).
- **Include:** Always. For a prototype it's a short checklist; for a platform it's the master
  build sequence with gates.
- **Depends on:** All requirement + technical docs; Delivery/Ops round.
- **Owns:** `Phase 0..N`. References BRD/PRD/ADR/NFR per phase. Phase status is updated as the
  build progresses (this is the doc the builder touches most).

### `COMMANDS.md` — command & env reference *(if it runs)*
- **Purpose:** Dev/test/deploy commands and the environment-variable reference. Copy-paste ready.
- **Include:** Anything that's actually run/built/deployed.
- **Depends on:** Architect + Delivery/Ops rounds.
- **Owns:** Nothing; the operational command surface.

### `RUNBOOK.md` — operations & incident response *(operated systems)*
- **Purpose:** Environments, first-time setup, standard deploy, rollback paths, incident-response
  playbooks, monitoring dashboards/SLOs/alerts, backup & recovery, security-review cadence,
  pre-launch checklist.
- **Include:** Anything deployed and operated (not weekend prototypes).
- **Depends on:** NFR (thresholds), COMMANDS, ARCHITECTURE.
- **Owns:** Incident playbooks, the pre-launch checklist.

### `docs/README.md` — documentation index *(when docs/ has 3+ files)*
- **Purpose:** Catalog of all docs with status badges and a per-persona reading order.
- **Include:** Whenever the `docs/` folder has enough files to need a map.
- **Depends on:** All docs.
- **Owns:** Nothing; the docs index.

### `almanac/` — topology-stable knowledge base *(products with a product/GTM/AI dimension)*
- **Purpose:** A numbered knowledge base decoupled from sprint cadence — positioning, capabilities,
  methodology, stakeholder/domain intelligence, pricing/GTM, website copy, and any LLM-reference
  data. See `references/almanac-guide.md`.
- **Include:** Only when there's meaningful, durable product/positioning/methodology/AI-reference
  knowledge worth a stable home (most engineering-only tools don't need it).
- **Depends on:** Business Analyst + Product Manager + Designer rounds.
- **Owns:** A numbered file scheme (`01-…` … `NN-…`).

## Generation order (dependency-respecting)

1. **Requirements spine:** `BRD` → `PRD` → `ENGINEERING_DESIGN`
2. **Technical:** `ARCHITECTURE` → `HLD` → `LLD` → `ADR` → `NFR` (+ `THREAT_MODEL`, `COMPLIANCE`,
   plug-in specs)
3. **Experience:** `DESIGN` (alongside PRD)
   3a. **FE skill infrastructure** (if skills integration): `PRODUCT.md` + `.claude/hooks/modern-web-guidance-hook.mjs` + `.claude/settings.json` — generated immediately after `DESIGN.md`, before operational docs.
4. **Operational:** `IMPLEMENTATION_PLAN` → `COMMANDS` → `RUNBOOK`
5. **Knowledge base:** `almanac/*` (if included)
6. **Indexes last:** `docs/README.md`, then `CLAUDE.md` — so they map what actually exists.

Fix the ID namespace and the BRD/PRD spine *before* parallelizing any later docs, so every parallel
document references a stable base.
