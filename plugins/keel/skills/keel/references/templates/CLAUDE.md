<!--
  Keel template — CLAUDE.md (thin: Claude-only additions to AGENTS.md)
  WHAT: Claude Code reads this file first. Its FIRST LINE imports AGENTS.md — the canonical
        keystone index — so nothing in AGENTS.md is ever duplicated here. Everything below the
        import is Claude-Code-specific: skill hooks, the Workflow tool, `/goal`, `/keel` modes.
  INCLUDE WHEN: Always — exactly one, next to AGENTS.md.
  BYTE BUDGET: counts toward the same 12 KB session budget as AGENTS.md (`.keel/meta.json`).
  Delete all <!-- Keel guidance --> comments (and this block) when filling this in.
-->

@AGENTS.md

# {{PROJECT_NAME}} — Claude Code notes

<!-- Keel guidance: everything general lives in AGENTS.md (imported above). Only Claude-Code
     tooling goes here. If a line would also be true for Codex or Cursor, it belongs in AGENTS.md. -->

## Workflow tooling

- Phase scripts run via the Workflow tool or `claude --workflow .claude/workflows/phase-N-<slug>.js`; task agents open with `/goal` and the exit strategy in IMPLEMENTATION_PLAN "Standing rules".
- Keel modes: `/keel phase new <slug>` · `/keel change <slug>` · `/keel closeout` · `/keel archive` · `/keel upgrade` · `/keel version`.
- Browser verification for UI work is `claude-in-chrome`; its transcript path is the artefact cited in the evidence file.

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
