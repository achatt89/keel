# Keel Upgrade Guide — per-doc audit checklist

Reference for Phase U2 (Audit) in the keel upgrade command.
For each doc type, the checklist below defines what a fully current keel-generated doc must contain.
Use it to diff existing docs against current keel standards and classify each gap.
Skill layout (2.6): SKILL.md is a router and each mode lives in `references/modes/`; nothing to migrate in a project.

---

## Document inventory

"Required for" says when a document is written **in full**. Since 2.6.1 every catalog type exists in
every project: where a row's condition does not hold, the type is a stub (`templates/STUB.md`), not a
gap and not an omission. A type with neither file nor stub is `MISSING_DOC`.

| Doc | Required for | Critical if missing |
|---|---|---|
| BRD.md | All projects | ✓ |
| PRD.md | All projects | ✓ |
| ARCHITECTURE.md | All projects | ✓ |
| `docs/adr/README.md` + `docs/adr/ADR-NNN-*.md` (format 2) — or legacy `ADR.md` (format 1) | All projects | ✓ |
| NFR.md | All projects | ✓ |
| ENGINEERING_DESIGN.md | All projects | ✓ |
| IMPLEMENTATION_PLAN.md | All projects | ✓ |
| DEPLOYMENT.md | Operated systems (any remote environment) | Important for operated |
| CHANGELOG.md | All projects (format 2) | Important |
| COMMANDS.md | All projects | ✓ |
| RUNBOOK.md | Production systems | ✓ for prod |
| AGENTS.md (canonical keystone, format 2) | All projects | ✓ |
| CLAUDE.md (`@AGENTS.md` import + Claude-only sections in format 2; the keystone itself in format 1) | All projects | ✓ |
| DESIGN.md | UI projects | ✓ for UI |
| PRODUCT.md | UI + impeccable | Critical for UI with skills |
| FEEDBACK_ROUNDS.md | Client-facing / user-tested products | Optional |
| docs/keel-transcript.md | All projects (format 2) | Optional |
| .keel/meta.json | All projects (written at generation, from v1.3+) | Optional — but its absence means `/keel version` can't report this project's doc version or budgets |
| .keel/evidence/ | All projects (format 2) | Important |
| .claude/workflows/doc-sync.js | All projects | Important |
| .claude/workflows/change-template.js | All projects (format 2) | Important |
| .claude/workflows/phase-*.js | All projects | Important |
| .claude/hooks/modern-web-guidance-hook.mjs | UI projects | Important |
| .claude/settings.json with PostToolUse hooks | UI projects | Important |
| skills-lock.json | All projects | Optional |

---

## Doc format detection (format 1 vs format 2)

`.keel/meta.json` `docFormat: 2` is authoritative. When it is absent or `< 2`, or when the
indicators contradict it, classify by indicators — **any two** → format 1 → the Format Migration
sequence (`modes/upgrade.md`, Upgrade Mode U0–U7) is offered in place of the surgical U4:

| Indicator | Format 1 | Format 2 |
|---|---|---|
| ADR layout | single `ADR.md` (often with `### Addendum` / `### Build confirmation` headings) | `docs/adr/ADR-NNN-<slug>.md` per decision + `docs/adr/README.md` index |
| ADR entry shape | `### Context` / `### Options considered` / `### Decision` prose sections | header key-value table, Y-statement Decision row, Options table with ✓/✗, Consequences table with `Build deviation` row |
| Keystone | `CLAUDE.md` is the keystone; `AGENTS.md` (if present) is a hand-maintained copy | `AGENTS.md` canonical; `CLAUDE.md` opens with `@AGENTS.md` |
| Keystone status | prose entries, > 2 lines, or the file > 12KB | two-row table (`Last completed` / `Now`) with deploy state + evidence link |
| Hard invariants | numbered list | `Rule · Enforced by · Gap · Source` table |
| Exit gates | bullets | `Gate · Evidence level · Artefact · Verified by · Status` table |
| Deploy state | in ADR addenda / status prose ("merged, deployed, live-verified") | `CHANGELOG.md` entries + `DEPLOYMENT.md` deploy log |
| Deferred items | `Item · Deferred from · Reason · Target · Status` | + `Owner · Revisit trigger` |
| Changes table | absent (hotfixes are fractional phases `6i…6r`) | `## Changes` (`CHG-xxx`) in IMPLEMENTATION_PLAN |
| DEPLOYMENT.md / CHANGELOG.md | absent (deploy in RUNBOOK/COMMANDS/ADRs) | present |
| Phase scripts | Setup → Build → Integrate → Doc Sync → Merge | + `Verify` stage writing `.keel/evidence/phase-N.json`; Setup reserves ADR stubs |
| doc-sync.js | no budget check | ends with Budget → conditional Archive |

Record the detection in the report ("format 1 by 5/12 indicators").

---

## Per-doc audit checklist

### AGENTS.md / CLAUDE.md (the keystone pair)

Format 2 shape: `AGENTS.md` is the keystone; `CLAUDE.md`'s first non-comment line is `@AGENTS.md`
and it holds only Claude-only lines (workflow tooling, review roles, UI-skills pointer). In format 1 the
checklist below applies to `CLAUDE.md` itself.

Required sections (check by heading presence):
- [ ] Current status as a two-row table (`Last completed` / `Now`), each cell ≤ 1 line with a
  deploy state (`on-branch` / `merged` / `deployed vNN` / `live-verified`) and a link to the
  CHANGELOG entry or evidence file ← format 2
- [ ] Hard invariants as `Rule · Enforced by · Gap · Source` (every `Enforced by` is a
  file:line / lint rule / test name, never "code review") ← format 2
- [ ] Pre-PR checklist derived from the invariants ← format 2
- [ ] Document map lists DEPLOYMENT.md, CHANGELOG.md, `docs/adr/` (and FEEDBACK_ROUNDS /
  PHASE_ARCHIVE where they exist) ← format 2
- [ ] File size ≤ its `.keel/meta.json` budget (default 12288 bytes) → `BUDGET_EXCEEDED` if not
- [ ] Quick orientation (table: path → purpose)
- [ ] Git & working workflow (mandatory — the build loop)
  - [ ] References `.claude/workflows/phase-N-<slug>.js` scripts ← new in v0.3+
  - [ ] Has doc-sync step (run doc-sync.js before every merge) ← new in v0.3+
  - [ ] Has decisions/ADR capture step ← new in v0.3+
- [ ] Working agreements (conventional commits, branch per feature)
- [ ] UI-skills pointer *(UI projects only)*: CLAUDE.md "UI work" line pointing to DESIGN.md §12
  (2.6); an older "Active skills" section is also accepted, and is offered the 2.6 pointer (see
  "Slim keystone and hooks (2.6)" below)

Outdated indicators → gap category:
- "Git workflow" section present but no workflow script references → OUTDATED_CONVENTION (Important)
- No doc-sync step in the workflow section → MISSING_FEATURE (Important)
- Neither a "UI work" pointer nor an Active skills section in a UI project → MISSING_FEATURE (Important)
- DESIGN.md §12 missing or holding only the "audit" command → OUTDATED_CONVENTION (Important)
- Status section is prose / > 2 lines, or invariants are a numbered list without `Enforced by`
  → FORMAT_MIGRATION (Critical — this is the file every session reads first)
- `AGENTS.md` exists as a copy of `CLAUDE.md` (not an import), or differs from it → FORMAT_MIGRATION
  (Critical; report the diff — the two have already drifted)
- Over budget → BUDGET_EXCEEDED (Important)

---

### IMPLEMENTATION_PLAN.md

Required sections:
- [ ] Non-negotiables block (must appear before Phase 0)
- [ ] Standing rules (check it has 7 bullets, not the old 6, 5 or 4):
  - [ ] Workflow-first bullet (references phase scripts + worktrees, and the Phase vs Change
    distinction) ← Phase/Change new in v2.0
  - [ ] Goal-directed, self-contained tasks bullet (references `/goal`, `verify`,
    `claude-in-chrome`, and states the project's exit strategy) ← new in v1.1+
  - [ ] Tests-with-code bullet
  - [ ] Doc sync mandatory before merge bullet ← new in v0.3+
  - [ ] Decisions captured without fail bullet (ADR before merge) ← new in v0.3+
  - [ ] Definition of done bullet (includes doc-sync commit)
  - [ ] Claims carry evidence bullet (evidence ladder; `prod-live` only from a deploy) ← new in v2.0
- [ ] Phase status table (columns: Phase, Status, Exit gate, Deploy state, Last update) ← Deploy state new in v2.0
- [ ] Per phase block:
  - [ ] Scope items
  - [ ] Tests
  - [ ] Exit gates as a table: `Gate · Evidence level · Artefact · Verified by · Status` ← new in v2.0
    - [ ] `/impeccable audit` gate for UI phases ← new in v0.3+
    - [ ] modern-web-guidance search requirement for new UI patterns ← new in v0.3+
    - [ ] Doc-sync gate row ← new in v0.3+
  - [ ] `Workflow:` line referencing the phase script ← new in v0.3+
- [ ] Deferred items table with `Owner · Revisit trigger` columns ← columns new in v2.0
- [ ] `## Changes` table (`CHG · Date · Branch · Summary · ADR · Deploy state`) ← new in v2.0
- [ ] Workflow scripts index table (includes `change-template.js`) ← new in v0.3+ / v2.0
- [ ] File size ≤ budget (default 65536 bytes)

Outdated indicators:
- Old 4-, 5- or 6-bullet standing rules (no workflow-first, or no goal-directed-tasks bullet, or
  no claims-carry-evidence bullet) → OUTDATED_CONVENTION (Critical if no workflow-first;
  Important otherwise)
- Standing rules present but no doc-sync bullet → MISSING_FEATURE (Important)
- Exit gates as bullets (any phase not ✅) → FORMAT_MIGRATION (Critical)
- Exit gates as bullets (✅ phases only) → FORMAT_MIGRATION (Optional — history; migrate with
  level = what the prose claimed, or leave in PHASE_ARCHIVE untouched)
- Phase-status table without `Deploy state` → FORMAT_MIGRATION (Important)
- More than ~3 fractional phases that are single-scope hotfixes (the `6i…6r` pattern) →
  FORMAT_MIGRATION (Optional): offer to re-record them as `CHG-xxx` rows (IDs preserved in the
  Summary: "was Phase 6i") — only with explicit approval; never renumber
- Phase blocks with no exit gate for impeccable audit (UI project) → MISSING_FEATURE (Important)
- No deferred items table → MISSING_FEATURE (Important)
- Deferred table without `Owner` / `Revisit trigger` → FORMAT_MIGRATION (Important)
- No `## Changes` table → MISSING_FEATURE (Important)
- No workflow scripts index → MISSING_FEATURE (Important)
- Phase blocks with no "Workflow:" line → MISSING_FEATURE (Important)
- Inline `>` callouts holding deferred items instead of table rows → FORMAT_MIGRATION (Important)

Also check `.claude/workflows/phase-*.js` scripts directly (not just IMPLEMENTATION_PLAN's prose):
- [ ] Each task agent prompt opens with `/goal <condition>` → MISSING_FEATURE (Important) if a
  script has task agents but none set a goal condition.
- [ ] Task prompts reference the `verify` skill, not just `npm test`/lint → MISSING_FEATURE
  (Important).
- [ ] A stuck-task handling block is present matching IMPLEMENTATION_PLAN's stated exit strategy
  (not silently absent) → MISSING_FEATURE (Important).
- [ ] Script has a `Setup` phase that creates/checks out a `phase-N-<slug>` branch, and task
  worktrees branch off it (not off `main`) → OUTDATED_CONVENTION (Critical) if absent — this is
  the pre-phase-branch script shape where task branches merged straight to `main`.
- [ ] An `Integrate` step merges task branches into the phase branch, and the final `Merge` step
  merges the phase branch — not individual task branches — into `main` → OUTDATED_CONVENTION
  (Critical) if the script's Merge step instead iterates task branches directly onto `main`.
- [ ] `Setup` reserves the phase's ADR stubs (`Proposed`) before Build fans out →
  FORMAT_MIGRATION (Important) if absent — the cause of every `renumber ADR-025 → 026` commit.
- [ ] A `Verify` stage between Integrate and Doc Sync writes `.keel/evidence/phase-N.json`, and
  Doc Sync *cites* it rather than re-running suites → FORMAT_MIGRATION (Important) if absent.
- [ ] `Merge` flips the CHANGELOG line / phase-status deploy state to `[merged]` on `main` →
  FORMAT_MIGRATION (Optional) if absent — otherwise the project accumulates "flip doc-sync's
  pre-merge language to merged" commits.
- [ ] Task prompts state the timestamp-prefixed migration-file rule → MISSING_FEATURE (Optional).

Only patch scripts for phases that are not ✅; completed phases' scripts are history.

---

### DESIGN.md

Required sections §1–§12 (check by heading):
- [ ] §1 Design Language (principles numbered, voice & tone)
- [ ] §2 Brand (§2.1 identity, §2.2 colour palette with token table, §2.3 typography)
- [ ] §3 Design Tokens (3-tier architecture: primitive → semantic → component)
- [ ] §4 Atoms (component table with all states listed)
- [ ] §5 Molecules
- [ ] §6 Organisms & UX Patterns (per-flow sub-sections, failure ladder, latency etiquette)
- [ ] §7 Responsiveness (breakpoints, per-surface adaptation table)
- [ ] §8 Multi-Interface Strategy (only if multi-surface; omit otherwise)
- [ ] §9 Trust & Clarity UX Patterns
- [ ] §10 Accessibility (WCAG 2.2 AA, contrast table)
- [ ] §11 Implementation Notes (stack, component DoD, governance)
- [ ] §12 Skill Integration ← new in v0.3+
  - [ ] §12.1 impeccable: 24-row lifecycle command table (all 23 commands mapped)
  - [ ] §12.2 modern-web-guidance: all 3 functions with usage table + 11-row query guide

Outdated indicators:
- §12 absent entirely → MISSING_FEATURE (Important for UI + skills opted-in)
- §12 present but ≤ 8 command rows (old minimal version) → OUTDATED_CONVENTION (Important)
- §12.1 has no "zero-tolerance anti-patterns" list → MISSING_FEATURE (Important)
- §12.2 only mentions `search`, not `retrieve` or `list` → OUTDATED_CONVENTION (Important)
- No browser support policy placeholder in §12.2 → MISSING_FEATURE (Optional)

---

### ARCHITECTURE.md

Required sections:
- [ ] Context diagram (trust boundary, external systems, data flows)
- [ ] Component map (internal modules with responsibilities)
- [ ] Data model overview (primary entities and relationships)
- [ ] Decision ledger (cross-references to ADR.md by number)
- [ ] Non-negotiables (security/isolation rules with no exceptions)
- [ ] Scaling model (bottlenecks, scaling levers)

No new keel v0.3 features to add — check for:
- [ ] ADR cross-references are present (not just "see ADR") → gap: MISSING_SECTION (Important) if absent
- [ ] Non-negotiables section present → gap: MISSING_SECTION (Critical) if absent

---

### ADRs (`docs/adr/` — or legacy `ADR.md`)

Required (format 2):
- [ ] `docs/adr/README.md` index: `ADR · Title · Status (lifecycle) · Deciders · Date`, plus an
  **Open decisions** table with one row per *question* and a `Locations` column
- [ ] One file per decision `docs/adr/ADR-NNN-<slug>.md`, table-based: header table (Status with
  lifecycle `Proposed → Accepted → Built → Superseded` and cited commits; Deciders tagged
  `founder` / `engineering` / `legal`; Bounded by; Supersedes / superseded by), ≤ 2-sentence
  Context, Decision as a Y-statement row, Options table with ✓/✗, Consequences table with
  Easier / Harder / Off the table / Build deviation rows, Revisit trigger
- [ ] No `### Addendum` / `### Build confirmation` headings anywhere (their content lives in
  `Build deviation`, DEPLOYMENT deploy log, CHANGELOG, RUNBOOK postmortems, or FEEDBACK_ROUNDS)
- [ ] No `[NEEDS DECISION]` markers in other docs that lack a row in Open decisions
- [ ] Index file ≤ budget (default 16384 bytes)
- [ ] ADRs written from 2.6 on open with the frontmatter header (`id`, `status`, `paths`, `check`);
  older ADRs have none and are never given one (not a gap)

Outdated indicators:
- Single `ADR.md` with prose entries → FORMAT_MIGRATION (Critical); count the addenda for the
  Relocations table
- Per-file ADRs but prose-shaped (ospraye-style `docs/adr/` on format 1) → FORMAT_MIGRATION
  (Important — layout is right, shape is not)
- Entries present but missing "Revisit trigger" → MISSING_SECTION (Optional)
- `Deciders` untagged → FORMAT_MIGRATION (Optional; tag from the text, `engineering` by default)
- Other docs have `[NEEDS DECISION]` with no Open-decisions row → UNFILLED_PLACEHOLDER (Important)
- Open decisions table has several rows for the same question at different file:line locations
  → OUTDATED_CONVENTION (Optional): collapse to one row, list the locations

---

### DEPLOYMENT.md (operated systems)

Required:
- [ ] §1 Environment matrix — one row per environment, one table for all of them (never split
  by environment)
- [ ] §2 Promotion path with the gate (evidence level) at each hop
- [ ] §3 Build-time vs runtime config table
- [ ] §4 Pre-deploy checklist · §5 Post-deploy live-verification checklist
- [ ] §6 Rollback per component
- [ ] §7 Deploy log (`vNN · date · commit · env · verified-by · evidence · notes`)
- [ ] §8 Known gotchas

Outdated indicators:
- Absent, but RUNBOOK/COMMANDS carry Environments / Standard deploy / Rollback sections →
  MISSING_DOC (Important): generate, seeding from those sections and from `fly.toml`,
  `deploy.sh`, `Dockerfile`, CI files, `terraform/` on disk; mark disagreements between docs and
  configs `[NEEDS DECISION]`
- Present but env matrix disagrees with deploy configs on disk (host, region) → UNFILLED_PLACEHOLDER
  (Important) — this is the "docs say AWS, deploy target is Fly" class of drift
- Deploy log absent while ADRs/status carry "deployed vNN / live-verified" text →
  FORMAT_MIGRATION (Important): relocate via the classifier

### CHANGELOG.md

Required:
- [ ] `[Unreleased]` section at top
- [ ] Every entry carries a deploy state tag and a reference (Phase N / CHG-xxx / ADR-xxx / PM-xxx)

Outdated indicators:
- Absent → MISSING_DOC (Important): seed from `git log` (merge + `docs: sync` commits) with
  `[merged]` unless a deploy is proven
- Deploy-state text living in ADRs / keystone instead → FORMAT_MIGRATION (Important)

### RUNBOOK.md

Required (format 2):
- [ ] `## Postmortems` table (`PM-xxx · date · trigger · root cause · fix · prevention · related ADR`)
- [ ] Playbooks as `Symptom · Check · Fix · Escalate` tables
- [ ] Environments / deploy / rollback replaced by one pointer line each to DEPLOYMENT.md

Outdated indicators:
- Environments / Standard deployment / Rollback still inline while DEPLOYMENT.md exists →
  OUTDATED_CONVENTION (Optional): duplicate home
- Incident narratives in ADR addenda with no `PM-xxx` row → FORMAT_MIGRATION (Important)

### ENGINEERING_DESIGN.md

- [ ] Non-negotiables table has `Enforced by · Gap` columns → FORMAT_MIGRATION (Important) if
  absent; fill `Enforced by` only with a real file:line / lint rule / test, else `Gap`

---

### PRODUCT.md (UI projects with impeccable)

Required:
- [ ] YAML frontmatter: `register: brand` or `register: product`
- [ ] One-line description
- [ ] "Who uses it" section (target personas)
- [ ] "What it does" section (core value)
- [ ] "Design direction" section
- [ ] "Browser support" section

Missing PRODUCT.md entirely in a UI project where impeccable is or will be installed → Critical.
impeccable's hook fires on every UI edit but can't run meaningfully without PRODUCT.md.

---

### Workflow scripts (.claude/workflows/)

Check:
- [ ] `doc-sync.js` present → MISSING_FEATURE (Important) if absent
- [ ] `doc-sync.js` ends with a Budget check (`wc -c` against `.keel/meta.json` `budgets`) and a
  conditional Archive phase → FORMAT_MIGRATION (Important) if absent — replace verbatim, it holds
  no project content
- [ ] `doc-sync.js` reconciles ADR status (2.6.2: Step 4 rewrites each touched ADR's Status cell and Build
  deviation row to what was built; Step 7 compares ARCHITECTURE, LLD and README with the code; Step 9 runs
  `node .keel/check.mjs`) → OUTDATED_CONVENTION (Minor). `doc-sync.js` and `.claude/agents/doc-sync.md` hold no
  project content (a full-time doc agent's brief is not touched): replace verbatim on approval. Run
  `.keel/check.mjs` at U2 and list any `adr-status-stale` finding as information; the next doc-sync fixes it
  (it may edit only the Status cell and Build deviation row, never the decision).
- [ ] Docs under test (2.6.3; `.keel/check.mjs` reports `docs-untested` once the project is on 2.6.3) →
  OUTDATED_CONVENTION (Optional). For a README with runnable code blocks or an error table, propose
  `examples/<name>.*` files with expected output, an `examples.test.*` runner, the `keel:example` /
  `keel:asserts` markers, and the plan's "Docs under test" standing rule. Applied on approval; the
  README text is not changed except to add the markers. The phase and change templates' Build brief
  gain the README section (replace `change-template.js` verbatim; propose the edit for non-✅ phase scripts).
- [ ] BRD assumptions name their source (2.6.4; `.keel/check.mjs` reports `brd-unsourced` only where the
  Assumptions table has a `Source` column) → OUTDATED_CONVENTION (Optional). Propose adding the `Source`
  column: for each row, the transcript answer it rests on, the ADR that decides it, or `unvalidated` where
  none does. Rows that state code behaviour with no founder answer behind them are listed for the user, who
  may point them at an ADR or LLD item; the assumption text is never rewritten and no row is removed.
  Applied on approval. `doc-sync.js` (Step 7 compares those rows with the code; Step 9 fixes `status-lag`)
  and the Merge stage of `change-template.js` (all state substitutions in one commit, then
  `.keel/check.mjs`) are replaced verbatim; propose the Merge edit for non-✅ phase scripts.
- [ ] `change-template.js` present → MISSING_FEATURE (Important) if absent
- [ ] `.keel/evidence/` exists → MISSING_FEATURE (Important) if absent
- [ ] At least one `phase-N-*.js` for each non-✅ phase in IMPLEMENTATION_PLAN → MISSING_FEATURE (Important)
- [ ] `README.md` present → MISSING_FEATURE (Optional)
- [ ] Verify stage of `change-template.js` and every non-✅ `phase-N-*.js` has the real-check line,
  the `failSeen` field and the `doc-size.mjs --evidence` step (2.6: check proven to fail; `prod-live`
  rejected by the checker, not by capitals) → OUTDATED_CONVENTION (Minor). Propose the three Verify
  edits per script and apply on approval; `change-template.js` holds no project content and is
  replaced verbatim. Needs `.keel/doc-size.mjs` with `--evidence` (installed on every upgrade).
  Existing `.keel/evidence/*.json` records are history: never rewritten, never re-checked.

---

### Skill files

If UI project:
- [ ] `*/skills/impeccable/scripts/hook.mjs` resolves on disk (not just a stub `SKILL.md`) →
  gap: MISSING_SKILL (Important) if absent. Fix by running `npx impeccable skills install -y
  --providers=claude --scope=project`, not by re-writing config around the gap.
- [ ] `*/skills/modern-web-guidance/SKILL.md` resolves on disk → MISSING_SKILL (Important) if
  absent. Fix by running `npx skills add GoogleChrome/modern-web-guidance --skill
  modern-web-guidance -a claude-code -y`.
- [ ] `.claude/settings.json` has the modern-web-guidance PostToolUse hook entry → MISSING_SKILL
  (Important). Note: impeccable's hook is *not* expected here — it lives in the gitignored
  `.claude/settings.local.json`, activated via `/impeccable hooks on`. Do not flag its absence
  from `settings.json` as a gap.
- [ ] `.claude/hooks/modern-web-guidance-hook.mjs` exists → MISSING_SKILL (Important)
- [ ] `skills-lock.json` has both entries with real (non-`"latest"`) installed versions →
  MISSING_SKILL (Optional)
- [ ] `.impeccable/config.json` exists → MISSING_SKILL (Optional)
- [ ] Either FE skill installed → the design role has an owner (a full-time design agent, else
  `.claude/agents/design.md`) recorded in `.keel/meta.json` `agents.design` → MISSING_SKILL (Important)

Every project that will be built:
- [ ] security-audit skill resolves (`~/.claude/skills/`, `~/.agents/skills/` or `.claude/skills/`
  `security-audit/SKILL.md`) → MISSING_SKILL (Important) unless `.keel/meta.json` `securitySkill`
  is `"never"`. Fix only after an explicit yes (`modes/generation.md` "Security skill": global, third-party).
- [ ] Skill installed → the security role has an owner (full-time security/QA agent, else
  `.claude/agents/security.md`) recorded in `agents.security` → MISSING_SKILL (Important). Never
  both: a full-time agent gets the skill and no subagent is written.
- [ ] `agents` entry written by keel 2.1 as an orchestrator request (not a `.claude/agents/` path,
  not `type: full-time` for an agent that exists) → OUTDATED_CONVENTION (Important): replace per
  `modes/upgrade.md` "Migrating keel 2.1 agent requests".
- [ ] A role is set up → AGENTS.md workflow step 9 *Review before done* present (2.6: one line; older: + its Pre-PR line) →
  MISSING_FEATURE (Important)
- [ ] A role is set up → `.keel/prune-evidence.mjs` + `evidenceRetention` in meta.json →
  MISSING_FEATURE (Optional)
- [ ] (every project) `doc-sync` role has an owner (full-time doc agent, else
  `.claude/agents/doc-sync.md`) in `agents."doc-sync"`; `doc-sync.js` has the delegate → review →
  ≤3-round loop; phase scripts' Doc Sync stage calls `doc-sync.js`; AGENTS.md has workflow step 5
  (doc sync before the completing commit) and the Delegation section or (2.6) its pointer to `.claude/workflows/README.md` →
  OUTDATED_CONVENTION (Important). Fix: `modes/upgrade.md` "Migrating to keel 2.3".
- [ ] Every role subagent file ends with the `## Report` block and the caller-only rule →
  OUTDATED_CONVENTION (Important)
- [ ] `.keel/doc-size.mjs` present (with `--split`) and `defaultBudget` in meta.json → MISSING_FEATURE (Important)
- [ ] doc-sync role brief (`.claude/agents/doc-sync.md` or the full-time doc agent's) has the
  "Split docs — required, every edit" rules → OUTDATED_CONVENTION (Important)
- [ ] `node .keel/doc-size.mjs`: every `archive`/`split` verdict → `BUDGET_EXCEEDED` with the
  proposed action (archive, then split) and the proposed parts table (part file · sections · bytes)
  for the user to approve in U3 · every LINK ERROR → MISSING_SECTION (Critical: a part nobody can
  reach, or that can't reach its index)
- [ ] `.keel/doc-size.mjs` prints a verdict per doc (2.4.2: `ok`/`waived`/`archive`/`split`/`manual`)
  → else OUTDATED_CONVENTION (Important): replace verbatim with `doc-sync.js`
- [ ] `.keel/doc-size.mjs` supports `--where` and `--move-out` (2.4.3) → else OUTDATED_CONVENTION (Important):
  replace verbatim, with `doc-sync.js` and `change-template.js`; phase scripts' plan writes use `--where`
- [ ] `.keel/doc-size.mjs` supports `--closeout` (2.5.6: `--split` stays inside the project, `§N` refs repointed,
  closeout numbering + open-row count) → else OUTDATED_CONVENTION (Important): replace verbatim (U1 installs it first).
  No document changes. A Deferred items placeholder row `*(none yet …)*` whose Status is ⬜ → propose `—` (Minor)
- [ ] keystone headroom covers any keystone text this upgrade adds → else propose `--move-out` of a
  named section (never compress)
- [ ] `.keel/meta.json` has no `budgetExceptions` (moved to `waivers` with `reason` + `reviewed`)
  → OUTDATED_CONVENTION (Minor; ask the user per entry)
- [ ] Split docs (a parent with `## Parts`): no same-file `#anchor` link in the family points at a heading that moved to
  another part (2.6.0; `.keel/check.mjs` reports them as `dead-link … no heading`) → OUTDATED_CONVENTION (Minor).
  Propose `node .keel/doc-size.mjs --relink <parent.md>` per family and run it on approval: it rewrites only those links,
  to `NN-part.md#anchor`, is idempotent, and never touches ADR files. New splits do this themselves.
- [ ] `.keel/check.mjs` present (2.6.0: `/keel check`, read-only drift check) → MISSING_FEATURE (Optional).
  U1 installs it verbatim on every upgrade; no document changes. Run it once at U2 and list its findings in the
  report as information (doc-sync or the named mode fixes them; the upgrade itself does not)
- [ ] Every catalog document type present, in full or as a stub (2.6.1; `.keel/check.mjs` reports `missing-type`)
  → MISSING_DOC (Recommended). Propose one stub per missing type from `templates/STUB.md`: the reason from the
  existing docs (e.g. ARCHITECTURE says there is no remote environment), the trigger from the catalog "Stubs"
  table, and the AGENTS.md document-map "Stubs" row. Where the trigger already holds, propose the full document
  instead. Applied on approval only; existing documents are never touched. A stub reported `stub-triggered`
  → MISSING_DOC (Important): propose the full document.
- [ ] Every ADR whose header names `paths` is cited by a `.claude/rules/*.md` (2.6.1; `rules-missing`) →
  MISSING_FEATURE (Optional): propose the area rule from the ADR header, as generation does. The ADR is not edited.
- [ ] an installed `.claude/hooks/keel-update-check.mjs` reads `release.json` (2.5.3: user-facing releases only) → else OUTDATED_CONVENTION (Minor): replace verbatim
- [ ] `.claude/hooks/keel-update-check.mjs` + SessionStart entry → MISSING_FEATURE (Optional, opt-in)
- [ ] AGENTS.md "Stops and end-of-run report" section (2.6: one stop line filled from the project's ADR/NFR/
  COMPLIANCE/THREAT_MODEL rows, and the four-line end-of-run report) → MISSING_FEATURE (Optional). Propose the
  stop list for the owner to edit; never invent a stop the docs do not support
- [ ] Slim keystone and hooks (2.6) → see the section below; every item is OUTDATED_CONVENTION
  (Minor) and an offer, never applied without approval
- [ ] Team answers (opt-in, `references/team-answers.md`): no `rounds` in `.keel/meta.json` → nothing
  to migrate and no gap; it is offered at Phase 0 of the next interview round, never forced. If
  `.keel/rounds/` exists: `.keel/packet-check.mjs` present and passing → else MISSING_FEATURE
  (Important): install it verbatim from `templates/keel-packet-check.mjs`; repo public and
  `.keel/rounds/` not git-ignored → ask the owner (Minor).

---

### Slim keystone and hooks (2.6)

Keel 2.6 cuts the always-loaded keystone (fresh project 16.1 KB → under 9.5 KB) by moving
detail to the one home it already has (`references/conventions.md` "Placement rule"). Execution
tier only: record documents are never shortened or rewritten. Each item is its own offer and,
if approved, its own commit. Never compress wording in place; a section that cannot be matched
to its home stays as it is.

**How to offer a keystone cut (C1–C4).** For each section below: (1) show the section, (2) show
the home and grep it for each rule the section states, (3) if the home holds it word for word,
offer the one-line pointer from the 2.6 template; if a sentence is missing from the home, first
offer to move that sentence there verbatim (execution-tier homes only: IMPLEMENTATION_PLAN
"Standing rules", `.claude/workflows/README.md`), then the pointer. Show the byte saving.

| # | Keystone section | Home that must hold it | 2.6 replacement |
|---|---|---|---|
| C1 | CLAUDE.md "Active skills" (impeccable table, modern-web-guidance) | DESIGN.md §12.1 / §12.2 (record, read only; if §12 is missing, keep the section) | the "UI work" line |
| C2 | AGENTS.md "Git & working workflow" steps 0–9 (multi-line) | IMPLEMENTATION_PLAN "Standing rules" + `.claude/workflows/README.md` (Stages, Rules) | one line per step + the "Rules and rationale" pointer. Step 9's text goes into Standing rules as the "Review before done" bullet if absent; step 5 gains the proportional-sync sentence there |
| C3 | CLAUDE.md "Review subagents" table | AGENTS.md steps 5 and 9 + `.claude/agents/*.md` | the "Review roles" line |
| C4 | AGENTS.md "Delegation" section | `.claude/workflows/README.md` "Delegation" (append the section verbatim if absent) + each agent's Report block | the Delegation pointer line |

**C5: standing gates → hook.** Offer `.claude/hooks/keel-gates.mjs` (from
`templates/keel-gates-hook.mjs`, verbatim) and the `Stop` entry from `templates/hooks-settings.json`.
Once installed, offer to drop the Pre-PR boxes it and steps 5–9 cover (tests line, decision line,
security/design reviewer, doc-sync Report, doc-sync commit + size check); the invariant boxes and
the COMMANDS/DEPLOYMENT/RUNBOOK box stay.

**C6: subagent descriptions.** For each `.claude/agents/{design,security,doc-sync}.md` whose
`description:` still says "MUST BE USED PROACTIVELY": offer the 2.6 template description (plain
trigger conditions). Leave a hand-edited description alone unless the user approves; never touch a
full-time agent's definition.

**C7: modern-web-guidance hook.** If `.claude/hooks/modern-web-guidance-hook.mjs` matches
`.js/.mjs/.ts` or has no once-per-session marker: offer the 2.6 file (verbatim) and the matching
DESIGN.md §12.2 trigger sentence (a factual correction, shown as a diff, applied only on
approval). **Duplicate registration:** if the same hook command appears more than once across
`.claude/settings.json` and `.claude/settings.local.json` (any hook, not only this one), report it
and offer to keep one entry in `settings.json`.

**Proportional doc sync.** `.claude/workflows/doc-sync.js` is replaced verbatim, as on every
upgrade (it gains the status-only triage). Offer the matching Standing-rules sentence and the
doc-sync subagent description.

### Area rules and ADR header (2.6)

Keel 2.6 adds path-scoped area rules: `.claude/rules/<area>.md` files that Claude Code loads only
when matching files are touched, each line pointing to the ADR or NFR that holds the reason. New
ADRs also open with a small frontmatter header (`id`, `status`, `paths`, `check`). Both are offers;
nothing is applied without approval.

**ADR files are record tier and are never rewritten.** Existing ADRs get no header, now or later.
A missing header on an ADR written before the upgrade is not a gap; do not report it. Only ADRs
written after the upgrade use the 2.6 template (doc-sync and `/keel phase new` do this).

**How to offer the rules files.**
1. Read each ADR (Accepted or Built; skip Superseded) and the NFR table. Collect the code paths
   their text names: module names, folders, file globs. Never invent a glob: an ADR whose text
   names no path is listed as "no path found" and the user may supply one or skip it.
2. Group by area (one file per module, layer or boundary). For each rule write one or two lines:
   what to do or never do there, ending in the ID. Never paste the ADR's or NFR's text.
3. Show each proposed file in full (frontmatter + lines) with the ADR/NFR each line came from.
   Write only the approved files, from `templates/rules/area.md`.
4. Offer the AGENTS.md sentence "Area rules load by path: …" from the 2.6 template, in place of
   "read the relevant one *before* touching code". Only if at least one rules file was written.
5. Run `node .keel/check.mjs` (installed on every upgrade): it must report no `rule-ref` finding.

**Second run.** Rules files that already exist are compared, not rewritten: offer only the lines
for ADRs/NFRs added since (a new ADR's header `paths` makes this exact). Running upgrade twice
changes nothing the second time.

## Gap severity reference

| Situation | Severity |
|---|---|
| Core doc missing entirely | Critical |
| ENGINEERING_DESIGN non-negotiables section missing | Critical |
| PRODUCT.md missing in UI project with skills opted-in | Critical |
| Old 4-bullet standing rules (no workflow-first, no doc-sync) | Critical |
| Phase workflow scripts merge task branches straight to main (no phase branch / Setup / Integrate) | Critical |
| FORMAT_MIGRATION on the keystone (prose status, list invariants, hand-copied AGENTS.md) | Critical |
| FORMAT_MIGRATION on ADRs (single prose ADR.md with addenda) | Critical |
| FORMAT_MIGRATION on IMPLEMENTATION_PLAN (bullet exit gates on non-✅ phases) | Critical |
| DEPLOYMENT.md absent on an operated system | Important |
| CHANGELOG.md absent | Important |
| Deploy-state / incident text living in ADRs or keystone (FORMAT_MIGRATION relocation) | Important |
| Deferred table without Owner / Revisit trigger; no Changes table | Important |
| Phase scripts without Verify stage / ADR reservation; doc-sync without Budget check | Important |
| BUDGET_EXCEEDED on the keystone | Important |
| BUDGET_EXCEEDED on any other budgeted doc | Optional |
| Hotfix-weight fractional phases that could be Changes | Optional |
| keel-transcript.md absent | Optional |
| Standing rules present but no goal-directed-tasks bullet (no `/goal`, no exit strategy) | Important |
| Phase workflow scripts have task agents with no `/goal` completion condition | Important |
| DESIGN.md §12 missing or outdated (< 15 rows) | Important |
| IMPLEMENTATION_PLAN missing doc-sync exit gate per phase | Important |
| IMPLEMENTATION_PLAN missing deferred items table | Important |
| IMPLEMENTATION_PLAN missing Workflow: line per phase | Important |
| Phase workflow scripts missing from .claude/workflows/ | Important |
| CLAUDE.md UI-skills pointer (or older Active skills section) missing (UI project) | Important |
| Skill files (impeccable/modern-web-guidance) not installed (UI) | Important |
| Unfilled `{{PLACEHOLDER}}` or `[NEEDS DECISION]` in any doc | Important |
| Missing cross-references between docs | Optional |
| Optional sections absent with valid reason | Optional |
| Deferred items table missing | Optional |
| .keel/meta.json missing | Optional |

---

## How to apply updates (Phase U4 rules)

1. **Surgical only.** Add missing sections, update outdated blocks, append new features.
   Preserve all user-written content. Never delete what exists unless replacing an outdated block.

2. **Block replacement.** These sections are safe to replace entirely when outdated:
   - IMPLEMENTATION_PLAN standing rules block (bounded, self-contained)
   - DESIGN.md §12 (bounded: from `## 12.` to `*End of DESIGN.md*`)
   - CLAUDE.md git workflow section (bounded by heading)

3. **Appending.** These sections are added at the end of the doc when absent:
   - DESIGN.md §12 (before the `*End of DESIGN.md*` line)
   - IMPLEMENTATION_PLAN deferred items table + workflow scripts index (before `*End of*` line)
   - CLAUDE.md "UI work" line (at end of file)

4. **Placeholder fill.** After every edit, grep the modified doc for `{{[A-Z_]+}}` and fill
   each from project context established during this session. Report any that couldn't be filled.

5. **Skill installation.** Follow the FE skill integration steps in `modes/generation.md` Phase 3.
   Merge hook entries into existing `.claude/settings.json` rather than overwriting.
   Never delete existing hook entries — append to the PostToolUse array.

6. **Write .keel/meta.json.** After all updates, create or update this file (`docFormat: 2`,
   `adrLayout`, `budgets` added if absent).

---

## Format migration (U0–U7) — per-doc mechanics

The sequence itself is in `modes/upgrade.md` (Upgrade Mode). This section holds the mechanics the surgical
rules above cannot express, because a format migration *does* rewrite whole files — under four
rules that replace "surgical only" for these steps: **IDs never change · relocate, never delete
(verbatim, with source recorded) · unclassifiable → `Unclassified (review)` · one commit per
step on `keel-upgrade-2.0`**.

### Step order and why

| Step | Does | Why this order |
|---|---|---|
| U0 | Archive everything eligible (Phase X4, non-interactive) | Migration then operates on the light docs; a 76-entry status history is archive, not migration |
| U2 | Extract & classify every addendum / status entry / inline callout; write destinations first, then leave `→ relocated:` pointers | Destinations must exist before U3 caps ADR Context at two sentences — otherwise capping *is* deleting |
| U3 | `ADR.md` → `docs/adr/*.md` table form (parallel worktrees, ~20 ADRs each) | Pure reshaping once U2 has moved the narrative out |
| U4 | Plan + keystone tables, evidence levels *as claimed* | Needs CHANGELOG (U2) for Deploy state |
| U5 | AGENTS.md canonical, CLAUDE.md import, remaining new docs | Needs the reshaped keystone (U4) |
| U6 | Scripts | Needs the plan's phase list and the evidence-table shape |
| U7 | meta.json + UPGRADE_REPORT + consistency pass + budgets | Last, so it reports what actually happened |

### The addenda classifier (U2)

Apply to each `### Addendum …`, `### Build confirmation …`, multi-line status entry, or inline
`>` callout. Classify by what the text *does*, not by its heading. Use the first matching rule;
when two match, split the block at the paragraph boundary and classify each part.

| Class | Signal in the text | Destination | What is left behind |
|---|---|---|---|
| `decision-deviation` | "built as decided, with …", "instead of X the build did Y because …", a deviation from the ADR's own Decision | the ADR's `Build deviation` row (one line) + the verbatim paragraph under `Unclassified (review)` **only if** it exceeds a row | nothing — the row *is* the record |
| `deploy-state` | "merged to `main` as `abc123`", "deployed (v29)", "live-verified on `example.com`", "run against production" | `DEPLOYMENT.md` §7 deploy log row (one per deploy event named) + `CHANGELOG.md` entry with the *highest state the text proves* | `→ relocated: DEPLOYMENT.md#deploy-log (vNN)` |
| `incident` | something broke, was found, was diagnosed: "found the live chunk carrying a test key", "the origin gate was discarding every beacon", "second silent drop in a week", a root cause + a fix | `RUNBOOK.md` `## Postmortems` row `PM-xxx` + the narrative verbatim under `### PM-xxx` beneath the table; prevention column names where it landed (DEPLOYMENT gotcha / test / lint) | `→ relocated: RUNBOOK.md#pm-xxx` |
| `client-round` | "client feedback round", "founder review batch", a named reviewer's list of items | `FEEDBACK_ROUNDS.md` `FR-xx` row + the items verbatim in the round block | `→ relocated: FEEDBACK_ROUNDS.md#fr-xx` |
| `still-open` | "still open", "not done here", "left for the next pass", "founder's call" | Deferred items row (`Owner` from the text) or Open-decisions row | `→ tracked: IMPLEMENTATION_PLAN.md#deferred-items` |
| `unclassified` | none of the above with confidence | stays in place under `Unclassified (review)` | — |

Worked example — mysha `ADR-065` (Meta pixel deployment-managed), four addenda, classified:

| Source | Text (abridged) | Class | Destination |
|---|---|---|---|
| Addendum 1 ¶1 | "v1 `AnalyticsTracker` unmounted (`fcf0ae1`) … deleted" | `decision-deviation` | ADR-065 `Build deviation`: "v1 tracker retired same day (`fcf0ae1`)" |
| Addendum 1 ¶2 | "Prod checkout was on `pk_test_` … since the Sep 9 deploys … real checkout most likely broken for four days" | `incident` | RUNBOOK `PM-001`: trigger = storefront build-args; root cause = test key baked in; fix = redeploy with live key; prevention = DEPLOYMENT §3 build-time config row + §5 post-deploy check |
| Addendum 1 ¶3 | "CAPI token is not stored anywhere … has to be pasted again" | `still-open` | Deferred row, Owner `founder` |
| Addendum 1 ¶4 | "Admin session dropped on backend deploy … not investigated" | `still-open` | Deferred row, Owner `engineering` |
| Addendum 2 | "retiring v1 exposed two v2 gaps … fixed in `medusa-analytics#4`, re-pinned `291ad14`" | `incident` + `deploy-state` | RUNBOOK `PM-002`; DEPLOYMENT deploy log row (storefront redeploy, `291ad14`); CHANGELOG `[deployed]` |
| Addendum 3 | "the backend was throwing ad traffic away … origin gate … both origins now pinned; backend redeployed" | `incident` + `deploy-state` | RUNBOOK `PM-003` (prevention: DEPLOYMENT §8 gotcha "single public origin"); deploy log row; CHANGELOG |
| Addendum 3 last ¶ | "Still to decide … 308 `www → apex` … founder's call" | `still-open` → resolved by Addendum 4 | Open-decisions row, immediately closed by the ADR-065 successor decision below |
| Addendum 4 ¶1 | "`www` now 308s to apex … founder decision taken the same day" | a **new decision**, not a deviation | new `ADR-066 — Single public origin (www → apex 308)`, Deciders `founder`, Bounded by ADR-065 |
| Addendum 4 ¶2 | "The CAPI token was correct all along … Verify was making the one Graph call a dataset-scoped token can't; fixed in `medusa-analytics#6`" | `incident` + `deploy-state` | RUNBOOK `PM-004`; deploy log row; CHANGELOG |

The ADR-065 file that results: header table (Status `Built ✅ — accepted 2026-09-13 · built
`97864dc` · live-verified prod 2026-09-13`), two-sentence Context, Y-statement Decision, Options
table, Consequences table with one `Build deviation` row — and nothing else. Every sentence of
the four addenda is still in the repo, verbatim, under a `PM-xxx`, a deploy-log row, a deferred
row, or ADR-066.

### Evidence levels during migration (U4)

Map the *claim the prose makes* to the ladder; never round up:

| Prose says | Level | Artefact |
|---|---|---|
| "code-level", "confirmed by direct code read", "diff read in full" | `code-read` | commit hash cited, else `[NEEDS DECISION]` |
| "unit tests green", "N passed" | `unit` | test command / report path if cited |
| "integration suite green", "isolation suite green", "e2e green" | `integration` | same |
| "browser-verified locally", "claude-in-chrome pass against `nx serve`" | `local-browser` | transcript path if cited, else `[NEEDS DECISION]` |
| "verified on staging", "Fly staging" | `staging` | deploy version if cited |
| "live-verified in production", "verified on `<prod domain>`" | `prod-live` | deploy version + date |
| "done", "complete", "✅" with no verification text | `code-read` + `Status: partial` + note "no evidence recorded at migration" | `[NEEDS DECISION]` |

A ✅ phase whose gates migrate to anything below the level the gate text demands **stays ✅**
(history is not re-litigated) but its rows show the real level — the report lists these as
"claimed above evidence" for the user to see.

### Parallelising U3

Split `ADR.md` by `## ADR-` headings into batches of ~20. Each worktree agent receives its batch
and the destination shape, writes only its own `docs/adr/ADR-NNN-*.md` files, and returns the
index rows. The parent writes `docs/adr/README.md` once from the returned rows, leaves `ADR.md`
as a stub redirect (title + link per ADR, so old `ADR.md#adr-065` links still land), and commits
U3 as one commit. Agents must not touch DEPLOYMENT / RUNBOOK / CHANGELOG — U2 already did.
