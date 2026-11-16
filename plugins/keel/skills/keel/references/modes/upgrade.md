# Keel mode: upgrade

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here. Sections named here from generation (Phase 3, Phase 5, "FE skill integration", "Security skill",
"Role owners", "Update-check hook") are in `generation.md`; Archive Mode is in `archive.md`; Phase Mode
is in `phase.md`.

## Upgrade Mode — `/keel upgrade` · `/keel refresh` · `/keel sync`

**Trigger:** user says "keel upgrade", "keel refresh", "keel sync", "update my keel docs",
"refresh my documentation", "sync my docs with latest keel features", or any equivalent phrasing
in a project with existing keel-generated docs.

**Prerequisite — detect existing keel project:**
Look for ≥3 of: BRD.md · PRD.md · ARCHITECTURE.md · ADR.md *or* `docs/adr/` · IMPLEMENTATION_PLAN.md ·
CLAUDE.md *or* AGENTS.md with keel-standard headings. If not detected, respond:
> "I don't see keel-generated docs here. Run `/keel` in this project first to generate your
> foundational documents, then come back to upgrade them."

**Two kinds of upgrade, decided in U1 from `.keel/meta.json` `docFormat`:**
- **Feature upgrade** (`docFormat: 2`) — the surgical, section-level path: Phases U1–U5 as below.
- **Format migration** (`docFormat` absent or `1`) — the project is on keel ≤1.x's layout
  (single `ADR.md` with addenda, prose status, bullet exit gates, no DEPLOYMENT/CHANGELOG,
  hand-copied AGENTS.md). Run the **Format Migration sequence (U0–U7)** at the end of this
  section *instead of* U4; it subsumes every feature gap. It is offered, never forced — a user
  may take the report only.

**References:**
- `references/keel-upgrade-guide.md` — per-doc audit checklist, gap taxonomy, format-1
  detection indicators, and the addenda classifier rubric
- `references/templates/UPGRADE_REPORT.md` — gap report format (with Relocations and Budgets)

---

### Phase U1 — Discover

0. **Install the checker first, from any version.** Copy this skill's
   `references/templates/keel-doc-size.mjs` to `.keel/doc-size.mjs` verbatim on **every** upgrade
   (whatever `keelVersion` says, even 1.x or 2.0 with no copy yet) and use it for every size and
   link measurement below. It is read-only until `--split` / `--move-out` is called. Copy
   `references/templates/keel-check.mjs` to `.keel/check.mjs` verbatim too (read-only, always).
   **Keystone headroom:** before adding any keystone text this release brings (a workflow step
   line, a pointer), compare its byte cost with `AGENTS.md`'s headroom in the checker output. If it
   does not fit, propose in U3 which whole `## ` section to move out first
   (`node .keel/doc-size.mjs --move-out AGENTS.md "<section>"` → `docs/agents/NN-<slug>.md`, linked
   both ways) — never compress existing wording to make room.

1. **Inventory existing docs.** Check for presence of each item (note present/absent):

   *Core docs:* BRD.md · PRD.md · ARCHITECTURE.md · ADR.md / `docs/adr/README.md` · NFR.md ·
   ENGINEERING_DESIGN.md

   *Execution docs:* IMPLEMENTATION_PLAN.md · DEPLOYMENT.md · CHANGELOG.md · COMMANDS.md · RUNBOOK.md

   *Design & meta:* DESIGN.md · PRODUCT.md · AGENTS.md · CLAUDE.md (and whether CLAUDE.md is a
   `@AGENTS.md` import or a hand-maintained copy) · FEEDBACK_ROUNDS.md · docs/keel-transcript.md

   *Skill files:* `*/skills/impeccable/scripts/hook.mjs` (not just a stub SKILL.md) ·
   `*/skills/modern-web-guidance/SKILL.md` · skills-lock.json (find, don't assume — see
   keel-upgrade-guide.md "Skill files")

   *Workflow scripts:* .claude/workflows/doc-sync.js · .claude/workflows/change-template.js ·
   .claude/workflows/phase-*.js · .keel/evidence/

   *Hook config:* .claude/settings.json · .claude/hooks/modern-web-guidance-hook.mjs ·
   .claude/hooks/keel-update-check.mjs · .claude/hooks/keel-gates.mjs · .claude/rules/*.md

   *Security & agents:* the security-audit skill (global or project — see "Security skill" step 1)
   · a full-time doc / security / design agent, or `.claude/agents/{doc-sync,security,design}.md` ·
   `.keel/meta.json` `securitySkill` / `agents` / `evidenceRetention` · `.keel/prune-evidence.mjs`

   *Keel metadata:* .keel/meta.json (written at generation from v1.3+; earlier projects only have
   it if a prior `/keel upgrade` created it — its absence is expected for older, un-upgraded
   projects, not itself a gap). Read `docFormat`, `budgets`, `adrLayout`.

2. **Read key docs.** Read the keystone (AGENTS.md or CLAUDE.md), IMPLEMENTATION_PLAN.md, and
   DESIGN.md (if present) in full. Understand the project domain, current phase, and whether it
   has a UI. **Measure** every doc with `node .keel/doc-size.mjs` (or this skill's
   `references/templates/keel-doc-size.mjs`, run from the project root, if the project has none) — sizes drive both the budget report and the
   migration plan (a 200KB keystone or an 800KB ADR.md means U0 archive and parallel U3).

3. **Determine project type.** From context: has UI? · production system? · multi-surface?
   These determine which optional docs are required and whether skill integration applies.

4. **Determine doc format** using the format-1 indicators in `references/keel-upgrade-guide.md`
   (single `ADR.md` containing `### Addendum`; keystone status section > 2 lines or file >
   12KB; exit gates as bullets; no DEPLOYMENT.md; no CHANGELOG.md; AGENTS.md present as a copy
   rather than imported). Any two indicators, or `docFormat < 2`, → format migration path.

---

### Phase U2 — Audit

Using the per-doc checklist in `references/keel-upgrade-guide.md`, audit every present doc and
check for every absent doc. Produce a structured gap list.

**Gap categories (classify each gap into exactly one):**
- `MISSING_DOC` — a doc in the current keel catalog that doesn't exist
- `MISSING_SECTION` — a required section (by heading) in the current template but absent in existing doc
- `OUTDATED_CONVENTION` — section exists but uses old structure (e.g. old 4-bullet standing rules without workflow-first)
- `MISSING_FEATURE` — a new keel feature not yet in the doc (DESIGN.md §12 lifecycle table, workflow scripts in IMPLEMENTATION_PLAN, active skills in CLAUDE.md)
- `UNFILLED_PLACEHOLDER` — a `{{PLACEHOLDER}}` or `[NEEDS DECISION]` that should have been filled
- `MISSING_SKILL` — impeccable or modern-web-guidance not installed in a UI project; security-audit
  not installed (unless `securitySkill` is `"never"`); an installed skill with no review-role owner;
  no `doc-sync` role owner, or `doc-sync.js` / a phase script's Doc Sync stage without the
  delegate-review loop (2.2 and earlier) → OUTDATED_CONVENTION, fixed by "Migrating to keel 2.3";
  an `agents` entry recorded by keel 2.1 as an orchestrator request (string value that is not a
  `.claude/agents/` path, or `type: "requested"`) → replace per "Role owners"
- `FORMAT_MIGRATION` — the doc is in the keel ≤1.x *shape* (not merely missing a section) and
  needs the lossless reformat of the Format Migration sequence: single `ADR.md` → `docs/adr/`
  table-based files; prose status → two-row table; bullet exit gates → evidence table; ADR
  addenda → Build-deviation row / deploy log / postmortem / feedback round; CLAUDE.md copy →
  `@AGENTS.md` import. One `FORMAT_MIGRATION` gap per doc, listing what it contains that must be
  relocated (counts of addenda, status entries, gates).
- `BUDGET_EXCEEDED` — a doc is over its byte budget (`node .keel/doc-size.mjs`; defaults if
  `budgets` absent); reported with size vs budget, what archive category would bring it under,
  and — if archiving cannot (or the doc has nothing archivable) — the **proposed split**: folder,
  parts table (part file · sections · bytes), and inbound anchor links to rewrite. Applied in U4
  only on approval. Use the checker's verdict as-is: `ok`/`waived` → no gap; `archive`/`split` →
  propose; `manual` → report with its reason. Keystone: archive, then move sections out. A split
  doc's LINK ERROR is `MISSING_SECTION` (Critical). A legacy `budgetExceptions` entry →
  OUTDATED_CONVENTION (Minor): confirm and move it to `waivers`.

**Severity:**
- `Critical` — doc missing entirely, or a core security/governance section absent, or PRODUCT.md missing in a UI project with impeccable, or a `FORMAT_MIGRATION` on the keystone / ADRs / IMPLEMENTATION_PLAN (the docs every session reads)
- `Important` — significant feature or convention missing (DESIGN.md §12, workflow scripts, doc-sync gate, workflow-first standing rules, unfilled placeholders, DEPLOYMENT.md absent on an operated system, CHANGELOG.md absent, `BUDGET_EXCEEDED` on the keystone)
- `Optional` — nice-to-have (additional cross-references, optional sections absent for valid reasons, deferred items table, keel-transcript absent, `BUDGET_EXCEEDED` on a non-keystone doc)

---

### Phase U3 — Report + Permission

1. **Present the gap report** using the format from `references/templates/UPGRADE_REPORT.md`:
   - One-line project summary
   - Summary counts: N Critical · N Important · N Optional
   - Per-doc status table (✅ current / ⚠️ gaps / ❌ missing)
   - Detailed gap list with severity, category, and recommended action
   - "New features available" table (what keel can now add that wasn't present at generation time)
   - On the migration path: the **Relocations** table (every addendum / status entry / gate the
     classifier will move, with its proposed destination) and the **Budgets** table — the user
     reviews the classification *before* anything is written, because that is the one step where
     a wrong call would misplace content.

2. **Ask permission to update** (use AskUserQuestion):
   - Feature upgrade: "Update all gaps (Critical + Important)" ← recommended / "Update Critical
     gaps only" / "Let me select which gaps to fix" / "Skip updates — I only wanted the report"
   - Format migration: "Migrate to format 2 (U0–U7, one reviewable commit per step)" ←
     recommended / "Feature gaps only, keep format 1 (surgical U4; ADR addenda and prose status
     stay as they are)" / "Skip — report only". State plainly that "keep format 1" leaves the
     project unable to use `/keel phase new`, `/keel change`, auto-archive, or the evidence table.

3. **If UI project and new skills are available but not installed** (separate AskUserQuestion):
   - "Install impeccable (FE quality, 23 lifecycle commands) + modern-web-guidance (search/retrieve/list)?"
   - Yes (recommended) / impeccable only / modern-web-guidance only / Skip
   - Either installed (now or before) → set up the design role ("Role owners"): hand the skills
     to a full-time design agent if one exists, else write the subagent.

4. **Security skill** — unless already installed or `securitySkill` is `"never"`: run the
   "Security skill" steps 2–3 (show source + sha, say it is a global install, ask). Yes → install,
   verify, then set up the security role per "Role owners". Skill already installed → just
   make sure the role has an owner.

   **Migrating keel 2.1 agent requests.** If `.keel/meta.json` `agents` holds an entry that 2.1
   wrote for an orchestrator request (anything but a `.claude/agents/` path; a bare path string
   just becomes `{ "type": "subagent", "path": … }`): if a full-time agent
   for that role now actually exists, record it as `type: "full-time"`; otherwise write the
   repo-local subagent and record `type: "subagent"`. Either way, also add AGENTS.md step 9, the
   CLAUDE.md "Review roles" line (replacing 2.1's "Permanent agents" table; both in the 2.6
   one-line form) and the evidence-prune script. Tell the user which it was.

   **Migrating to keel 2.3 (doc-sync loop + Report model)** — for any project on 2.2 or earlier:
   set up the `doc-sync` role owner ("Role owners": full-time doc agent if one exists, else
   `.claude/agents/doc-sync.md`); replace `.claude/workflows/doc-sync.js` verbatim; replace each
   non-✅ phase script's `Doc Sync` stage with the `await workflow({ scriptPath:
   '.claude/workflows/doc-sync.js' })` call from `phase-template.js` (and relax its Merge check to
   "a docs: sync commit follows the last code commit"); add the `## Report` section and the
   caller rule to existing `security.md` / `design.md` subagents (regenerate them if unedited);
   replace AGENTS.md workflow step 5 and add the Delegation pointer (2.6 one-line forms; the
   Delegation text goes to `.claude/workflows/README.md`); name doc-sync in CLAUDE.md "Review roles". Never touch a full-time agent's own
   definition without saying so; give the user the text instead if you can't edit it.

   **Slim keystone (keel 2.6)** — any 2.x project: run `references/keel-upgrade-guide.md`
   "Slim keystone and hooks (2.6)". For each long keystone section it shows where the text
   already lives, checks that home holds it word for word (or moves it there verbatim first),
   then offers the one-line pointer; the `keel-gates` Stop hook, the new modern-web-guidance hook
   and the plain-word subagent descriptions are separate offers. Never compress wording in place.

   **Area rules (keel 2.6)** — any 2.x project with ADRs: run `references/keel-upgrade-guide.md`
   "Area rules and ADR header (2.6)". Propose `.claude/rules/<area>.md` files built by reading the
   existing ADRs and NFRs (paths only where their text names one; ask for the rest), and the
   AGENTS.md "Area rules load by path" line. Existing ADR files are never given a header or edited;
   only ADRs written after the upgrade use the 2.6 template.

5. **Update-check hook** — if `.claude/hooks/keel-update-check.mjs` is absent, offer it (same
   wording as Phase 3's "Update-check hook").

6. **If Standing rules predate the goal-directed-tasks bullet** (separate AskUserQuestion — same
   options and defaults as the "Goal-directed task execution & exit strategy" question in the
   Delivery/Ops interview round):
   - "Bounded retries, then escalate" (recommended) / "Persistent until met" / "Escalate on first
     failure"

---

### Phase U4 — Update (feature upgrade path)

Apply only what the user approved. These rules are non-negotiable. *(On the format-migration
path, skip U4 and run U0–U7 below — they include every feature gap.)*

**Surgical-only edits.** Never rewrite an entire doc. Add missing sections, update outdated blocks,
append new features — preserve every word the user has written elsewhere in the doc.

**Per-doc update instructions:**

*AGENTS.md / CLAUDE.md* — if "Git & working workflow" section lacks workflow script references:
replace that section's steps with the workflow-first version from the current template. If Active
skills section is absent (UI project): append it to CLAUDE.md from the current template. If the
Hard invariants table lacks `Enforced by · Gap` columns: add the columns, filling `Enforced by`
from ENGINEERING_DESIGN / lint config and `Gap` as `[NEEDS DECISION]` where enforcement cannot be
located (never write "enforced" without a file:line). Never touch other sections.

*DEPLOYMENT.md* — if absent on an operated system: generate from `references/templates/DEPLOYMENT.md`,
seeding the environment matrix, deploy procedure, and rollback from whatever RUNBOOK/COMMANDS
already say and from deploy configs on disk (`fly.toml`, `deploy.sh`, `Dockerfile`, CI workflow
files, `terraform/`); leave `[NEEDS DECISION]` where the docs and the configs disagree — that
disagreement is a finding, not something to smooth over. Replace RUNBOOK's moved sections with
one pointer line each.

*CHANGELOG.md* — if absent: generate from `references/templates/CHANGELOG.md`, seeding entries
from `git log` (merge commits and `docs: sync` commits carry the phase/ADR references) with deploy
state `[merged]` unless a deploy log or RUNBOOK entry proves `[deployed vNN]` / `[live-verified]`.

*IMPLEMENTATION_PLAN.md* — if standing rules are the old 4-, 5- or 6-bullet version: replace the
entire standing rules block with the current 7-bullet version (adds *Claims carry evidence*),
filling the goal-directed-tasks bullet's exit strategy from the Phase U3 answer. If phase blocks
lack doc-sync exit gate or Workflow: line: add them per phase. If deferred items table is absent:
append it before *End of IMPLEMENTATION_PLAN.md*; if present without `Owner` / `Revisit trigger`
columns: add the columns (`[NEEDS DECISION]` where the Reason text doesn't say). If the
`## Changes` table is absent: append it (empty). If workflow scripts index is absent: append it;
if present, add the `change-template.js` row. Exit-gate bullets on a format-2 project are a
`FORMAT_MIGRATION` gap handled by U4 of the migration sequence, not here.

*DESIGN.md* — if §12 is absent: append §12 before *End of DESIGN.md* using the current full
lifecycle template. If §12 exists but has fewer than 15 command rows (old minimal version):
replace §12 entirely with the current comprehensive version. Never touch §1–§11.

*PRODUCT.md* — if absent in a UI project where skills integration was approved: generate it from
`references/templates/PRODUCT.md` using project context already known from DESIGN.md + PRD.md.

*Workflow scripts* — if .claude/workflows/ directory is absent or missing doc-sync.js:
copy `references/templates/workflows/doc-sync.js` and `change-template.js` verbatim. Generate
per-phase workflow scripts from `references/templates/workflows/phase-template.js` (one per
IMPLEMENTATION_PLAN phase that is not ✅), filling `{{GOAL_EXIT_STRATEGY_BLOCK}}` per the Phase U3
answer. If `doc-sync.js` exists but predates split-aware doc sync (no `doc-size.mjs --split` in it):
replace it verbatim — it carries no project-specific content. Copy
`references/templates/keel-doc-size.mjs` to `.keel/doc-size.mjs` and add `"defaultBudget": 32768`.

*Oversize docs* (if the split was approved in U3) — archive first where the doc has archivable
detail, then split per keel-archive-guide.md "Splitting an oversize doc", one commit per doc; run
`node .keel/doc-size.mjs` after each and fix any LINK ERROR before moving on. Use
`node .keel/doc-size.mjs --split <doc>` for the split itself (deterministic, verbatim, repoints
inbound anchor links); split by hand to the same shape only where it refuses.

*Split mechanics (2.4.3)* — replace `.keel/doc-size.mjs`, `doc-sync.js`, `change-template.js`
verbatim and patch phase scripts' status-table / deferred-row lines with the `--where` rule (above
"Phase Mode"). An earlier trial split (any version) is re-checked, not redone: `--split` on a doc
or part with nothing new refuses; a part still over budget is cut further with sub-parts
(`07` → `07a`, `07b`) that keep section order; a one-table part is cut by rows.

*Doc verdicts and waivers (2.4.2)* — replace `.keel/doc-size.mjs` and `doc-sync.js` verbatim (both
carry no project content). Move each `"budgetExceptions"` entry into `"waivers"` as
`{ "reason": <the old string>, "reviewed": <today> }` only after the user confirms it in U3 (show
the doc, size, budget and reason; options: keep waiver · archive/split instead), then delete
`budgetExceptions`. Idempotent: a doc already in `waivers` is not asked again unless its review is
due; a doc the checker already calls `ok`/`waived` gets no proposal; `--split` on an index with
nothing new refuses and changes nothing. Never propose splitting an `archive` or `manual` doc —
report `manual` ones with the checker's reason. Keystone over budget: propose moving named
sections to `docs/agents/` (conventions "Byte budgets"), never compressing.

*Split-aware roles (2.4.1)* — replace `.keel/doc-size.mjs` and `doc-sync.js` verbatim; add the
"Split docs — required, every edit" section to an existing `.claude/agents/doc-sync.md`
(regenerate it if unedited) and the "Editing docs" note to `security.md` / `design.md`; for a
full-time doc agent, give the user that section's text to add to its brief. Create `.keel/evidence/` if absent.

If phase scripts already exist:
- **Missing the `Verify` stage** (no `.keel/evidence/phase-N.json` written, Doc Sync re-runs
  suites itself): patch in the Verify stage from `phase-template.js` between Integrate and Doc
  Sync, and replace the Doc Sync prompt with the citing version. Only for phases not ✅.
- **Missing `/goal` only** (Setup/Integrate phases already present, task branches already merge
  into a phase branch): patch each task prompt in place — insert the `/goal` block and the
  matching exit-strategy block from `phase-template.js`; never rewrite the rest of the script's
  task-specific content.
- **Missing the phase-branch structure** (no `Setup` phase creating `phase-N-<slug>`, task
  branches merge straight to `main`, no `Integrate` step): this is a Critical, block-level gap —
  regenerate the whole script from the current `phase-template.js` (this single regeneration also
  covers the `/goal` gap above — fill `{{GOAL_EXIT_STRATEGY_BLOCK}}` per the Phase U3 answer same
  as fresh generation, do not additionally patch), re-inserting the existing `TASKS` array and any
  task-specific edits the old script had. Do not attempt a line-level patch;
  the branch topology changed (task worktree → phase branch → main, not task worktree → main).

*Skill installation* (if approved in Phase U3) — follow the "FE skill integration" steps from
the main keel Phase 3 generation. Check existing setup first; merge hooks into existing settings.json
rather than overwriting; update skills-lock.json. Security skill, role owners and the
update-check hook (if approved in U3): the "Security skill", "Role owners" and "Update-check
hook" steps from Phase 3. Workflow scripts whose Verify stage lacks the agents step: patch it in
from the current `phase-template.js` / `change-template.js` (non-✅ phases only).

**After all edits:** grep for any `{{PLACEHOLDER}}` introduced by the new content and fill them
from project context already established during this session. Report any that couldn't be filled.

**Update .keel/meta.json** — create or update this file to record the upgrade. `keelVersion` is
this SKILL.md's own `metadata.version` (the version actually running this upgrade) — never the
literal string "current":
```json
{
  "keelVersion": "{{INSTALLED_KEEL_VERSION, e.g. 2.0.0}}",
  "docFormat": 2,
  "adrLayout": "per-file",
  "budgets": { "AGENTS.md": 12288, "CLAUDE.md": 12288, "docs/IMPLEMENTATION_PLAN.md": 65536, "docs/adr/README.md": 16384 },
  "defaultBudget": 32768,
  "lastUpgraded": "{{ISO_DATE}}",
  "documentsGenerated": ["list of all docs present after upgrade"],
  "skillsInstalled": ["impeccable", "modern-web-guidance", "security-audit"],
  "agents": { "doc-sync": { "type": "subagent", "path": ".claude/agents/doc-sync.md" },
              "security": { "type": "subagent", "path": ".claude/agents/security.md" } },
  "evidenceRetention": { "keepRunsPerBranch": 3, "pruneMergedAfterDays": 30 },
  "upgradedGaps": ["list of gap IDs fixed"]
}
```
On the feature path `docFormat` stays `2` (it already was); `budgets` is added if absent.

---

### Format Migration sequence — U0–U7 (format 1 → 2)

Runs *instead of* U4 when the user approved migration in U3. Everything here is governed by four
rules that override any convenience:

- **IDs never change.** `ADR-065` stays `ADR-065` (now `docs/adr/ADR-065-<slug>.md`); phase
  numbers, `REQ`/`NFR`/`THR` IDs, deferred rows keep their identity.
- **Relocate, never delete.** Every sentence that leaves a doc lands somewhere citable, quoted
  verbatim, with its source (`ADR-065 Addendum 3`, `CLAUDE.md status 2026-09-13`) recorded next
  to it. Paraphrase only in the *new* structured cell that summarises it — the original text
  survives in the destination.
- **Unclassifiable → `Unclassified (review)`.** If the classifier cannot place a block with
  confidence, it stays in the ADR (or keystone) under an `Unclassified (review)` row/heading
  rather than being guessed into a destination.
- **One commit per step**, on a branch `keel-upgrade-2.0` off `main`, so each step is reviewable
  and revertable alone. Nothing merges to `main` inside this mode; hand the branch to the user.

Reference for the per-doc mechanics and the classifier rubric: `references/keel-upgrade-guide.md`
"Format migration".

**U0 — Archive first.** Run Archive Mode (X1–X4) non-interactively with "everything eligible"
*before* touching format, so U2/U3 operate on the light docs (a 200KB keystone with 76 status
entries is mostly archive, not migration). Commit: `docs(keel-2.0): U0 archive before migration`.

**U1 — Audit.** Already done (Phases U1–U3 above). Re-read the Relocations table the user
approved; it is the work order for U2.

**U2 — Extract & classify.** For every `### Addendum` (and `### Build confirmation`) in `ADR.md`,
every multi-line entry in the keystone's status section, every inline `>` callout in
IMPLEMENTATION_PLAN phase blocks, and every "client feedback round" reference, apply the
classifier rubric (`keel-upgrade-guide.md`): `decision-deviation` → the ADR's `Build deviation`
row · `deploy-state` → `DEPLOYMENT.md` deploy log row + `CHANGELOG.md` entry with the state the
text actually claims · `incident` → `RUNBOOK.md` `## Postmortems` row (`PM-xxx`) with the
narrative verbatim beneath it · `client-round` → `FEEDBACK_ROUNDS.md` `FR-xx` row · else
`Unclassified (review)`. Write destinations first (creating DEPLOYMENT / CHANGELOG / RUNBOOK
Postmortems / FEEDBACK_ROUNDS from templates as needed, seeded as in U4's per-doc rules), then
remove the source block, leaving `→ relocated: <destination>#<anchor>` in its place. Commit:
`docs(keel-2.0): U2 relocate N addenda / M status entries → DEPLOYMENT, CHANGELOG, RUNBOOK, FEEDBACK_ROUNDS`.

**U3 — Reformat ADRs.** Split `ADR.md` into `docs/adr/ADR-NNN-<slug>.md` files in the table
shape of `references/templates/adr/ADR-NNN-slug.md`. Context is capped at two sentences **only
because** U2 already relocated the narrative — if an ADR still carries unrelocated prose, keep it
under `Unclassified (review)` rather than cutting it. Options tables gain the ✓/✗ column from the
existing Decision text; `Deciders` is tagged from the text (`founder decision` → `founder`;
otherwise `engineering`; legal review → `legal`); Status carries the lifecycle with the commits
the text cites. `ADR.md` becomes a pointer index (title, one line, link per ADR) or is replaced
by `docs/adr/README.md` — keep `ADR.md` as a stub redirect so old links resolve. For large
files (> ~30 ADRs) fan out ~20 ADRs per worktree agent in parallel, each writing only its own
files; the index is written once after they return. Commit: `docs(keel-2.0): U3 ADR.md → docs/adr/ (N files, table format)`.

**U4 — Reformat plan & keystone.** IMPLEMENTATION_PLAN exit gates → the evidence table, with
`Evidence level` set to **what the prose actually claimed** ("code-level only" → `code-read`;
"tests green" → `unit`/`integration`; "browser-verified locally" → `local-browser`;
"live-verified in production" → `prod-live`) and `Artefact` = the commit/hash the text cites or
`[NEEDS DECISION]` if none — **never upgrade a claim during migration.** Add `Deploy state` to
the status table from CHANGELOG (U2). Deferred rows gain `Owner` / `Revisit trigger` (from the
Reason text; `[NEEDS DECISION]` if absent). Add the empty `## Changes` table. Keystone: status
→ two-row table pointing at CHANGELOG; invariants → `Rule · Enforced by · Gap · Source`, with
existing "enforcement-gap" notes landing in `Gap`; a pre-PR checklist derived from the
invariants. Commit: `docs(keel-2.0): U4 evidence tables, keystone tables`.

**U5 — Keystone pair & new docs.** Rename the canonical file to `AGENTS.md` (if a hand-copied
AGENTS.md exists, diff the two: the *newer* content wins per section, and the diff is listed in
the report); write `CLAUDE.md` as `@AGENTS.md` + Claude-only sections. Generate any of
DEPLOYMENT / CHANGELOG / FEEDBACK_ROUNDS / keel-transcript not already created in U2 (transcript
only if the original interview is recoverable from the docs or the user supplies it — never
fabricate one). Commit: `docs(keel-2.0): U5 AGENTS.md canonical, CLAUDE.md import, new docs`.

**U6 — Scripts.** Replace `doc-sync.js`; add `change-template.js`; patch every non-✅ phase
script with the Verify stage + ADR reservation; create `.keel/evidence/`. ✅ phases' scripts are
left untouched (they are history). Commit: `docs(keel-2.0): U6 workflow scripts`. Then apply
whatever U3 approved for skills, the security skill, role owners and the update-check hook
(U4 "Skill installation" — same steps).

**U7 — Meta & report.** Write `.keel/meta.json` with `docFormat: 2`, `adrLayout: "per-file"`,
`budgets` (defaults unless the user set them in U3), `lastUpgraded`, `upgradedGaps`, and
`migration: { from: 1, to: 2, date, relocations: N }`. Write `UPGRADE_REPORT.md` with the full
Relocations table (source → classification → destination → verbatim ✓) and the Budgets table
(before / after). Run the Phase 5 consistency pass, then `node .keel/doc-size.mjs` (split
anything still over, as in U4 "Oversize docs") and report.
Commit: `docs(keel-2.0): U7 meta.json docFormat 2 + upgrade report`. Hand the branch to the user
with the review order: U2's relocations first, then U4's `Evidence level` column — those two are
the honesty-bearing steps.

---

### Phase U5 — Codebase Audit

After docs are updated (or even if the user skipped updates), generate a codebase audit.

1. **Build the audit checklist** from the updated docs:

   *From IMPLEMENTATION_PLAN.md phases:*
   For each phase marked ✅ (complete), generate: "Phase N — {{name}}: is every scope item implemented?
   Read [relevant source dirs]. Check each item: [scope list]."

   *From ENGINEERING_DESIGN.md non-negotiables:*
   "For each non-negotiable rule, find where it is enforced in the codebase. Flag any that have
   no enforcement."

   *From `docs/adr/` (or legacy ADR.md):*
   "ADR-NNN: {{decision}}. Does the codebase reflect this? Where? If not, is the deviation
   recorded in the ADR's `Build deviation` row?"

   *From the keystone's Hard invariants `Enforced by` column:*
   "Does the named file:line / lint rule / test actually exist and fire? Any row whose
   enforcement cannot be found gets `Gap` filled — never leave `Enforced by` pointing at nothing."

   *From NFR.md:*
   "NFR target: {{requirement}} at {{target}}. Is this met? What evidence?"

   *For UI projects:*
   "/impeccable audit {{UI_PATH}} — are there any P0 or P1 findings?"
   "npx -y modern-web-guidance@latest list — are any patterns in the codebase that have native
   alternatives now available?"

2. **Ask the user** (AskUserQuestion):
   - "Run the codebase audit now" — execute inline, reading source files and checking each requirement
   - "Save as CODEBASE_AUDIT.md for later" — write checklist file; user works through it manually
   - "Skip codebase audit for now"

3. If running now: execute the audit systematically, reporting findings per category.
   If saving: write CODEBASE_AUDIT.md with all checklist items, current date, and instructions.
