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

Review roles: `.claude/agents/` ({{ROLES — security, design, doc-sync; or the full-time agents in .keel/meta.json "agents"}}); when they run: AGENTS.md steps 5 and 9. Delegate with the Agent tool (`subagent_type: <role>`) and read its `## Report`; hand roles the work rather than running their skills ad hoc.

<!-- Keel guidance: UI projects with skills integration only; otherwise delete the line below.
     The full command map lives once, in DESIGN.md §12 — never copy it here. -->
UI work: design subagent; impeccable (activate once: `/impeccable hooks on`) and modern-web-guidance hooks fire on UI edits; commands in DESIGN.md §12.
