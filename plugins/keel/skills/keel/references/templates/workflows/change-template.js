// Keel change workflow template (doc format 2) — the lightweight unit of work.
// Copy to .claude/workflows/chg-<slug>.js (or let `/keel change <slug>` generate it).
// Run: claude --workflow .claude/workflows/chg-<slug>.js   (or via the Workflow tool)
//
// A Change is hotfix-weight: one branch, one agent, one evidence record, one doc-sync, one
// merge. No phase block in IMPLEMENTATION_PLAN, no worktree fan-out. Use it for anything that
// is not a gated milestone — bug fixes, copy changes, config tweaks, a single small feature.
// If the work needs parallel tasks or has exit gates of its own, it is a Phase: use
// phase-template.js via `/keel phase new`.

export const meta = {
  name: 'chg-{{SLUG}}',
  description: 'Change: {{CHANGE_ONE_SENTENCE}}',
  phases: [
    { title: 'Setup', detail: 'Branch chg/{{SLUG}} off main; allocate CHG-NNN row' },
    { title: 'Build', detail: 'Single agent, /goal, tests with the code' },
    { title: 'Verify', detail: 'Evidence record .keel/evidence/chg-NNN.json' },
    { title: 'Doc Sync', detail: 'doc-sync.js rules: Changes row, status table, ADR if any, CHANGELOG' },
    { title: 'Merge', detail: 'Merge chg/{{SLUG}} into main; flip deploy state to [merged]' },
  ],
}

phase('Setup')

const setup = await agent(`
  Working directory: <project root>

  Create or resume the change branch and allocate its ID.

  1. git fetch origin main --quiet 2>/dev/null || true
  2. If chg/{{SLUG}} exists: git checkout chg/{{SLUG}}   else: git checkout -b chg/{{SLUG}} main
  3. Allocate CHG-NNN: in docs/IMPLEMENTATION_PLAN.md "## Changes" table, highest existing
     CHG number + 1 (zero-padded, 3 digits; CHG-001 if the table is empty or missing — create the
     table from references/templates/IMPLEMENTATION_PLAN.md's shape if missing). If a row for
     chg/{{SLUG}} already exists (resuming), reuse its number.
     Add the row now so parallel changes cannot take the same number:
       | CHG-NNN | <date +%F> | chg/{{SLUG}} | {{CHANGE_ONE_SENTENCE}} | — | — | on \`chg/{{SLUG}}\` |
     git add docs/IMPLEMENTATION_PLAN.md && git commit -m "docs: open CHG-NNN — {{SLUG}}"
  4. Report the allocated id.
`, {
  label: 'change-setup',
  effort: 'low',
  schema: {
    type: 'object',
    properties: { id: { type: 'string' }, branch: { type: 'string' } },
    required: ['id', 'branch'],
  },
})

const CHG = (setup && setup.id) || 'CHG-???'
log(`${CHG} on chg/{{SLUG}}`)

phase('Build')

await agent(`
  Working directory: <project root> — on chg/{{SLUG}} (confirm: git branch --show-current).
  Reference the docs the change touches (ARCHITECTURE.md, LLD.md, DESIGN.md as relevant).
  Non-negotiables (ENGINEERING_DESIGN.md) apply unconditionally.

  Your change (${CHG}): {{CHANGE_DESCRIPTION — what, where, the observable result}}

  FIRST — set your exit condition:
    /goal "${CHG} is implemented, its tests pass, lint is clean, and the verify skill confirms
    the behavior end-to-end (plus a manual claude-in-chrome pass if this touches UI)"

  ID rules: migrations are TIMESTAMP-prefixed (YYYYMMDDHHmmss_<slug>), never sequential. If this
  change involves a real decision ("we chose X over Y because Z"), create the ADR now at the next
  free number (max across docs/adr/ADR-*.md and docs/ADR.md + 1) in table form
  (references/templates/adr); a change on main has no reservation step, so allocate at creation
  and say so in your report. If the decision is not yours to make (founder / legal), add an Open
  decisions row with a Decider tag instead — never invent one.

  ── If this touches UI ─────────────────────────────────────────────────────
  - modern-web-guidance search before any new pattern; /impeccable audit <target> after
    (zero P0/P1); manual claude-in-chrome pass on the real path.
  ── End UI ─────────────────────────────────────────────────────────────────

  Steps:
  1. Implement. 2. Tests with the code. 3. npm test && npm run lint (project equivalents).
  4. verify skill end-to-end. 5. Failure → fix, repeat from 3.

  {{GOAL_EXIT_STRATEGY_BLOCK — same policy as IMPLEMENTATION_PLAN Standing rules. Default:
    up to 3 fix-and-retest cycles, then /goal clear, commit what works, and add a deferred-items
    row (Owner · Revisit trigger) stating exactly what is blocking.}}

  6. git add -A && git commit -m "fix|feat(<scope>): <summary> (${CHG})"
  7. Report: 2–3 lines, and honestly the evidence LEVEL reached (code-read | unit | integration |
     local-browser). Verify reproduces; you are not the last word on "done".
  Do NOT merge from here.
`, { label: 'build' })

phase('Verify')

await agent(`
  Working directory: <project root> — on chg/{{SLUG}}.

  Produce the evidence record for ${CHG}. Run the checks yourself, once; do not trust the Build
  report. Same shape as a phase record, with the change's own acceptance as its gates.

  1. Gates = the observable results named in the change description (each one a gate), plus the
     standing gates: lint clean · typecheck clean · unit+integration green · audit clean.
  2. Run the suites once; save raw reports under .keel/evidence/${CHG.toLowerCase()}/ ; record
     skipped tests BY NAME. UI change → claude-in-chrome pass on the local stack, transcript saved
     as an artefact; /impeccable audit output saved.
  3. Levels: code-read | unit | integration | local-browser | staging. NEVER "prod-live" (only a
     deploy may). A gate whose wording demands a level you did not reach is "partial".
  4. Write .keel/evidence/${CHG.toLowerCase()}.json:
     {
       "change": "${CHG}", "branch": "chg/{{SLUG}}", "commit": "<short sha>", "date": "<YYYY-MM-DD>",
       "gates": [ { "gate": "...", "level": "...", "artefact": "...", "verifiedBy": "verify-agent",
                    "status": "met | partial | unmet", "notes": "..." } ],
       "suites": { "<name>": { "files": 0, "passed": 0, "failed": 0, "skipped": [], "report": "<path>" } },
       "impeccable": { "target": null, "p0": 0, "p1": 0, "report": null }
     }
  5. git add .keel/evidence && git commit -m "test(${CHG.toLowerCase()}): verify — <met>/<total> gates met"
  Report the gates table. Do not fix code here; unmet is the finding.
`, { label: 'verify' })

phase('Doc Sync')

// Same rules as doc-sync.js (kept in one place there); this step points at them so the two
// never drift. Budget check + auto-archive run in doc-sync.js's own stages.
await workflow({ scriptPath: '.claude/workflows/doc-sync.js' })

phase('Merge')

await agent(`
  Working directory: <project root>

  Merge chg/{{SLUG}} (${CHG}) into main and flip deploy state to [merged].

  1. git checkout main
  2. git log --oneline main..chg/{{SLUG}} — last commit must be the doc-sync commit, and
     .keel/evidence/${CHG.toLowerCase()}.json must exist on the branch. Missing → STOP.
  3. git merge --no-ff chg/{{SLUG}} -m "merge(${CHG.toLowerCase()}): {{CHANGE_ONE_SENTENCE}}"
  4. Flip state — mechanical substitutions only:
     - CHANGELOG.md [Unreleased] lines referencing ${CHG}: [on-branch] → [merged <merge sha>]
     - IMPLEMENTATION_PLAN.md Changes table, ${CHG} row, deploy state: "on \`chg/{{SLUG}}\`" → "merged <sha>"
     - AGENTS.md / CLAUDE.md status table Last completed cell: same substitution.
     git add -u && git commit -m "docs: ${CHG.toLowerCase()} merged"
  5. git branch -d chg/{{SLUG}} ; git log --oneline -6
  6. Report. "deployed vNN" / "live-verified" are recorded by DEPLOYMENT.md's deploy procedure,
     not here. DO NOT push unless explicitly instructed.
`, { label: 'merge-to-main' })
