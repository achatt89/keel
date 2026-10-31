---
title: "Roles & Delegation"
lead: "Three jobs must happen after every piece of work: the docs get updated, the change gets a security review, and UI work gets a design review. Keel gives each job one owner and makes the agent doing the work responsible for checking the result."
group: "How It Works"
order: 13
slug: roles
anchor: roles
---

## One owner per role

| Role | Set up when | Runs |
| --- | --- | --- |
| doc-sync | Every project | After each piece of work, before the commit that completes it. |
| security | You accepted the `security-audit` skill | After any task that changed code, on the branch diff, before the task is reported done. |
| design | You accepted impeccable or modern-web-guidance | Before UI work (shape it), after UI edits (critique and audit), before merge. |

If the project already has a full-time agent for a role (a doc or architect agent, a security or QA agent, a design agent), that agent owns it and keel writes nothing extra. Otherwise keel writes a repo-local Claude Code subagent: `.claude/agents/doc-sync.md`, `security.md` or `design.md`. Keel never asks an orchestrator to hire or spawn an agent. `.keel/meta.json` records each owner under `agents`.

## The caller supervises

The agent doing the work is the **caller**. It delegates to a role, reads the report that comes back, and decides what happens next: accept, ask for a specific fix, or escalate. Subagents never commit, push, merge, or message anyone but their caller; the caller commits. If the caller has its own supervisor or orchestrator, it keeps reporting upward exactly as before.

Every role ends its reply with the same fixed block, so callers can read it reliably:

```
## Report
role: doc-sync | security | design
caller: <who delegated this>
scope: <branch> · <diff range>
status: done | partial | blocked
changed:
- <file> — <what changed>
checked: <what was compared or examined>
findings:
- <finding, or what could not be done>
evidence: <path, or none>
not verified: <what was not checked>
needs from caller: <decisions, or none>
```

## The doc-sync loop

Before committing, the caller hands doc sync to the doc-sync role. It updates the status table, the implementation plan, decision records, deferred items, the changelog and any doc the work touched, then reports. The caller compares that report with what it actually did (`git log`, `git diff main`, the evidence record) and sends back anything missing. There is a hard cap of **three rounds**: whatever is still missing after round three becomes a deferred item, and the caller commits and moves on. `.claude/workflows/doc-sync.js` runs this loop for every phase and change. The role writes into the right part of a split doc and splits any doc its edit would push over budget (see [Splitting an oversize doc](./16-archive.md)).

## The security skill

Keel offers Cloudflare's `security-audit` skill but never installs it silently. Before asking, it shows the source repository and the exact commit, and says plainly that this is a global, third-party install. You can answer yes, not now (asked again on the next upgrade) or never. On yes it runs:

```
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit --global
```

A confirmed high or critical finding, or a design P0/P1, means the task is not done.

## Evidence retention

Review runs are saved under `.keel/evidence/<role>/<branch>/`. A small script keeps the newest three runs per branch and removes a merged or deleted branch's runs 30 days after its last run. It never deletes the exit-gate records or the security ledger that the next audit reuses. Both numbers can be changed in `.keel/meta.json` under `evidenceRetention`. It runs at the end of every doc sync.
