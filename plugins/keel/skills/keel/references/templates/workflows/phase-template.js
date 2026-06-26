// Keel phase workflow template
// Copy this file to .claude/workflows/phase-N-<slug>.js and fill in the {{PLACEHOLDERS}}.
// Run: claude --workflow .claude/workflows/phase-N-<slug>.js
// Or invoke via the Workflow tool in a Claude Code session.

export const meta = {
  name: 'phase-{{N}}-{{SLUG}}',
  description: 'Phase {{N}}: {{PHASE_NAME}} — {{PHASE_GOAL_ONE_SENTENCE}}',
  phases: [
    { title: 'Build', detail: '{{TASKS_SUMMARY — comma-separated list of parallel tasks}}' },
    { title: 'Doc Sync', detail: 'Update CLAUDE.md, IMPLEMENTATION_PLAN, ADR, deferred items' },
    { title: 'Merge', detail: 'Merge all worktrees into trunk, clean up' },
  ],
}

// ── PHASE {{N}}: {{PHASE_NAME}} ─────────────────────────────────────────────
//
// Replace each {{TASK_N}} with the actual scope items from IMPLEMENTATION_PLAN Phase {{N}}.
// Each task becomes one worktree agent. Keep tasks independent (different files/modules).
// If tasks are not divisible, run them sequentially inside a single agent instead.

phase('Build')

const TASKS = [
  '{{TASK_1 — e.g. "Implement auth module per LLD.md §3.1 — login, session, role checks"}}',
  '{{TASK_2 — e.g. "Add user profile API endpoints per LLD.md §3.2"}}',
  '{{TASK_3 — e.g. "Build the core UI screen per DESIGN.md §6.1 — run /impeccable shape first"}}',
  // Add or remove tasks. One task = one worktree. Tasks must not write to the same files.
]

const buildResults = await parallel(TASKS.map((task, i) => () => agent(`
  You are working in a git worktree of <project root>.
  Reference these docs before starting: IMPLEMENTATION_PLAN.md Phase {{N}}, ARCHITECTURE.md, LLD.md.
  Non-negotiables (ENGINEERING_DESIGN.md) apply unconditionally.

  Your task: ${task}

  ── If this task includes UI work ──────────────────────────────────────────
  1. Run /impeccable shape <feature> FIRST — plan the UX/UI before writing code.
  2. Check modern-web-guidance before any new UI pattern:
       npx -y modern-web-guidance@latest search "<what you want to achieve>"
       npx -y modern-web-guidance@latest retrieve "<id>"  (for the full guide)
  3. After the feature is functionally complete:
       /impeccable critique <target>   (UX review)
       /impeccable audit <target>      (technical gate — must pass with zero P0/P1)
  ── End UI section ─────────────────────────────────────────────────────────

  Implementation steps:
  1. Read the relevant spec sections listed above.
  2. Implement the task following the spec.
  3. Write tests alongside the code (unit for logic, integration for cross-module behaviour).
  4. Run tests and lint: npm test && npm run lint  (or project equivalent).
  5. Stage and commit all changes: git add -A && git commit -m "feat(${task.slice(0,40)}): ..."
  6. Return: your branch name (git branch --show-current) and a 2–3 line summary.
`, { isolation: 'worktree', label: `task-${i + 1}` })))

phase('Doc Sync')

// MANDATORY — do not skip. No merge without the doc-sync commit.
await agent(`
  Working directory: <project root>

  Phase {{N}} — mandatory doc sync before merge.

  1. Read git log --oneline main..HEAD to see what this phase delivered.
  2. Update CLAUDE.md current status (2 lines: last completed + now).
  3. Update IMPLEMENTATION_PLAN.md phase {{N}} status → ✅, next phase → 🔄.
  4. Capture any decisions made during Phase {{N}} as ADR entries in ADR.md.
  5. Record any deferred items in the IMPLEMENTATION_PLAN deferred-items table (with reason + target phase).
  6. Resolve any [NEEDS DECISION] markers: remove marker + add ADR. Never just delete the marker.
  7. Commit: git add CLAUDE.md IMPLEMENTATION_PLAN.md ADR.md && git add -u
            git commit -m "docs: phase {{N}} complete — [decisions] [deferred items]"
`, { label: 'doc-sync' })

phase('Merge')

const branches = buildResults
  .filter(Boolean)
  .map(r => {
    if (!r) return null
    if (typeof r === 'string') return r.match(/worktree-[a-z0-9-]+/)?.[0] || null
    return r.branch || null
  })
  .filter(Boolean)

log('Merging: ' + (branches.length ? branches.join(', ') : 'checking git worktree list'))

await agent(`
  Working directory: <project root>

  Merge all Phase {{N}} worktrees into main and clean up.

  1. Confirm on main: git branch --show-current
  2. List active worktrees: git worktree list
  3. For each feature branch (from worktree list, excluding main checkout):
       git merge --no-ff <branch> -m "merge(phase-{{N}}): <branch-task-description>"
  4. Remove each non-main worktree: git worktree remove <path> --force
  5. Delete merged branches: git branch -d <branch>
  6. Confirm: git log --oneline -8
  7. Report: branches merged, worktrees removed, any conflicts and how resolved.

  DO NOT push to origin unless explicitly instructed.
`, { label: 'merge' })
