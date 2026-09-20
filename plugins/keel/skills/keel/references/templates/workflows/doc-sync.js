// Keel doc-sync workflow (doc format 2)
// Copy verbatim to .claude/workflows/doc-sync.js.
// Run: claude --workflow .claude/workflows/doc-sync.js   (or via the Workflow tool)
//
// Used standalone for Changes (hotfixes) and by hand; phase scripts embed the same rules in
// their own Doc Sync step. Stages: Sync → Budget → (Archive, only if a budget is breached).
// Sync writes tables, not prose, and every claim carries an evidence level + artefact.
// Budget is a deterministic byte check against .keel/meta.json "budgets"; Archive relocates
// (never deletes) per keel-archive-guide until the doc is back under budget, or reports that
// nothing is archivable. It never loops.

export const meta = {
  name: 'doc-sync',
  description: 'Mandatory pre-merge doc sync: status tables, exit-gate evidence, ADRs, deferred items, CHANGELOG; then byte-budget check + auto-archive',
  phases: [
    { title: 'Sync', detail: 'Update AGENTS.md/CLAUDE.md status table, IMPLEMENTATION_PLAN, docs/adr, deferred items, CHANGELOG' },
    { title: 'Budget', detail: 'wc -c every living doc against .keel/meta.json budgets' },
    { title: 'Archive', detail: 'Only if breached: relocate closed detail to PHASE_ARCHIVE.md, one commit per doc' },
  ],
}

// Defaults written into .keel/meta.json "budgets" the first time this runs on a project that
// has none. Bytes. Edit meta.json to tune per project; do not edit here.
const DEFAULT_BUDGETS = {
  'AGENTS.md': 12288,
  'CLAUDE.md': 12288,
  'docs/IMPLEMENTATION_PLAN.md': 65536,
  'docs/adr/README.md': 16384,
}

phase('Sync')

await agent(`
  Working directory: <project root>

  Mandatory doc sync — MUST run before every merge to trunk.
  A merge without this commit is incomplete. Docs never lag code.
  Tables, not prose. Every ✅ / "verified" carries an evidence LEVEL and an ARTEFACT.

  Wording rule: write deploy state as "on \`<current branch>\`" — never "not yet merged" /
  "pending merge" / "will be merged". The merge step flips it to [merged] mechanically, so
  nothing you write here should need re-wording after the merge.

  Step 1 — Gather context:
  - git branch --show-current ; git log --oneline main..HEAD ; git diff main --name-only
  - Read AGENTS.md (or CLAUDE.md if no AGENTS.md) Current status table.
  - Read docs/IMPLEMENTATION_PLAN.md: phase status table, Changes table, deferred items table.
  - Evidence: ls .keel/evidence/ — find the record for this work (phase-N.json or chg-NNN.json).
    If there is none, you may cite ONLY what the commits themselves prove (level "code-read")
    or tests you can point at by path (level "unit"/"integration"). You do NOT run suites here.
  - grep -rn "NEEDS DECISION" --include="*.md" docs/ AGENTS.md CLAUDE.md

  Step 2 — Classify this work:
  - Part of a Phase (branch phase-N-*)? → update that phase's exit-gate table from its evidence
    JSON (| Gate | Evidence level | Artefact | Verified by | Status |), phase row status
    (✅ only if every gate met; else 🔄 "N/M gates met"), Deploy state "on \`<branch>\`".
  - Otherwise it is a Change → IMPLEMENTATION_PLAN "## Changes" table gets/keeps one row:
    | CHG-NNN | date | branch | one-line summary | ADR (or —) | evidence (level · artefact) | deploy state |
    Allocate CHG-NNN = highest existing + 1 (zero-padded, 3 digits) if the row does not exist.

  Step 3 — AGENTS.md (or CLAUDE.md) Current status — replace the 2-row table, one line per cell:
    | Last completed | <Phase N / CHG-NNN — one line> · on \`<branch>\` · evidence: <path or "code-read: <sha>"> |
    | Now | <what's next per IMPLEMENTATION_PLAN, or the open gates> |
  Anything longer belongs in CHANGELOG.md / IMPLEMENTATION_PLAN.md. Do not append history here.

  Step 4 — Decisions (docs/adr/, per-file; legacy single docs/ADR.md → same rules, append there):
  - Any decision made during this work ("we chose X over Y because Z") → a table-form ADR
    (references/templates/adr shape): next free number = max across docs/adr/ADR-*.md and
    docs/ADR.md headings + 1. One Y-statement Decision row; Options table; Consequences table
    with a "Build deviation" row. If it needs more than one Decision row, it is two ADRs.
  - Reserved/Proposed stubs this work filled → Status "Accepted → Built (<sha>)" in
    docs/adr/README.md. Stubs still Proposed or holding {{TBD}} → Status "UNCLASSIFIED (review)".
    Never auto-accept, never invent, never delete.
  - Decision NOT made (needs founder / legal) → docs/adr/README.md Open decisions table, one row
    per QUESTION with Locations and a Decider tag (founder | engineering | legal). Never invent
    a decision to close a row.
  - [NEEDS DECISION] markers resolved → remove marker AND add the ADR. Never just delete.
  - No addenda. Post-decision events are: build deviation (one ADR row) · incident (RUNBOOK.md
    Postmortems table) · deploy state (CHANGELOG / DEPLOYMENT deploy log) · superseded (new ADR).

  Step 5 — Deferred items table (IMPLEMENTATION_PLAN.md):
    | Item | Deferred from | Reason | Owner (founder|engineering|legal) | Revisit trigger | Target | Status |
  WHY and WHEN, not just WHAT. Earlier rows now resolved → ✅ + note. Negative results
  ("re-checked, still deferred", "investigated — not a bug") get a note; never silence.

  Step 6 — CHANGELOG.md [Unreleased]: one line per user-visible change, tagged [on-branch],
  with refs (Phase N / CHG-NNN / ADR-xxx). An incident found and fixed → RUNBOOK.md Postmortems
  row (PM-xxx) as well; never an ADR addendum.

  Step 7 — Other docs touched: COMMANDS.md (new command) · DEPLOYMENT.md (new env var /
  build-arg / gotcha) · RUNBOOK.md (new playbook / postmortem) · requirement coverage map ·
  FEEDBACK_ROUNDS.md (if this work closes a feedback item).

  Step 8 — Evidence-ladder lint (before committing): in every file you edited, grep for
  "✅", "verified", "live-verified", "confirmed", "proven". Each occurrence YOU wrote must be in a
  row/line that names a level (code-read | unit | integration | local-browser | staging |
  prod-live) and an artefact (sha, report path, CI URL, transcript path). Fix or downgrade any
  that don't. Never write "prod-live" from this step — only DEPLOYMENT.md's deploy procedure may.

  Step 9 — Commit:
    git add AGENTS.md CLAUDE.md docs/IMPLEMENTATION_PLAN.md docs/adr CHANGELOG.md 2>/dev/null; git add -u
    git commit -m "docs: sync — <what> | <n> ADRs | <n> deferred | evidence: <level>"

  Report: files updated, ADRs accepted / unclassified, deferred rows, and the evidence level
  cited for the headline claim.
`, { label: 'sync' })

phase('Budget')

// Deterministic: shell wc -c, no judgement. Structured output so the script can branch.
const budgetCheck = await agent(`
  Working directory: <project root>

  Byte-budget check for the living docs. Mechanical — run the commands, report the numbers.

  1. Read .keel/meta.json. If it has no "budgets" object, add one with exactly
     ${JSON.stringify(DEFAULT_BUDGETS)} (create .keel/meta.json with just that key if the file
     is missing) and commit: git add .keel/meta.json && git commit -m "chore: keel budgets"
  2. For every key in budgets that exists on disk: size=$(wc -c < "<file>") ; compare to budget.
  3. Return the structured result. Do not edit any doc in this step.
`, {
  label: 'budget-check',
  effort: 'low',
  schema: {
    type: 'object',
    properties: {
      breached: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            file: { type: 'string' },
            size: { type: 'number' },
            budget: { type: 'number' },
          },
          required: ['file', 'size', 'budget'],
        },
      },
      checked: { type: 'number' },
    },
    required: ['breached', 'checked'],
  },
})

const breached = (budgetCheck && budgetCheck.breached) || []
log(breached.length
  ? 'Budget breached: ' + breached.map(b => `${b.file} ${b.size}B > ${b.budget}B`).join(', ')
  : `Budgets OK (${budgetCheck ? budgetCheck.checked : 0} files checked)`)

if (breached.length) {
  phase('Archive')

  // One agent per breached file, each its own commit, so a bad relocation reverts alone.
  // No retry loop: one pass; if still over budget, it says so and stops.
  await pipeline(breached, (b) => agent(`
    Working directory: <project root>

    Auto-archive: ${b.file} is ${b.size} bytes, budget ${b.budget}. Bring it under budget by
    RELOCATING closed detail to docs/PHASE_ARCHIVE.md per references/keel-archive-guide.md.
    Relocate, never delete. Verbatim into the archive; a one-line outcome + link stays behind.

    Eligible (only these):
    - PHASE_COMPLETE: a ✅ phase block whose every exit gate is met → leave
      "## Phase N — <name> ✅  <one-line outcome>. Full detail: PHASE_ARCHIVE.md#phase-n-<slug>";
      the phase-status table row stays.
    - DEFERRED_RESOLVED: ✅ rows of the deferred table → PHASE_ARCHIVE "Resolved deferred items".
    - CHANGE_MERGED: Changes-table rows whose deploy state is [merged]/[deployed]/[live-verified]
      AND older than the last 10 rows → PHASE_ARCHIVE "Changes history".
    - ADR_SUPERSEDED: ⚠️ Superseded ADRs → body to PHASE_ARCHIVE, index row stays.
    - KEYSTONE_DRIFT: anything in AGENTS.md/CLAUDE.md beyond the 2-row status table, stacked old
      status entries, sections that duplicate a doc they point at → PHASE_ARCHIVE
      "#agents-md-current-status-history"; leave a one-line pointer.
    - CHANGELOG_OVERFLOW: CHANGELOG.md released sections older than the last 3 releases →
      PHASE_ARCHIVE "Changelog history" (only if CHANGELOG.md is the breached file).
    - POSTMORTEM_CLOSED: RUNBOOK Postmortems rows whose prevention has landed (commit cited) and
      are older than 90 days → PHASE_ARCHIVE (only if RUNBOOK.md is the breached file).

    NEVER touch: the 🔄 / ⬜ phases · open deferred rows · Proposed / Accepted / UNCLASSIFIED
    ADRs · DEPLOYMENT.md's environment matrix or build-time/runtime table · the Document map,
    Hard invariants, Git & working workflow, or the 2-row status table · any ID (Phase numbers,
    ADR/CHG/PM numbers, requirement IDs — bodies move, IDs stay) · anything holding an
    unresolved [NEEDS DECISION].

    Steps:
    1. Read ${b.file} and docs/PHASE_ARCHIVE.md (create from references/templates/PHASE_ARCHIVE.md
       if missing). Pick the eligible items, oldest first, until the projected size is under
       ${b.budget} bytes. Do not archive more than needed.
    2. Apply the relocations exactly as the archive guide's before/after shapes describe.
    3. Re-check: wc -c < ${b.file}
    4. Update .keel/meta.json: lastArchived = today (date +%F), archivedEntries += <count>.
    5. Commit this file's relocation on its own:
         git add ${b.file} docs/PHASE_ARCHIVE.md .keel/meta.json && \\
         git commit -m "docs: auto-archive — ${b.file} ${b.size}B > ${b.budget}B (<count> items relocated)"
    6. If nothing eligible exists: make NO edits (git checkout -- ${b.file} if you started) and
       report exactly "BUDGET_EXCEEDED: ${b.file} <size>B > ${b.budget}B — nothing archivable".
       If you relocated everything eligible and it is still over budget: keep and commit that
       progress (step 5), then report "BUDGET_EXCEEDED: ${b.file} <size>B > ${b.budget}B — still
       over after relocating <count> items". Either way do not try again; a human raises the
       budget in .keel/meta.json or trims by hand.

    Report: items relocated by category, before/after sizes, commit sha — or the BUDGET_EXCEEDED line.
  `, { label: `archive:${b.file}`, phase: 'Archive' }))
}
