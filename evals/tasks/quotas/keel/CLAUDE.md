@AGENTS.md

# filestore — Claude Code notes

## Workflow tooling

- Phase scripts run via the Workflow tool or `claude --workflow .claude/workflows/phase-N-<slug>.js`; task agents open with `/goal` and the exit strategy in IMPLEMENTATION_PLAN "Standing rules".
- Keel modes: `/keel phase new <slug>` · `/keel change <slug>` · `/keel closeout` · `/keel archive` · `/keel upgrade` · `/keel version`.
- No UI: no browser verification, no impeccable / modern-web-guidance hooks.

## Review subagents

| Role | Who (`.keel/meta.json` `agents`) | Owns | Runs |
|---|---|---|---|
| doc-sync | `doc-sync` subagent (`.claude/agents/doc-sync.md`) | the doc rules in `.claude/workflows/doc-sync.js` | after any piece of work, before its commit; ≤3 feedback rounds |

Security and design roles are not set up (security-audit declined; no UI). The hard rule is AGENTS.md workflow step 5; the caller/subagent contract is AGENTS.md "Delegation". Delegate with the Agent tool (`subagent_type: doc-sync`), read the `## Report` block, decide the next step.
