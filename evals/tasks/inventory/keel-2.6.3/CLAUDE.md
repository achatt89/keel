@AGENTS.md

# inventory — Claude Code notes

## Workflow tooling

- Phase scripts run via the Workflow tool or `claude --workflow .claude/workflows/phase-N-<slug>.js`; task agents open with `/goal` and the exit strategy in IMPLEMENTATION_PLAN "Standing rules".
- Keel modes: `/keel phase new <slug>` · `/keel change <slug>` · `/keel closeout` · `/keel archive` · `/keel upgrade` · `/keel version` · `/keel check`.

Review roles: `.claude/agents/doc-sync.md` (doc-sync only; security and design roles not set up — skills declined); when it runs: AGENTS.md step 5. Delegate with the Agent tool (`subagent_type: doc-sync`) and read its `## Report`.
