# Changelog

All notable changes to Keel are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [2.5.2] — 2026-10-31

The release feed now lists install methods per tool, so a site can show one tab per tool.

### Added
- **release.json `install.tools`**: one entry per tool keel is documented and tested in, with how to
  start it, a docs page, and each install method's commands (terminal or in-tool). Today that is
  Claude Code only, with three methods: plugin, personal skill and project skill. Codex and
  Antigravity are not listed: keel has not been tested in them, and phase scripts rely on Claude Code
  features (the Workflow tool, `.claude/agents` subagents, `/goal`). Additive within schema v1.

## [2.5.1] — 2026-10-31

The docs now have a Markdown source, `docs/site/*.md`, for the new keel.thelogicatelier.com site.

### Added
- **docs/site/*.md**: the 18 docs pages as GitHub-flavoured Markdown with frontmatter (title, lead,
  group, order, slug, anchor). Converted by script from `docs/index.html` at 2.5.0, wording
  unchanged. Format spec: `docs/site/README.md`. The GitHub Pages site stays as is until cutover.

### Changed
- **Release hook** (disabled) now triggers the site's deploy workflow with workflow_dispatch, which
  needs only an Actions-scoped token.
- **README** no longer calls the repo private or asks readers to log in; it is public (MIT).

## [2.5.0] — 2026-10-31

Every release now publishes machine-readable release notes, generated from this changelog so they cannot drift.

### Added
- **release.json** at the repo root: version, date, summary, highlights, tag and compare URLs,
  install and update commands, minimum requirements, and every version with its notes in Markdown.
  Format: `schemas/release-v1.schema.json` (schema version 1; additive changes only).
- **RELEASE.md**: the latest release notes for people.
- **`scripts/release.mjs`** regenerates both from CHANGELOG.md; `--check` fails if either is stale or
  any of the six version stamps differs from the changelog; `--self-test` covers the parser, URLs and drift.
- **Release workflow** (`.github/workflows/release.yml`): runs the self-test and the check on every
  push, pull request and `keel--v*` tag, and checks the tag matches the version. A
  repository_dispatch to the TLA-owned site is written but commented out until the founder enables it.
- **Release convention** in CLAUDE.md: bump, changelog, regenerate, check, merge, tag, push.

## [2.4.3] — 2026-10-31

Closes the remaining items of the cortextOS 2.4.1 upgrade report (12 issues; 1–4 were fixed in 2.4.2).

### Fixed
- **Redirect stubs and the ADR directory are never split parents** (`# ADR.md → moved`, even with a
  `## Parts` heading), on top of 2.4.2's `## Parts` rule. (issue 1)
- **Nested split docs are checked**: any `docs/**.md` with a `## Parts` heading and a sibling folder
  (`docs/adr/README.md` → `docs/adr/readme/`); nested docs are measured, each file once. (2, 9)
- **`--split` recurses in one run** — cutting at `##` down to `######` — until every new part and
  the cut part's remainder fit. (6)
- **Section order kept**: a cut part's pieces become sub-parts named after it (`02` → `02a`, `02b`),
  listed right after it in the Parts table. (6)
- **A single table over budget splits by rows** (header repeated, new rows go to the last part). (5)
- **ADR files are never rewritten**: link repointing skips them; the index lists moved anchors under
  "Moved sections". The rule is stated in conventions, doc-sync and every mode. (7)
- **Backticked `` `docs/NAME.md#anchor` `` pointers are repointed** like markdown links. (8)
- **Writers are split-aware**: `--where <doc> "<section>"` prints the file holding a section;
  change-template, phase-template, doc-sync and the phase / change / closeout / archive / upgrade
  modes write there, never into an index. (10)
- **Keystone headroom**: `--move-out AGENTS.md "<section>"` moves a whole section to
  `docs/agents/NN-<slug>.md` (linked both ways). Upgrade checks headroom before adding keystone
  text and proposes a move-out, never compression. (11)
- **`/keel upgrade` installs `.keel/doc-size.mjs` first, from any version.** (12)

### Tested
- Self-test fixtures for each issue. On a scratch clone of cortextOS `2c5e5a8`: exit 0, 27 files
  each measured once, 0 link errors. Four docs split in one pass each with nothing left over budget
  and `docs/adr/` untouched. With the plan's waiver removed, the plan splits too: the 71 KB deferred
  table is cut by rows, and `--where` finds the right part.

## [2.4.2] — 2026-10-31

Fixes the conflicts a real `/keel upgrade` to 2.4.1 hit on a large project (cortextOS), generically.

### Changed
- **`doc-size.mjs` gives one verdict per doc** — `ok` / `waived` / `archive` / `split` / `manual`,
  each with its reason. doc-sync acts on `archive` and `split` only; `manual` is reported.
- **Archives are never budgeted or split** (`*ARCHIVE*`, `LEGACY_*`, `archive/`, meta `"archives"`);
  `--split` refuses them.
- **A folder beside a doc is a split only if the doc has a `## Parts` heading** — `docs/ADR.md`
  next to `docs/adr/` no longer produced 260 false link errors or measured ADR files as parts.
- **ADR index budget scales with the ADR count** (320 B per `ADR-*.md`); over that → `manual`.
- **Keystone over budget**: archive, then move whole sections out to `docs/agents/NN-<slug>.md`
  behind a `## Parts` table (checked both ways) — never compress wording. "tight" note under 2% headroom.
- **Archive-then-split** is now two verdicts: `archive`, then `split` only on the re-check after
  archiving (`--after-archive`).
- **Generated files and docs without headings** → `manual` instead of a split that fails or is overwritten.
- **Link check** reads reference-style links, angle-bracket links and repo-absolute `/docs/x.md`.
- **`--split` is idempotent**: on an index with nothing new it refuses and changes nothing; new
  sections written into an index move out and append rows to the existing Parts table.

### Added
- **Waivers** in `.keel/meta.json` — `"waivers": {"<doc>": {"reason", "reviewed", "max"?}}`,
  "review due" after `waiverReviewDays` (90). Only the user grants one. Legacy `budgetExceptions`
  are read as unreviewed waivers; `/keel upgrade` moves them after asking.
- Self-test fixtures for every case above (archive, ADR folder + index, legacy and current waivers,
  waiver `max`, generated, no headings, reference/absolute links, tight and over-budget keystone,
  keystone parts, repeat split, new section in an index).

## [2.4.1] — 2026-10-31

### Added
- **`node .keel/doc-size.mjs --split <doc>`** — deterministic split per the 2.4.0 rule: a plain
  doc's `## ` sections move verbatim to `docs/<name>/NN-<slug>.md` (small neighbours merged,
  headings inside code fences ignored) and the parent becomes an index with a Parts table; an
  oversize part keeps its first chunk and moves the rest to new parts added to the index; inbound
  `NAME.md#anchor` links are repointed. Refuses the keystone. The self-test appends to an
  over-limit doc and asserts the split, the links both ways, the repointed link, a second split
  of a grown part, and a clean check afterwards.

### Changed
- **Split-aware doc sync.** `SYNC_RULES` and `.claude/agents/doc-sync.md` now require: write into
  the right part of a split doc, never the index; a part about to breach gets a new part (linked
  both ways) or `--split`; a plain doc an edit would push over budget is split, not piled on. The
  caller's review round checks index-stays-index, links both ways and no breach. The size/link
  check is the last step before the doc-sync commit (no commit with a link error). The Split
  stage runs `--split` first. Security/design subagents follow the same rules if they edit a doc.
- Docs site: split layout covered on Roles, Version (Budgets row), Archive (tool + writing to a
  split doc), "Where things live" and the catalog; badge 2.4.1.

## [2.4.0] — 2026-10-31

### Added
- **Auto-split oversize docs.** A doc over its budget is no longer just reported. Archivable docs
  (IMPLEMENTATION_PLAN, CHANGELOG, RUNBOOK, DEPLOYMENT, ADR index) relocate closed detail first;
  anything still over is split into a sibling folder (`docs/DESIGN.md` → `docs/design/NN-<slug>.md`,
  one part per top-level section, content verbatim, IDs unchanged). The parent becomes a slim index
  whose Parts table links every part; each part links back; inbound anchor links are repointed.
  The keystone (AGENTS.md, CLAUDE.md) is never split — archive only, else `BUDGET_EXCEEDED`.
- **`keel-doc-size.mjs`** (`.keel/doc-size.mjs` in projects): measures every doc once — a split
  doc's index and each part separately against the parent's budget, family total reported, no
  double-counting — names the action per breach, and **fails** (exit 1) when a part is not linked
  from its parent or has no link back. `--self-test` included.
- `defaultBudget` (32 KB) in `.keel/meta.json` for every doc not listed in `budgets`.

### Changed
- `doc-sync.js`: Budget stage runs the script; Archive only for archivable docs; new **Split**
  stage for whatever is still over; a split-link error throws, so the merge after doc-sync stops.
- Generation (Phase 5) splits any doc generated over budget; `/keel version` reports families and
  link errors; `/keel upgrade` proposes the split (parts table) as `BUDGET_EXCEEDED` and applies it
  in U4 only on approval; `/keel archive` offers the split when archiving cannot get a doc under.
- Split mechanics: `keel-archive-guide.md` "Splitting an oversize doc"; conventions "Byte budgets,
  auto-archive & auto-split". Docs site Archive and Upgrade pages updated.

## [2.3.0] — 2026-10-31

### Added
- **Doc-sync role and loop.** Every project gets a `doc-sync` owner: the full-time doc/architect
  agent if one exists (no subagent written), else the repo-local subagent
  `.claude/agents/doc-sync.md`. After each piece of work and before its commit, the caller
  delegates doc sync, reviews the returned Report against `git log` / `git diff main` / the evidence
  record, and sends specific gaps back. **Hard cap: 3 rounds**; remaining gaps become Deferred items
  rows (`Doc sync incomplete: …`) and the caller proceeds and commits. AGENTS.md workflow step 5 and
  a Pre-PR line carry the rule.
- **Report-back delegation model.** AGENTS.md "Delegation": the agent doing the work is the caller
  and supervises its role subagents. The doc-sync, security and design templates end with a fixed
  `## Report` block (role · caller · scope · status · changed · checked · findings · evidence · not
  verified · needs from caller). Subagents never commit, push or message anyone but their caller;
  a caller with its own supervisor keeps reporting upward as before.

### Changed
- `doc-sync.js` holds the doc rules once (`SYNC_RULES`); its Sync stage is the delegate → review →
  feedback loop, then one commit. The phase template's Doc Sync stage now calls `doc-sync.js`
  instead of carrying a second copy of the rules (so phase close-out also gets budget, archive and
  prune). Merge checks accept archive/prune commits after the `docs: sync` commit.
- `/keel upgrade`: "Migrating to keel 2.3" sets up the doc-sync role, replaces `doc-sync.js` and
  non-✅ phase Doc Sync stages, adds the Report block to existing subagents, AGENTS.md step 5 +
  Delegation + Pre-PR line, and the CLAUDE.md row.
- Docs site fully updated for 2.1–2.3.

## [2.2.0] — 2026-10-31

### Changed
- **Review roles are repo-local subagents, not hired agents.** Keel no longer asks an orchestrator
  to create an agent (an orchestrator cannot create lasting agents; one-shot temps are never
  auto-invoked). If the project already has a full-time agent for the role (security/QA, design),
  that agent is handed the skill and recorded in `.keel/meta.json` `agents` as `type: "full-time"`;
  no subagent is written. Otherwise keel writes `.claude/agents/security.md` / `design.md` and
  records `type: "subagent"`.
- Subagent descriptions now say *MUST BE USED PROACTIVELY* after any task that changed code.
- CLAUDE.md template: "Permanent agents" table → "Review subagents" (role · owner · skill · when).

### Added
- **AGENTS.md workflow step 9 "Review before done"** + Pre-PR line: after any feature, refactor,
  bug fix or dependency bump, run the security reviewer on the branch diff before reporting done;
  UI work also runs the design reviewer. Verify stages still call both.
- **Evidence retention** (conventions "Evidence retention"): review runs live in
  `.keel/evidence/<role>/<branch>/<run>/`; keep the newest 3 per branch, prune a merged/deleted
  branch's runs after 30 days (`evidenceRetention` in meta.json); never delete gate records,
  `phase-N/`/`chg-xxx/` artefacts or the security `ledger/`. Script
  `templates/keel-evidence-prune.mjs` (dry run by default, `--self-test`). Owner: the doc/architect
  agent at phase close-out (phase Doc Sync step 10), else whoever runs doc-sync on merge (new
  `Prune` stage).
- **`/keel upgrade` migrates 2.1 agent requests**: an `agents` entry recorded as an orchestrator
  request becomes the full-time agent (if one really exists) or the repo-local subagent, plus step 9,
  the Pre-PR line and the prune script.

Unchanged from 2.1.0: ask-first security-skill install with source + sha shown (Yes / Not now /
Never), update check.

## [2.1.0] — 2026-10-31

### Added
- **Security skill offer.** New projects (Security round) and `/keel upgrade` (U3) offer Cloudflare's
  `security-audit` skill: `npx skills add https://github.com/cloudflare/security-audit-skill --skill
  security-audit --global`. Always asked first, with the source repo and commit sha shown and the
  global, third-party scope stated; "Not now" is re-asked on the next upgrade, "Never" is recorded
  (`securitySkill` in `.keel/meta.json`). Recorded in `skills-lock.json` with its ref.
- **Permanent agents.** Each installed skill gets one owner: a `security` agent (audits each
  branch's diff after dev work; a confirmed high/critical finding is an unmet gate) and a `design`
  agent (impeccable + modern-web-guidance). An existing agent for the role is handed the skill;
  otherwise keel asks the agent orchestrator to create one, or writes `.claude/agents/<role>.md`
  from `templates/agents/`. The phase and change Verify stages call them when `.keel/meta.json`
  `agents` lists them; evidence records gain a `security` block.
- **Update check.** Every invocation compares `.keel/meta.json` `keelVersion` with the installed
  skill (offline) and, best-effort once per session, with the published `plugin.json`; prints at
  most one line. Read-only, no telemetry beyond that one GET. Skip with `KEEL_NO_UPDATE_CHECK=1`
  or `"updateCheck": false`. Opt-in SessionStart hook `templates/keel-update-check.mjs` does the
  same at session start (`--self-test` checks its version compare).

## [2.0.0] — 2026-09-20

Shaped by a retrospective across four keel-documented production projects (mysha, interview-strategist,
ospraye, cortextOS — ~1,800 commits, ~600 doc-touching). The pattern in every one: docs stayed
trustworthy only when every claim carried evidence, and stayed readable only when the journal lived
somewhere other than the keystone. **Breaking:** doc format 2 — existing projects migrate via
`/keel upgrade` (FORMAT_MIGRATION).

### Added
- **Evidence ladder** (`code-read < unit < integration < local-browser < staging < prod-live`). Every
  ✅ carries a level + artefact. Exit gates are tables (`Gate · Evidence level · Artefact · Verified
  by · Status`); a gate whose evidence falls short of its wording is `partial` and the phase stays
  open. Standing rule 7: *claims carry evidence*.
- **Deploy-state ladder** (`on-branch → merged → deployed vNN → live-verified`) with one home:
  `CHANGELOG.md` + `DEPLOYMENT.md` deploy log. Flipped by the Merge step and the deploy procedure,
  never by prose — kills the "flip pre-merge language" commits.
- **Verify stage** in `phase-template.js` between Integrate and Doc Sync: runs every suite once,
  records skipped tests by name, and writes `.keel/evidence/phase-N.json`; doc-sync cites it and
  never re-runs. `prod-live` cannot be written by scripts, only by a deploy.
- **ADR reservation at scope**: the phase script's Setup reserves `ADR-NNN` stubs so parallel
  worktrees never collide on numbers; migrations are timestamp-named.
- **Two work units**: `/keel phase new <slug> [--after N | --split N]` (gated milestone, fractional
  numbering rules) and `/keel change <slug>` (hotfix-weight: `chg/` branch, `CHG-xxx` row,
  CHANGELOG line, `change-template.js`, no phase block). `/keel closeout` generates a deferred-items
  sweep phase past a threshold.
- **Byte budgets + auto-archive**: `.keel/meta.json` `budgets` (keystone 12 KB default); doc-sync's
  deterministic Budget step measures every living doc and runs the archive per breached file, one
  commit each; reports `BUDGET_EXCEEDED` and stops rather than loop.
- **New templates**: `DEPLOYMENT.md` (env matrix, promotion path, build-time vs runtime config,
  pre/post-deploy checklists, rollback, deploy log, gotchas — one doc for all environments),
  `CHANGELOG.md`, `SPIKE.md`, `COST_ANALYSIS.md`, `AUDIT.md`, `FEEDBACK_ROUNDS.md`,
  `keel-meta.json`; `docs/keel-transcript.md` is now a standard output.
- **Decider tags** (`founder` / `engineering` / `legal`) on ADRs and open decisions; open decisions
  are one row per *question* with a Locations column.
- `/keel version` reports doc format and per-file size vs budget.

### Changed
- **ADRs are per-file and table-based** (`docs/adr/ADR-NNN-slug.md`, index + open decisions in
  `docs/adr/README.md`): header table, ≤2-sentence context, Y-statement decision, options with ✓/✗,
  consequences incl. a single `Build deviation` row. Lifecycle `Proposed → Accepted → Built →
  Superseded`. **Addenda abolished** — incidents go to RUNBOOK postmortems, deploy status to the
  deploy log.
- **AGENTS.md is the canonical keystone**; `CLAUDE.md` is `@AGENTS.md` + Claude-only sections.
  Status is a two-row table; hard invariants are `Rule · Enforced by · Gap · Source`; a pre-PR
  checklist is derived from them.
- `RUNBOOK.md`: environments/deploy/rollback moved to DEPLOYMENT; playbooks are `Symptom · Check ·
  Fix · Escalate` tables; new Postmortems register (`PM-xxx`).
- `COMMANDS.md`: deployment section is commands-only; new seed/test-data and local↔remote data
  reconciliation sections; env-var table gains a build-time/runtime `Kind` column.
- `ENGINEERING_DESIGN.md` non-negotiables gain `Enforced by · Exception path · Gap` columns.
- Deferred items gain `Owner · Revisit trigger`; phase-status table gains `Deploy state`.
- `/keel upgrade`: format-1 detection, `FORMAT_MIGRATION` + `BUDGET_EXCEEDED` gap classes, and the
  U0–U7 migration sequence (archive first; classify addenda/status prose with verbatim relocation;
  parallel ADR reformat; evidence levels set to what the prose actually claimed; DEPLOYMENT seeded
  from disk, CHANGELOG from git log; `UPGRADE_REPORT.md` lists every relocation).
- `/keel archive`: categories renamed/added — `KEYSTONE_DRIFT`, `CHANGE_MERGED`,
  `CHANGELOG_OVERFLOW`, `POSTMORTEM_CLOSED`; DEPLOYMENT env matrix and evidence files are never
  archived.
- Delivery/Ops interview round asks about environments, promotion path, build-vs-runtime config,
  deploy authority, and live-verification checks.

### Fixed
- Docs site: `#version` and `#archive` sidebar links were not registered in the section router and
  fell through to the default section.

### Removed
- `references/templates/ADR.md` (single-file ADR template) — replaced by `templates/adr/`.

## [1.3.0] — 2026-08-12

### Added
- `/keel version`: a read-only mode that reports the installed keel skill version (read from
  `SKILL.md`'s own frontmatter — always accurate, no I/O), the version that last touched the
  current project's docs (`.keel/meta.json`), and flags when the project is behind the installed
  skill. Best-effort checks the latest published version on GitHub when a fetch tool is available
  and surfaces the exact update path if newer; degrades silently (never blocks) when it can't.
- `.keel/meta.json` is now written at initial generation (Phase 5), not only on first
  `/keel upgrade` or `/keel archive` — every new keel project has version tracking from day one.

### Fixed
- `.keel/meta.json`'s `keelVersion` field was being written as the literal string `"current"`
  instead of the actual installed version — meaningless for any version comparison, including the
  one `/keel version` now depends on. Now sourced from `SKILL.md`'s `metadata.version`.

## [1.2.0] — 2026-08-12

### Added
- `/keel archive`: a new on-demand mode that trims `CLAUDE.md`, `IMPLEMENTATION_PLAN.md`, and
  `ADR.md` for long-running projects by relocating finished or superseded detail — completed phase
  write-ups, resolved deferred items, superseded ADR bodies — into a new `PHASE_ARCHIVE.md`.
  Nothing is deleted: every archived block keeps its full original content plus a link back from a
  one-line summary left in place, since archived work has a real chance of being revisited. Scoped
  to the `CLAUDE.md` keystone-index target (~70–120 lines) and the living-doc conventions already
  in place; IDs (`Phase N`, `ADR-xxx`) never move. Gated behind a report + `AskUserQuestion`
  permission step, same as `/keel upgrade`. New references: `keel-archive-guide.md` (candidate
  categories, the never-archive list, per-category before/after mechanics),
  `templates/PHASE_ARCHIVE.md`, `templates/ARCHIVE_REPORT.md`.

## [1.1.0] — 2026-07-09

Existing projects pick these up via `/keel upgrade` — Phase U2's audit detects each gap below
(missing `/goal`, pre-phase-branch scripts, uninstalled skill files) and Phase U3 asks permission
before applying.

### Added
- Goal-directed task execution: every worktree agent in a generated `phase-N-<slug>.js` script now
  opens its task with `/goal`, a completion condition (implementation, tests, lint, `verify`
  end-to-end check, and a manual `claude-in-chrome` pass for UI work) that blocks it from ending
  its turn early. The Delivery/Ops interview round now asks how to handle a goal that isn't being
  met — bounded retries then escalate (default), persistent until met, or escalate on first
  failure — and bakes the choice into IMPLEMENTATION_PLAN's Standing rules and every phase script.
- Phase workflow scripts now branch per phase, not per task: a `Setup` step creates/checks out a
  `phase-N-<slug>` integration branch off `main`, task worktrees branch off that (not `main`), an
  `Integrate` step merges each task branch back into it, doc-sync commits land on it, and only
  then does the final `Merge` step put the phase branch — code plus doc-sync, as one unit — into
  `main`. Previously task branches merged straight to `main`, which is what IMPLEMENTATION_PLAN's
  Standing rules already described but the generated script never actually did.

### Fixed
- FE skill integration (Phase 3 / Upgrade U4) previously wrote impeccable and modern-web-guidance
  hook/lockfile config without ever installing the underlying skill files, leaving hooks wired to
  scripts that didn't exist. Now runs the real installers (`npx impeccable skills install`, `npx
  skills add GoogleChrome/modern-web-guidance`) and verifies the files landed before writing any
  downstream config.
- impeccable's hook is no longer hand-written into the shared `.claude/settings.json`; it's
  activated via `/impeccable hooks on`, which owns the gitignored `.claude/settings.local.json`
  per impeccable's own convention. Keel's `settings.json` template now carries only the
  modern-web-guidance hook.
- `skills-lock.json` records the actually-installed version instead of a hardcoded `"latest"`.
- keel-upgrade-guide.md's MISSING_SKILL checks now look for `scripts/hook.mjs` (not just a stub
  `SKILL.md`) and no longer flag impeccable's absence from `settings.json` as a gap.

## [1.0.0] — 2026-06-26

First stable release. Docs site accessibility and quality audit pass.

### Fixed
- Contrast failures: nav-group-label (#475569 → #7a8fa3, 2.45:1 → 5.23:1) and dir-tree code comments (#64748b → #94a3b8, 2.70:1 → 6.7:1 on dark bg)
- Hamburger `aria-expanded` now toggled on the controlling button, not the sidebar nav element
- All 13 content sections get `aria-labelledby` + matching h1 `id` attributes
- Nav group labels get `role="heading" aria-level="2"` for screen reader structure
- First section has `active` class in HTML — content no longer blank without JavaScript
- Callout side-stripe (`border-left: 3px`) replaced with full `border: 1px solid` (absolute ban)
- Removed duplicate Google Fonts `@import` (font already loaded via `<link>` in HTML)
- Active nav border-left reduced from 2px to 1px; font-weight bumped to 600

### Added
- `prefers-color-scheme: dark` support for the content area
- Design tokens: `--sidebar-label`, `--code-comment`, `--surface-light`, `--ink-bright`, `--success`
- Remaining hard-coded hex values (#f8fafc, #f1f5f9, #4ade80) replaced with tokens

## [0.2.0] — 2026-06-15

Improvements distilled from the first real Keel run (the Ospraye interview). Each change addresses
a specific observation from that session.

### Changed
- **Load references, don't work from memory.** SKILL.md now instructs reading the `references/`
  files (persona banks, catalog, conventions) with the Read tool at each phase, with a fallback to
  locate the skill directory by filename if a relative path doesn't resolve.
- **Confirm the ambition tier** with `AskUserQuestion` instead of asserting it (it scopes the suite).
- **Named rounds, not inferred.** Designer and Delivery/Ops must each run as their own announced
  round; the Designer brand/experience question moves to the *front* of that round.
- **Deeper Security/Compliance:** added data-residency / cross-border-transfer probing, recordings
  & biometrics, and the specific-regime prompt (GDPR / UK-GDPR / UAE-KSA PDPL / CCPA / HIPAA …).
- **Product Manager opens with "where does the data/supply come from on day 1?"** plus an explicit
  adoption-friction question (the MVP-fails-on-human-laziness check).
- **Riskiest-assumption question reframed** to offer 2–3 candidate assumptions via `AskUserQuestion`
  rather than asking cold (which yields "not sure").
- New interview rules: **recommend inline** rather than punting, and **stress-test against real-world
  constraints** (platform ToS/API limits, adoption friction, data-flow feasibility) early.
- COMPLIANCE template gains a **Data residency & cross-border transfer** section.

## [0.1.0] — 2026-06-14

Initial release.

### Added
- `keel` skill: a multi-persona interview → adaptive documentation generator for greenfield
  software projects.
- Orchestrator (`SKILL.md`) defining the four-phase workflow: intake → multi-persona interview →
  adaptive doc-set proposal → generation & handoff.
- Reference library: `interview-personas.md` (six-persona panel + question banks),
  `document-catalog.md` (adaptive selection + dependency order), `conventions.md` (house style, ID
  schemes, cross-reference syntax, immutability rules), `almanac-guide.md`.
- 18 reusable document templates (BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, HLD, LLD, ADR, NFR,
  DESIGN, COMPLIANCE, THREAT_MODEL, CONNECTOR_SPEC, IMPLEMENTATION_PLAN, COMMANDS, RUNBOOK,
  CLAUDE.md, docs/README, almanac/README).
- **Ways-of-working interview + generation:** the Delivery/Ops round always covers git-from-commit-
  one, branch-per-feature, parallel agents in isolated `git worktree`s, and per-chunk/phase doc
  sync; these answers populate the git/working-workflow in the generated `CLAUDE.md` and the
  `IMPLEMENTATION_PLAN` standing rules.
- **Threat-model & harden pass (Phase 4, opt-in):** adversarially threat-models the generated docs
  and fixes weaknesses *directly in the spec* (controls, `NFR-SEC`, ADRs, exit gates), recording
  threats in `THREAT_MODEL.md`/risk register only for traceability — never as a substitute for the
  fix.
- Claude Code plugin packaging (`plugin.json`) and marketplace manifest (`marketplace.json`) for
  first-class `/plugin install`.
