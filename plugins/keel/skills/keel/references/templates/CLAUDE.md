<!--
  Keel template — CLAUDE.md (the keystone index)
  WHAT: The entry point Claude Code / a new contributor reads first. A LIGHT file:
        one-line description, a document-map table, the hard invariants, the working
        workflow, and a living "current status" line.
  INCLUDE WHEN: Always — every Keel-generated suite has exactly one CLAUDE.md.
  DEPENDS ON: Everything; written last so it indexes only docs that actually exist.
  OWNS: No IDs. References every other doc. When this file and a referenced doc
        disagree, the doc wins — fix the pointer here, not the doc.
  KEEP IT LIGHT: This is the #1 rule. Detail lives in the docs this file points to.
        Target ~70–120 lines. If a section grows past a few lines, it belongs in a
        referenced doc with a pointer here. Resist the urge to explain — link instead.
  Delete all <!-- Keel guidance --> comments (and this block) when filling this in.
-->

# {{PROJECT_NAME}} — CLAUDE.md

<!-- Keel guidance: one or two sentences. What the project is, the stack in a clause,
     and the single overriding value (e.g. "security and auditability rank above
     feature velocity"). No marketing. No detail that lives elsewhere. -->
{{PROJECT_NAME}} is {{ONE_LINE_DESCRIPTION}} ({{STACK_SUMMARY}}). {{OVERRIDING_PRINCIPLE}}.

This file is deliberately light. The documents below are the source of truth — read the
relevant one *before* touching code.

## Document map

<!-- Keel guidance: list ONLY docs that exist on disk (conventions traceability rule).
     One row per doc. "When you are…" is the trigger that sends a reader there. Drop
     rows for docs the project doesn't warrant; add rows for ones it does. -->

| Read this | When you are |
|---|---|
| `docs/{{ENGINEERING_DESIGN}}` | Starting any work — design pillars, the core domain model, data classification, **non-negotiables** |
| `docs/{{DESIGN_DOC}}` | Building UI — the design system: tokens, components, patterns, multi-interface rules |
| `docs/{{IMPLEMENTATION_PLAN}}` | Picking up work — current phase, scope, and the exit gates that block the next phase |
| `docs/{{LLD}}` | Writing code — module map, interfaces, schemas, security-module implementations |
| `docs/{{ARCHITECTURE}}` | Making structural choices — components, schema, trust boundaries, controls by threat category, accepted risks |
| `docs/{{EXTENSION_SPEC}}` | Adding or changing a {{EXTENSION_POINT}} — the authoritative contract |
| `docs/{{ADR}}` | Wondering "why is it like this?" — or recording a new decision |
| `docs/{{NFR}}` | Writing tests/gates — acceptance criteria, CI build gates, perf budgets |
| `docs/{{COMPLIANCE}}` | Touching personal/regulated data — data classes, consent, retention, erasure/export |
| `docs/{{BRD}}` / `docs/{{PRD}}` | Questioning scope or product behaviour |
| `{{COMMANDS}}` | Running anything — dev/test/deploy commands and the env-var reference |
| `{{RUNBOOK}}` | Operating or responding to an incident |

## Hard invariants (full list + rationale: {{ENGINEERING_DESIGN}} §{{NONNEG_SECTION}})

<!-- Keel guidance: a SHORT numbered list — the rules that must never be violated, each
     one line, each pointing at the doc/ADR that details and justifies it. These are the
     project's non-negotiables, not a tutorial. Pull them from ENGINEERING_DESIGN's
     non-negotiables and the CI-failing lint rules. Keep to the genuinely load-bearing
     few; if everything is an invariant, nothing is. -->

1. {{INVARIANT_ISOLATION}} — every {{SCOPED_QUERY}} carries its scope key; the access layer is the mechanism, {{BACKSTOP}} is only the backstop. (see {{ENGINEERING_DESIGN}})
2. {{INVARIANT_TRUST_BOUNDARY}} — untrusted input crosses {{BOUNDARY}} only through {{GUARD}}; this is a CI-failing lint rule — never disable or work around it. (see {{ADR}})
3. {{INVARIANT_APPEND_ONLY}} — {{APPEND_ONLY_TABLES}} are append-only (trigger-enforced); never UPDATE/DELETE. (see {{ARCHITECTURE}})
4. {{INVARIANT_SINGLE_PATH}} — {{SENSITIVE_OPERATION}} happens only via {{CANONICAL_MODULE}}; never call the underlying API directly. (see {{LLD}})
5. {{INVARIANT_RBAC}} — authorization checks live only in {{RBAC_MODULE}}; inline role checks are a CI-failing lint rule. (see {{ADR}})
6. {{INVARIANT_OTHER}} — {{RATIONALE}}. (see {{DOC}})

## Git & working workflow (mandatory — the build loop)

<!-- Keel guidance: these are non-negotiables, not suggestions. The workflow scripts in
     .claude/workflows/ encode this loop — use them to run every phase. Detail and rationale
     in IMPLEMENTATION_PLAN "Standing rules". -->

0. **Version control from commit one.** If this folder isn't a git repo yet, `git init` and make an initial commit (the generated docs are the first commit) before any feature work.
1. **Branch from `main`** before any work (`git checkout -b feat/<task> main`). Never commit directly to `main`.
2. **Run the phase workflow script** for any planned phase of work:
   `claude --workflow .claude/workflows/phase-N-<slug>.js`
   Or invoke via the Workflow tool inside a Claude Code session. The script fans out divisible tasks as parallel agents in separate `git worktree`s — one worktree per task, agents never share a working copy. Merge each worktree back to the feature branch when its task is done.
   For undivisible work (small hotfixes, config tweaks): branch-per-feature still required; worktree still preferred for isolation.
3. **Write tests with the code, never after.** Unit tests for logic/edge paths; integration tests for cross-module behaviour; smoke tests for wiring. Security- and isolation-critical behaviour is *proven by a test*. "No test needed" is a stated judgement, not a default.
4. **Definition of done per change:** {{DOD_GATES}} (details: IMPLEMENTATION_PLAN "Standing rules").
5. **Doc sync before every merge** — run `.claude/workflows/doc-sync.js` and wait for its commit before merging to `main`. It updates: this file's Current status · IMPLEMENTATION_PLAN phase table · ADR.md for new decisions · deferred-items table. A merge without the doc-sync commit is incomplete.
6. **Merge to `main`** only after gates pass and the doc-sync commit is present.
7. **Decisions captured without fail.** Any decision made during work — including "we chose X over Y because Z" — becomes an ADR entry before merge. `[NEEDS DECISION]` markers resolved during work are removed and converted to ADR entries, never just deleted.

## Current status

<!-- Keel guidance: ONE or TWO lines, updated after every merge (workflow step 6).
     What just shipped + what's next. All real detail belongs in IMPLEMENTATION_PLAN.
     If this section grows past two lines, move the detail out. -->

> Updated after every merge to `main`. One or two lines only — detail lives in `{{IMPLEMENTATION_PLAN}}`.

- **Last completed:** {{LAST_COMPLETED}}.
- **Now:** {{CURRENT_WORK}}.

## Working agreements

<!-- Keel guidance: 3–5 bullets of standing rules that aren't workflow steps — the
     conventions a contributor must hold. Keep terse; point to docs for detail. -->

- Definition of done per change: {{DOD_SUMMARY}} (details: {{IMPLEMENTATION_PLAN}}).
- New {{SCOPED_RESOURCE}} gets its scope key + {{ISOLATION_CONTROL}} before its first migration merges; new decisions become {{ADR}} entries; new accepted risks go to {{ARCHITECTURE}}.
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Active skills *(UI projects — remove this section if no UI or skills integration was skipped)*

<!-- Keel guidance: these skills provide continuous quality gates on all UI work. The hooks
     fire automatically — the developer never needs to remember to invoke them for routine checks.
     This section is the quick-reference; full command lifecycle is in DESIGN.md §12. -->

### impeccable — visual quality gates

PostToolUse hook fires after every UI file edit and surfaces design/a11y findings as system reminders.
**Activate once:** run `/impeccable hooks on` in Claude Code after the skill is installed.

**Quick-reference by intent:**

| I want to… | Command |
|---|---|
| Start a new UI feature | `/impeccable shape {{feature}}` |
| Build a feature with quality baked in | `/impeccable craft {{feature}}` |
| Review UX after feature complete | `/impeccable critique {{target}}` |
| Technical quality gate (a11y, perf, responsive) | `/impeccable audit {{target}}` |
| Final pass before shipping | `/impeccable polish {{target}}` |
| Bland design → more conviction | `/impeccable bolder {{target}}` |
| Noisy design → more clarity | `/impeccable quieter {{target}}` |
| Add motion intentionally | `/impeccable animate {{target}}` |
| Fix type hierarchy | `/impeccable typeset {{target}}` |
| Add strategic colour | `/impeccable colorize {{target}}` |
| Fix layout/spacing | `/impeccable layout {{target}}` |
| Fix responsive/mobile | `/impeccable adapt {{target}}` |
| Error states + edge cases | `/impeccable harden {{target}}` |
| First-run + empty states | `/impeccable onboard {{target}}` |
| Fix UI performance | `/impeccable optimize {{target}}` |
| Add personality/delight | `/impeccable delight {{target}}` |
| Iterate live in browser | `/impeccable live` |
| Manage hook on/off/status | `/impeccable hooks on|off|status` |

See DESIGN.md §12.1 for the full lifecycle map (when to use each command, in what order).

### modern-web-guidance — modern web platform patterns

PostToolUse reminder fires after every FE file edit, prompting to check before implementing new UI patterns.

**Three functions — use in sequence:**
1. `npx -y modern-web-guidance@latest search "<what you want to do>"` — before any new UI pattern
2. `npx -y modern-web-guidance@latest retrieve "<id>"` — get the full guide and implementation code
3. `npx -y modern-web-guidance@latest list` — browse all guides when search is vague

**Always search before:** dialogs · popovers · scroll animations · page transitions · form autofill · image loading · responsive layouts · custom selects · any "I'd reach for a library" moment.

See DESIGN.md §12.2 for the full function map, query examples, and browser support policy.
