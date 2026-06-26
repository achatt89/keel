export const meta = {
  name: 'doc-sync',
  description: 'Mandatory pre-merge doc sync: update CLAUDE.md, IMPLEMENTATION_PLAN, ADR, deferred items',
  phases: [
    { title: 'Sync', detail: 'Update CLAUDE.md status, IMPLEMENTATION_PLAN phase table, ADR decisions, deferred items' },
  ],
}

phase('Sync')

await agent(`
  Working directory: <project root>

  Mandatory doc sync — MUST run before every merge to trunk.
  A merge without this commit is incomplete. Docs never lag code.

  Step 1 — Gather context:
  - Read CLAUDE.md (current status section)
  - Read IMPLEMENTATION_PLAN.md (phase status table, deferred items table)
  - Run: git log --oneline main..HEAD  (what just shipped in this feature branch)
  - Run: git diff main --name-only      (which files changed)
  - Grep for unresolved markers: grep -rn "NEEDS DECISION" --include="*.md" .

  Step 2 — Update CLAUDE.md "Current status" section (2 lines max):
  - "Last completed: <what just merged>"
  - "Now: <what's next per IMPLEMENTATION_PLAN>"

  Step 3 — Update IMPLEMENTATION_PLAN.md:
  a) Phase status table: set Status to ✅ for the phase that just closed; set 🔄 for the next one; update "Last update" column to today's date.
  b) Deferred items table: for any scope items punted during this work, add rows:
     | Item | Deferred from | Reason | Target phase | Status |
     Each item MUST state WHY it was deferred and WHEN it will be revisited.
  c) For deferred items from earlier phases now resolved: mark ✅ with a resolution note.

  Step 4 — Capture decisions in ADR.md:
  - For any architectural decision made during this work (including "we chose X over Y because Z"):
    add an ADR entry with: Context | Decision | Consequences | Revisit trigger.
  - For any [NEEDS DECISION] markers resolved: remove the marker from its doc AND add the ADR.
    Never just delete a [NEEDS DECISION] marker without recording the decision.
  - Cross-link from ARCHITECTURE.md if the decision touches the trust boundary or component map.

  Step 5 — Update any other docs the work touched:
  - New command added? → COMMANDS.md
  - New incident type or recovery procedure? → RUNBOOK.md
  - New requirement satisfied? → requirement coverage map in IMPLEMENTATION_PLAN.md

  Step 6 — Commit all updated docs:
  git add CLAUDE.md IMPLEMENTATION_PLAN.md ADR.md
  git add -u  (picks up any other docs modified above)
  git commit -m "docs: sync — [what completed] | [N decisions captured] | [N items deferred]"

  Report: which docs were updated, what decisions were captured, what was deferred and why.
`)
