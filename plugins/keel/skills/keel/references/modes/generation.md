# Keel mode: generation (interview + document suite)

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here. Upgrade Mode is in `upgrade.md`.

## The workflow

Run these phases in order. Do not skip ahead to generation. Announce each phase briefly so the
user knows where they are.

> **Load the reference files — do not work from memory.** The detail that makes Keel good lives in
> `references/` (the persona question banks, the document catalog, the conventions), *next to this
> SKILL.md*. Read the relevant reference with the **Read tool** at the start of each phase. If a
> relative path doesn't resolve, locate the skill directory first — e.g. find this file's folder
> (`Glob`/`Bash` for `interview-personas.md` or `document-catalog.md`) and read it by absolute
> path. The reference files are the source of truth; never substitute your own recollection of
> them, and tell the user which reference you're working from.

### Phase 0 — Intake & framing

1. Ask the user for their idea in their own words, and for any material they already have (a
   pitch, notes, a competitor, a half-built repo, sketches). Read anything they point you to.
2. Reflect the idea back in 2–4 sentences: the problem, who has it, and the shape of the solution
   as you understand it. Confirm or correct before going further.
3. Establish the **ambition tier** early, because it drives both interview depth and doc scope.
   Give your read, then **confirm it with the user via `AskUserQuestion`** — don't just assert it
   and move on (a misjudged tier mis-scopes the whole suite):
   - **Prototype / weekend** — validate an idea, throwaway-ok, single user or tiny audience.
   - **Product / MVP** — real users, will be maintained, money or reputation on the line.
   - **Platform / regulated** — multi-tenant, personal/financial/health data, compliance, scale,
     a team building it.
   Present your recommended tier as the first option so the user can confirm in one tap or correct.
4. **Team answers (opt-in).** Ask once: answer the interview yourself (default) or hand rounds to
   the team. Team → read `references/team-answers.md` and follow it. Solo → nothing changes.

### Phase 1 — The multi-persona interview

This is the core of Keel. Read `references/interview-personas.md` for the full persona panel and
question banks. Conduct the interview as **staged rounds**, each fronted by a named persona, so the
user always knows which "hat" the question comes from.

Rules for the interview:

- **Adopt the persona explicitly.** e.g. *"Putting on my Product Manager hat —"*. Each persona has
  a distinct goal (business viability, user value, technical feasibility, risk).
- **Adapt every question.** The question banks are a *checklist of what must be covered*, not a
  script to read aloud. Skip what's already answered; drill into what's vague; follow the energy.
- **Batch sensibly.** Ask 2–5 related questions per turn, not one at a time (exhausting) and not
  forty at once (overwhelming). Prefer `AskUserQuestion` for genuinely multiple-choice decisions;
  use open prose questions for the generative, exploratory ones.
- **Scale to the tier.** A Prototype needs maybe one or two rounds (problem + minimal tech). A
  Platform needs the full panel including Security/Compliance and Operations.
- **Challenge and synthesize.** Reflect contradictions back. Name assumptions out loud. When a
  round is done, summarize what you heard in a few bullets and get a thumbs-up before moving on.
- **Recommend inline; don't punt.** When a question has an expert answer (a tool choice, a vendor,
  a default), give your recommendation *with* the question rather than asking open-endedly and
  waiting — "I'd use X here because Y; agree?" saves a round-trip and is what the founder wants.
- **Stress-test against the real world.** Pressure-test the founder's plan against constraints they
  may not have hit yet: platform ToS / API limits (e.g. you can't intercept LinkedIn Easy Apply),
  **adoption friction** ("will a busy user actually do this extra step? if not, the MVP fails"),
  cost, and data-flow feasibility. Surfacing these *now* is the highest-value thing the interview
  does — catch them here, not mid-build.
- **Ask where the data/supply comes from — early.** For any product that ingests or matches data
  (marketplaces, aggregators, RAG, pipelines): "on day 1, where does the input actually come
  from?" is a Product-Manager-round *opening* question, not an afterthought. It shapes the whole
  architecture and is cheap to get wrong late.

The persona panel (detail and questions in `references/interview-personas.md`):

| Persona | Hat | Hunts for |
|---|---|---|
| **Business Analyst** | Problem & market | The real problem, who pays, why now, competition, success metrics |
| **Product Manager** | Users & scope | Personas, journeys, the MVP cut, what's explicitly *out* |
| **Architect / Eng Lead** | Feasibility & shape | Stack, data model, integrations, the hard technical bets |
| **Security / Compliance** | Risk & data | Data sensitivity, tenancy, auth, regulatory exposure, threats |
| **Designer** *(if UI)* | Experience & brand | Surfaces, key flows, tone, accessibility, brand feel |
| **Delivery / Ops** | Build & run + ways of working | Phasing, **environments + promotion path, build-time vs runtime config, who may deploy to prod, live-verification checks**, observability, **and the git/working-workflow: branching, worktree parallelism, doc-sync cadence, byte budgets** |

You decide which personas the project warrants and in what depth — that decision *is* the adaptive
interview. Always run Business Analyst + Product Manager + Architect. Add Security/Compliance for
anything holding user data; Designer for anything with a UI; Delivery/Ops for anything that will
actually be built.

**Run each warranted persona as a named, explicit round — don't let one get inferred from
context.** In practice the **Designer** and **Delivery/Ops** rounds are the ones most often skipped
by accident: run them as their own announced rounds (even if brief). For Designer, ask about
experience and brand direction *early* — founders often have a brand story or visual direction in
mind, and surfacing it up front (rather than letting it arrive late and organically) shapes DESIGN
and the product copy. For Security/Compliance on any data-holding product, go deeper than a couple
of questions: **data residency / cross-border transfer** (where it's hosted vs. where the users and
their data legally sit), recordings/biometrics, and the *specific* regime (GDPR, UK-GDPR, UAE PDPL,
CCPA, HIPAA…) all deserve real probing.

**Always cover ways of working** (in the Delivery/Ops round, even for prototypes): whether to
`git init` the folder, branch-per-feature off `main`, run divisible work as parallel agents in
separate `git worktree`s, and auto-sync the docs (`AGENTS.md` status + `IMPLEMENTATION_PLAN` phase
table + touched docs) after *each chunk/phase*. These answers populate the **Git & working
workflow** section of the generated `AGENTS.md` and the standing rules in `IMPLEMENTATION_PLAN`.
Present the proven defaults (see `references/interview-personas.md` §6) with `AskUserQuestion` and
let the user confirm or adjust — don't ask each from scratch.

**For anything that will be deployed, the Delivery/Ops round also establishes what `DEPLOYMENT.md`
needs** — the environment matrix (local / dev / staging / prod: host, region, DB, secrets store),
the promotion path and the gate at each hop, which config is build-time vs runtime (the class of
failure this prevents: a test payment key baked into a production build), who may deploy to
production, and the concrete post-deploy checks that make "live-verified" a checklist. Ask for
byte budgets too (defaults: keystone 12KB, IMPLEMENTATION_PLAN 64KB, ADR index 16KB as a floor that grows 320 B per ADR, every other
doc 32KB) — they go in `.keel/meta.json` and doc-sync enforces them (archive, then split).

### Phase 2 — Propose the document set

When the interview has genuinely covered the ground (you can describe the product, its users, its
shape, and its risks without guessing), stop and propose the doc suite.

1. Read `references/document-catalog.md` now, in full (do not choose the set from memory). It maps
   each document to its purpose, its inclusion triggers, its dependencies, and the ID convention it
   owns, and its "Stubs" table lists every type with its stub trigger.
2. Decide **layout** (this was deferred to the interview by design):
   - Default: `AGENTS.md` (canonical keystone) + `CLAUDE.md` (`@AGENTS.md` + Claude-only
     sections) + `CHANGELOG.md` at root; formal docs under `docs/`; ADRs one file each under
     `docs/adr/ADR-NNN-<slug>.md` with `docs/adr/README.md` as the index (a single `ADR.md` is
     the legacy format-1 layout — never generate it fresh).
   - Write a numbered `almanac/` knowledge base in full **only if** the project has a meaningful
     product / positioning / GTM / AI-reference dimension worth a topology-stable knowledge base
     that outlives the sprint cadence (see `references/almanac-guide.md`); otherwise
     `almanac/README.md` is a stub. Most engineering-only tools keep the stub; products with
     marketing, methodology, or LLM-reference data write it in full.
3. Present every document type as a table: **doc · full or stub · why**. Each stub row names the
   reason from the interview and its trigger (the catalog's "Stubs" table). No type is left out;
   removing one needs the Keel maintainer's typed approval. Get explicit sign-off and adjust to
   the user's wishes before generating anything. Write each stub from
   `references/templates/STUB.md` at the type's usual path and list it in the AGENTS.md document
   map as "(stub)". Rules for the docs added in keel 2.0 (full triggers in the catalog):
   - `CHANGELOG.md` — **always.** Fed by doc-sync; the single home of deploy state per change.
   - `docs/keel-transcript.md` — **always.** The interview itself, so the reasoning behind the
     suite survives the session.
   - `docs/DEPLOYMENT.md` — **in full for any operated system** (anything with a remote environment), else a stub. Replaces
     the environments / deploy / rollback sections RUNBOOK used to carry.
   - `docs/FEEDBACK_ROUNDS.md` — **in full for client-facing or user-tested products** (a founder,
     client, or pilot user will hand back batches of feedback that spawn work), else a stub.
   - `docs/SPIKE_<slug>.md`, `docs/COST_ANALYSIS.md`, `docs/AUDIT_<kind>_<date>.md` — **on demand,
     never at generation, never stubbed.** Name them below the table with their trigger (an
     investigation before a decision; a usage-metered cost question; a dated UI/security audit).
4. For **UI projects** where skills integration was opted-in during the Designer round: include
   `PRODUCT.md`, `.claude/hooks/modern-web-guidance-hook.mjs`, and `.claude/settings.json` in
   the proposed set alongside `DESIGN.md`. Group them in the proposal table as a block labelled
   **"FE skill integration"** with the rationale: *impeccable for visual quality gates,
   modern-web-guidance for modern web platform patterns — both fire as PostToolUse hooks*.
   If the user accepted the security skill (Security round), list **"Security agent"**
   (`security-audit` skill, global install, + its security reviewer) the same way. Any skill
   accepted adds its review-role row (see "Role owners" below).

### Phase 3 — Generate

Generate the agreed documents into the target project directory (ask where if not obvious;
default to the current working directory). For each document:

- Start from the matching skeleton in `references/templates/`. The templates are *structural*
  scaffolds — section order, ID conventions, table shapes — not content to parrot. Fill them with
  the real substance from the interview.
- Apply the house style and conventions in `references/conventions.md` (IDs, status markers,
  cross-reference syntax, immutability rules).
- **Wire the cross-references as you go.** When BRD `REQ-xxx` is implemented by a PRD feature,
  link them. When an ADR settles a choice named in ARCHITECTURE, link it. Unlinked docs are half
  the value lost.
- Generate in **dependency order** (see the catalog): foundation/requirements first (BRD → PRD →
  ENGINEERING_DESIGN), then technical (ARCHITECTURE → HLD → LLD → ADRs → NFR), then operational
  (IMPLEMENTATION_PLAN → DEPLOYMENT → COMMANDS → RUNBOOK → CHANGELOG), then `AGENTS.md`,
  `CLAUDE.md`, and `docs/README.md` *last* so they index what actually exists.
- **ADRs are per-file and table-based.** Each decision is `docs/adr/ADR-NNN-<slug>.md` from
  `references/templates/adr/ADR-NNN-slug.md`; `docs/adr/README.md` (from
  `references/templates/adr/README.md`) is the index and the home of the **Open decisions** table
  (one row per *question*, with a Locations column — never one row per `[NEEDS DECISION]`
  marker). Every ADR carries `Deciders` tagged `founder` / `engineering` / `legal`, and opens with
  the template's frontmatter header (`id`, `status`, `paths`, `check`).
- **Area rules.** After ADRs and NFR, write `.claude/rules/<area>.md` from
  `references/templates/rules/area.md`: `paths:` frontmatter with the area's globs, then one or two
  lines per rule ending in the ADR or NFR ID that holds the reason. Build them from the ADR
  headers' `paths` and from NFRs that name a code path; never copy record text. An area with no
  known path gets no file (list it in the handoff instead of guessing a glob).
- **IMPLEMENTATION_PLAN exit gates are a table**, not bullets: `Gate · Evidence level · Artefact ·
  Verified by · Status`. At generation every row is `⬜` with the *required* evidence level filled
  in (what the gate demands, e.g. `prod-live` for a launch gate) — the Verify stage of the phase
  script fills the rest from `.keel/evidence/phase-N.json`. Every gate must be checkable in this
  repo's own environment (a run on another runtime version, device or service is a CI or deploy
  gate, written as such, or a Deferred items row). The `Doc-sync commit present` gate is ticked by
  the Merge stage, never by Verify. A Stop-and-ask line never blocks a phase on the previous one
  being "finished": a merged phase is finished, and its open gates are Deferred items rows.
- **Docs under test.** A phase whose deliverables include a README or usage doc says so in its
  deliverable line ("README: examples in `examples/`, error table under test") and gets the exit
  gate `README examples and error table pass` · `unit` · `examples.test.*`. The phase script's
  task that writes the README names the same (conventions "Docs under test").
- **BRD says only what was decided.** Every BRD Assumptions row fills `Source`: the founder
  answer (transcript Q-ref), the ADR that decides it, or `unvalidated`. An assumption about code
  behaviour (a data shape, normalisation such as trimming, a helper, an algorithm) that no founder
  answer states is a design choice: write it as an ADR or LLD item and point the BRD row there,
  or leave it out. A risk mitigation that names code structure cites its ADR.
- **Keystone pair.** `AGENTS.md` from `references/templates/AGENTS.md` is the full keystone
  (document map, invariants as `Rule · Enforced by · Gap · Source`, status as a two-row table,
  pre-PR checklist). `CLAUDE.md` from `references/templates/CLAUDE.md` opens with `@AGENTS.md`
  and holds only Claude-specific lines (workflow tooling, review roles, the UI-skills pointer).
  Keystone text follows `references/conventions.md` "Placement rule": one line per workflow step,
  detail in IMPLEMENTATION_PLAN "Standing rules" and `.claude/workflows/README.md`. Never duplicate
  keystone content into `CLAUDE.md` — duplication is how the two drift apart.
- **`docs/keel-transcript.md`** — write the interview as it happened (persona rounds, the user's
  answers, your recommendations and their responses), lightly cleaned, never summarised into
  prose. It is the provenance for every `[ASSUMPTION]` in the suite.

### FE skill integration (if project has UI and opted-in)

Generate these files when the Designer round was run, the project has a user-facing UI surface,
and the user opted-in during that round (or it is Product/MVP tier with a UI, where the default
is yes).

1. **Check existing setup first** — before generating, inspect the target project directory:
   ```bash
   find . -maxdepth 4 -ipath "*skills/impeccable/scripts/hook.mjs" \
           -o -ipath "*skills/modern-web-guidance/SKILL.md" 2>/dev/null
   ls .claude/settings.json skills-lock.json 2>/dev/null
   ```
   If both skill files are found (not just a stub SKILL.md — the impeccable check specifically
   requires `scripts/hook.mjs` to exist, since that's the file the hook actually calls) and
   `.claude/settings.json` already has the modern-web-guidance hook, skip generation and note
   "skills integration already in place" in the handoff.

2. **Ask permission if not set up** — use `AskUserQuestion` once:
   *"May I set up impeccable (visual quality gates) and modern-web-guidance (modern web patterns)
   as PostToolUse hooks in this project? They fire automatically whenever UI files are edited."*
   Options: **Yes, set both up (recommended)** / modern-web-guidance only / Skip

3. **Install the real skill files first, then generate config** (if yes). Both skills are
   real, published npm packages with their own installer CLIs — do not skip straight to writing
   hook/lockfile config, since that config is meaningless if the files it points at don't exist:
   ```bash
   npx impeccable skills install -y --providers=claude --scope=project
   npx skills add GoogleChrome/modern-web-guidance --skill modern-web-guidance -a claude-code -y
   ```
   - **Verify before continuing** — locate what the installers actually wrote (don't assume a
     fixed path; confirm it):
     ```bash
     find . -maxdepth 4 -ipath "*skills/impeccable/scripts/hook.mjs" 2>/dev/null
     find . -maxdepth 4 -ipath "*skills/modern-web-guidance/SKILL.md" 2>/dev/null
     ```
     If either command comes back empty (offline, registry error, `npx` unavailable), **stop and
     say so plainly** in the Phase 3 handoff instead of writing config for a skill that isn't
     actually installed — that silent gap is exactly what caused impeccable's hook to be wired to
     a non-existent script in past-generated projects.
   - `PRODUCT.md` ← `references/templates/PRODUCT.md` — fill from the Designer round data
     (project name, description, target users, design direction, register: **brand** for
     landing/marketing/portfolio, **product** for app UI/dashboard/admin/tool).
   - `.claude/hooks/modern-web-guidance-hook.mjs` ← `references/templates/modern-web-guidance-hook.mjs` (verbatim, no edits needed).
   - `.claude/settings.json` ← the `PostToolUse` entry of `references/templates/hooks-settings.json`
     (modern-web-guidance's hook — UI files only, once per session; impeccable is deliberately
     excluded here, see step 5). If `.claude/settings.json`
     already exists in the target project, **merge** the PostToolUse hook entry; never overwrite
     the whole file. Remove the `_comment` key before writing.
   - `skills-lock.json` — if one exists, add the two entries; if not, create it with both entries.
     Use the version actually installed (e.g. `npx impeccable --version`; modern-web-guidance's
     installed `skill-version.txt`), not a hardcoded `"latest"`:
     modern-web-guidance: `{ "source": "GoogleChrome/modern-web-guidance", "sourceType": "github", "skillPath": "skills/modern-web-guidance/SKILL.md", "version": "<installed version>" }`
     impeccable: `{ "source": "impeccable", "sourceType": "npm", "version": "<installed version>" }`

4. **Wire into the other generated docs:**
   - `CLAUDE.md` keeps its one-line "UI work" pointer (from the CLAUDE.md template); the command
     map lives only in DESIGN.md §12.
   - `DESIGN.md` must include §12 Skill Integration (from the DESIGN.md template).

5. **Impeccable hook activation note** — impeccable's `skills install` places the skill files and
   its hook scripts, but does **not** enable the hook. Activation is a separate, deliberate step
   that writes `.claude/settings.local.json` (impeccable's own gitignored, machine-local convention
   — distinct from the shared `.claude/settings.json` modern-web-guidance's hook lives in). Include
   in the CLAUDE.md "UI work" line (short form) and in the Phase 3 handoff summary:
   > "Activate impeccable hook: run `/impeccable hooks on` once in Claude Code after the skill
   > is installed. The modern-web-guidance hook is active immediately."

6. **Design role** — if either skill was installed, set up the design reviewer per "Review
   roles" below (full-time agent if one exists, else `.claude/agents/design.md`).

### Security skill (offer for every project that will be built)

Asked in the Security round (or, if that round was skipped, once here). Never install silently.

1. **Check first:** `ls ~/.claude/skills/security-audit/SKILL.md ~/.agents/skills/security-audit/SKILL.md
   .claude/skills/security-audit/SKILL.md 2>/dev/null` (and `npx skills list -g` if available).
   Present → skip the install, go to step 4.
2. **Resolve and show the exact source** before asking:
   `git ls-remote https://github.com/cloudflare/security-audit-skill HEAD` → the commit sha.
3. **Ask** with `AskUserQuestion`, stating source, ref and scope verbatim:
   *"Install Cloudflare's security-audit skill? Source: github.com/cloudflare/security-audit-skill
   @ <sha>. This is a **global** install (your user-level skills, all projects), third-party code.
   It powers a security reviewer that audits each branch's diff after dev work."*
   Options: **Yes, install globally** / Not now (ask again on the next `/keel upgrade`) / Never
   for this project. On yes, run exactly:
   ```bash
   npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit --global
   ```
   Then verify with the step-1 check. Empty → stop and say so; do not set up the agent.
4. **Record** in `skills-lock.json`: `{ "source": "cloudflare/security-audit-skill", "sourceType":
   "github", "skillPath": "skills/security-audit/SKILL.md", "ref": "<sha>", "scope": "global" }`,
   and in `.keel/meta.json`: `skillsInstalled` += `"security-audit"`. Declined → `"securitySkill":
   "declined"` (Not now) or `"never"`; `/keel upgrade` re-asks only on `"declined"`.
5. **Security role** — set up per "Role owners" (full-time agent if one exists, else
   `.claude/agents/security.md`).

### Role owners (doc-sync, security, design): full-time agent or repo-local subagent

A rule only helps if something runs it at the right moment. Each role gets **one owner**:
`doc-sync` (every project — the doc rules in `doc-sync.js`), `security` (if the security-audit
skill is installed) and `design` (if impeccable / modern-web-guidance is installed). Keel never
asks an orchestrator to hire or spawn an agent: an orchestrator cannot create lasting agents, and
one-shot temps are never auto-invoked. Same steps for every role:

1. **Look for a full-time agent for the role.** A lasting agent on this project or floor whose role
   covers it (doc / architect / tech-writer for `doc-sync`; security / QA for `security`; design /
   UI for `design`): named in the session's own
   instructions, in AGENTS.md / CLAUDE.md, or in an existing `.claude/agents/*.md` or
   `~/.claude/agents/*.md` definition. Ask the user if unsure. Found → **do not create a
   subagent.** Hand it the skill: add the skill and the template's "Scope/When" + "How" rules to
   its definition (or, for an agent you cannot edit, tell the user the exact text to give it).
   Record `"agents": { "<role>": { "type": "full-time", "name": "<agent name>" } }`.
2. **None exists → write the repo-local subagent** `.claude/agents/<role>.md` from
   `references/templates/agents/<role>.md` (fill `{{PROJECT_NAME}}`, `{{SECURITY_SKILL_REF}}`).
   Its description states trigger conditions in plain words (no capitals), so Claude Code
   delegates to it unprompted without over-triggering.
   Record `"agents": { "<role>": { "type": "subagent", "path": ".claude/agents/<role>.md" } }`.
3. **Make invocation reliable — don't rely on the description alone.** Fill AGENTS.md workflow
   step 5 (*doc sync before the completing commit*: delegate to doc-sync, review its Report,
   ≤3 feedback rounds, leftovers → deferred items) and step 9 (*Review before done*: after any task
   that changed code, run the security reviewer on the branch diff before reporting done; UI work
   also runs the design reviewer), and the CLAUDE.md "Review roles" line with the owners from
   step 1/2 (one line each; the rules live in IMPLEMENTATION_PLAN "Standing rules"). The phase/change Verify stages call security
   and design whenever `.keel/meta.json` `agents` lists them; `doc-sync.js` runs the doc-sync loop.
4. **Delegation model.** `.claude/workflows/README.md` "Delegation" (AGENTS.md points to it): the agent doing the work is the *caller* and
   supervises its role subagents. Each subagent returns the fixed `## Report` block from its
   template (role · caller · scope · status · changed · checked · findings · evidence · not
   verified · needs from caller), never commits, pushes or messages anyone but its caller. The
   caller decides the next step and commits; if it has its own supervisor, it reports upward
   as before.
5. **Evidence retention.** Review runs write to `.keel/evidence/<role>/<branch>/<run>/`. Copy
   `references/templates/keel-evidence-prune.mjs` to `.keel/prune-evidence.mjs` and add
   `"evidenceRetention": { "keepRunsPerBranch": 3, "pruneMergedAfterDays": 30 }` to
   `.keel/meta.json`. Rules and owner: `references/conventions.md` "Evidence retention".

### Update-check hook (opt-in, every project)

Offer once with `AskUserQuestion`: *"Show one line at session start when a newer keel is
published? It reads `.keel/meta.json`, makes one request to raw.githubusercontent.com for keel's
version, writes nothing, and stays silent offline."* Yes → copy
`references/templates/keel-update-check.mjs` to `.claude/hooks/` verbatim and merge a
`SessionStart` entry (`node .claude/hooks/keel-update-check.mjs`) into `.claude/settings.json`.
No → `"updateCheck": false` is **not** set (that disables the per-invocation line too); just skip.

### Phase workflow generation (always)

Generate workflow scripts for every project, regardless of whether it has a UI. These encode the
mandatory build loop — worktrees, doc-sync, merge — so the builder never has to wire it by hand.

1. **Create `.claude/workflows/`** directory in the target project.
2. **Copy `references/templates/workflows/doc-sync.js`** verbatim into `.claude/workflows/doc-sync.js`
   and **`references/templates/workflows/change-template.js`** verbatim into
   `.claude/workflows/change-template.js` (the hotfix-weight unit `/keel change` runs — see Change
   Mode below). doc-sync writes tables not prose, enforces the evidence ladder, and ends with a
   deterministic **Budget** check (`.keel/doc-size.mjs`) that triggers a conditional **Archive**
   step and then a **Split** step for anything still over — this is how auto-archive and
   auto-split work; there is no hook or daemon. Copy `references/templates/keel-doc-size.mjs` to
   `.keel/doc-size.mjs` (verbatim), and `references/templates/keel-check.mjs` to `.keel/check.mjs`
   (verbatim; `/keel check` runs it). Copy `references/templates/keel-gates-hook.mjs` to
   `.claude/hooks/keel-gates.mjs` (verbatim) and merge the
   `Stop` entry from `references/templates/hooks-settings.json` into `.claude/settings.json` (every
   project): it runs the size + link check when Claude stops and blocks once on a LINK ERROR. Its
   Sync stage is proportional: status-only work is synced inline in one pass; otherwise the
   doc-sync loop (delegate → review Report → ≤3 feedback rounds → commit). Set up the
   `doc-sync` role owner per "Role owners" (always — every project has docs to sync).
3. **For each phase in the generated `IMPLEMENTATION_PLAN.md`**, generate a phase workflow script:
   - Copy `references/templates/workflows/phase-template.js` as the base.
   - Rename to `.claude/workflows/phase-N-{{slug}}.js` (N = phase number, slug = phase name in kebab-case).
   - Fill in `meta.name`, `meta.description`, and the `Build` phase entry's `detail` (tasks
     summary) from the phase scope. `Setup`, `Integrate`, `Verify`, `Doc Sync`, and `Merge`
     entries are fixed — leave their `detail` text as-is. `Setup` reserves the phase's ADR
     numbers as `Proposed` stubs (so parallel worktrees never collide on `ADR-NNN`); fill
     `{{RESERVED_ADRS}}` with the decisions the phase's scope block names. `Verify` runs the
     suites once and writes `.keel/evidence/phase-N.json`; `Doc Sync` calls `doc-sync.js`, which
     cites that file to fill the exit-gate table; `Merge` flips the CHANGELOG line and phase-status deploy state to
     `[merged]` on `main`.
   - Fill in the `TASKS` array with the scope items from that phase (each scope item = one task).
   - For phases with UI work: the task prompt already includes the impeccable + modern-web-guidance
     instructions — leave them; they apply automatically when the task touches UI files.
   - Fill `{{GOAL_EXIT_STRATEGY_BLOCK}}` with the block matching the "Goal-directed task execution
     & exit strategy" answer from the Delivery/Ops interview round (also recorded in
     IMPLEMENTATION_PLAN's Standing rules):
     - **Bounded retries, then escalate (default):** "Retry budget: up to 3 fix-and-retest cycles.
       If the goal still isn't met after 3 attempts, stop — run `/goal clear`, commit whatever is
       working, and add a row to IMPLEMENTATION_PLAN's deferred-items table stating exactly what's
       blocking and why, for human review."
     - **Persistent until met:** "No retry cap — keep fixing and re-testing until the goal
       condition genuinely holds. Only run `/goal clear` if the task is provably impossible as
       specified (contradicts a non-negotiable, depends on a system that doesn't exist yet) — never
       as a way to give up on something merely difficult. State the contradiction plainly if you do."
     - **Escalate on first failure:** "Do not self-retry. The first time any check fails (test,
       lint, verify, manual pass), stop immediately: run `/goal clear`, commit nothing broken, and
       report the exact failure for human review before attempting a fix."
4. **Copy `references/templates/workflows/README.md`** verbatim into `.claude/workflows/README.md`.
5. **Reference each generated script** in `IMPLEMENTATION_PLAN.md`'s "Workflow scripts" table.
6. **Create `.keel/evidence/`** (empty, with a `.gitkeep`) — the Verify stage writes here.
7. **Note in the Phase 3 handoff:** "Run `.claude/workflows/phase-0-guardrails.js` to start Phase 0.
   For later phases use `/keel phase new <slug>`; for hotfixes use `/keel change <slug>`."


- For large suites, you may generate documents in parallel with subagents — but only after the
  shared spine (IDs, glossary, the BRD/PRD) is fixed, so the parallel docs reference a stable
  base. Keep one coherent ID namespace across all of them.

Do not fabricate specifics the interview didn't establish. Where a real decision is still open,
write it as an open question / `[NEEDS DECISION]` marker with the options surfaced — don't paper
over a gap with invented detail.

### Phase 4 — Threat-model & harden (opt-in)

Before handoff, offer to run a threat-modelling pass **against the documents you just generated**
and proactively harden them. Gate it with `AskUserQuestion` (recommend "yes"):

> *"Want me to threat-model the generated docs and fix the weaknesses directly in them?"* —
> **Yes (recommended)** / No, hand off as-is.

If yes:

1. **Model adversarially.** Analyze the generated suite the way an attacker and a skeptical
   security reviewer would. For non-trivial projects, fan this out across subagents, one per
   dimension, each reading the generated docs and returning concrete findings:
   - data exposure & authorization gaps (who can read/do what they shouldn't)
   - tenant/user isolation (cross-account leakage, missing scope keys)
   - untrusted-input handling (injection incl. prompt injection, SSRF, file/upload abuse, webhooks)
   - secrets, auth, session, and supply-chain (dependency/actor pinning, token storage)
   - abuse, cost-bombing, and denial-of-service
   - privacy & regulatory exposure (retention, erasure, consent, lawful basis)
   - availability, backup, and recovery gaps
   Each finding names: the **threat**, the **document/section it affects**, its likelihood/impact,
   and a **concrete hardening**.

2. **Fix in place — change the design, don't just annotate it.** For every accepted finding, apply
   the mitigation *directly in the most appropriate document(s)* so the threat is actually
   addressed, not merely referenced:
   - add or strengthen a control in `ARCHITECTURE` (controls-by-threat section)
   - add an `NFR-SEC` requirement **with a verification method**
   - add or amend an `ADR` if the fix is a real decision/trade-off
   - add a non-negotiable to `ENGINEERING_DESIGN`, or validation to an `LLD` module
   - tighten data classification / retention / erasure in `COMPLIANCE`
   - add a concrete **exit gate** to the relevant phase in `IMPLEMENTATION_PLAN`
   The rule: **the mitigation must alter the spec the builder follows.** Do *not* "fix" a threat by
   only appending a line to a risk register that points back at the unmitigated design.

3. **Record for traceability — secondarily.** *After* the design docs are hardened, log each threat
   in `THREAT_MODEL.md` (`THR-xxx`) and/or the BRD risk register, noting **where it is now
   mitigated**. If the suite didn't include `THREAT_MODEL.md` but the pass surfaced real threats,
   propose adding it. Traceability records point *to* the mitigation; they don't replace it.

4. **Residual risk, honestly.** Anything that genuinely can't be fully resolved for v1 becomes an
   **accepted risk** with a revisit trigger (in `ARCHITECTURE` accepted-risks + BRD `RSK-xxx`), and
   is called out explicitly to the user — never silently dropped.

5. Re-run the cross-reference/consistency check after editing (new IDs unique, references resolve,
   keystone document map still accurate), then summarize what was hardened: threats found, fixes applied
   (and where), and residual risks accepted.

Scale the depth to the project: a weekend prototype gets a quick single-pass sanity check; a
platform handling sensitive data gets the full fan-out with adversarial verification of each fix.

### Phase 5 — Review & handoff

1. Run a consistency pass: every cross-reference resolves, every ID is unique, AGENTS.md's
   document map matches the files on disk, no document contradicts another, `CLAUDE.md` opens
   with `@AGENTS.md` and duplicates nothing from it, no ✅ anywhere lacks an evidence level, and
   `node .keel/doc-size.mjs` passes with no breach, and `node .keel/check.mjs` is clean (every
   document type present in full or as a stub; every ADR that names paths cited by an area
   rule; every BRD assumption has a Source, and none names code behaviour without an ADR or
   founder-answer source). A generated doc over its budget is **split
   now** (`node .keel/doc-size.mjs --split <doc>`, then add the Parts table's IDs column) (keel-archive-guide "Splitting an oversize doc": `docs/<name>/NN-<slug>.md` parts, the
   parent a slim index linking every part, each part linking back) — never handed over oversize.
2. Write `docs/README.md` (or root README) as the index: the document map table, reading order by
   persona, and status badges.
3. Write `.keel/meta.json` recording the generation, so `/keel version` and `/keel upgrade` have
   something to compare against from day one — same shape as Upgrade Mode's, `keelVersion` set to
   this SKILL.md's own `metadata.version` (full example in
   `references/templates/keel-meta.json`):
   ```json
   {
     "keelVersion": "{{INSTALLED_KEEL_VERSION}}",
     "docFormat": 2,
     "adrLayout": "per-file",
     "generatedAt": "{{ISO_DATE}}",
     "defaultBudget": 32768,
     "budgets": {
       "AGENTS.md": 12288,
       "CLAUDE.md": 12288,
       "docs/IMPLEMENTATION_PLAN.md": 65536,
       "docs/adr/README.md": 16384
     },
     "closeout": { "maxOpenDeferred": 8, "everyNPhases": 5 },
     "documentsGenerated": ["list of all docs generated"],
     "skillsInstalled": ["impeccable", "modern-web-guidance", "security-audit"],
     "agents": { "doc-sync": { "type": "subagent", "path": ".claude/agents/doc-sync.md" },
                 "security": { "type": "subagent", "path": ".claude/agents/security.md" },
                 "design": { "type": "full-time", "name": "<design agent>" } },
     "evidenceRetention": { "keepRunsPerBranch": 3, "pruneMergedAfterDays": 30 },
     "updateCheck": true
   }
   ```
   `budgets` values are bytes; adjust from the Delivery/Ops answers. Add `"defaultBudget": 32768`
   (every doc not listed). `docFormat: 2` is what
   `/keel upgrade` reads to know no format migration is needed.
4. Give the user a short handoff: what was generated, the recommended reading order, the open
   `[NEEDS DECISION]` items still to resolve (as questions, from `docs/adr/README.md`'s Open
   decisions table), the suggested first build step (usually: *"open this folder in Claude Code
   and start at the IMPLEMENTATION_PLAN's Phase 0"*), and **two standing rules stated plainly**:
   the evidence ladder (nothing is ✅ without a level + artefact; only a deploy can write
   `prod-live`) and the byte budgets (doc-sync archives, then splits, at breach; `/keel version`
   reports size vs budget).
5. Offer to iterate — refine any doc, go deeper on a round, or add a document that was deferred.
