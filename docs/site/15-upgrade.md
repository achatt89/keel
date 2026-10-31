---
title: "Upgrading Existing Projects"
lead: "If a project already has keel-generated docs, /keel upgrade audits them against the current keel standard, reports what has drifted or gone missing, and applies only the fixes you approve."
group: "How It Works"
order: 15
slug: upgrade
anchor: upgrade
---

## When to run it

Run `/keel upgrade` on any project that was documented with an earlier version of keel, or that has accumulated manual edits that may have diverged from the conventions keel expects. Keel detects an upgradeable project automatically when it finds three or more of the standard documents present.

> `/keel upgrade` never rewrites whole documents. Every edit is surgical: existing content you wrote is preserved; only gaps and outdated sections are touched.

## How it runs

- **Phase U1**: **Discover:** inventory the existing doc set, identify which keel documents are present, and determine project type and whether the project has a UI.
- **Phase U2**: **Audit:** run each present document through the upgrade checklist: required sections, stable IDs, standing rules, skill integration hooks, workflow script references, and placeholder fill status.
- **Phase U3**: **Report and permission:** present a gap report grouped by severity. You choose which gaps to fix; Keel does nothing until you approve.
- **Phase U4**: **Update:** apply the approved fixes surgically: add missing sections, fill placeholders, append new standing rules, install missing skills, update `.keel/meta.json`.
- **Phase U5**: **Codebase audit:** generate a checklist of implementation gaps derived from the now-current docs, or save it as `CODEBASE_AUDIT.md` for later.

## What an upgrade adds (2.1 to 2.4)

- **Role owners**: Sets up the doc-sync role, and the security and design roles for skills you have accepted: your full-time agent for the role if there is one, otherwise a repo-local subagent. Adds AGENTS.md workflow step 5 (doc sync before the completing commit, three rounds at most), step 9 (review before done), the Delegation section and the matching pre-PR checklist lines.
- **Workflow scripts**: Replaces `doc-sync.js` with the delegate-and-review version and points each unfinished phase script's Doc Sync stage at it. Adds the evidence prune script.
- **Security skill**: Asks about the `security-audit` skill (source and commit shown, global install), unless you said never.
- **Size check and splits (2.4)**: Installs `.keel/doc-size.mjs` and a 32 KB default budget for every doc, and proposes splitting any doc that is over budget.
- **Verdicts and waivers (2.4.2)**: Replaces the checker with the per-doc verdict version. Each old `budgetExceptions` entry is shown to you and, if you keep it, moved to `waivers` with today as its reviewed date. Docs already `ok` or `waived` get no proposal, so running the upgrade again changes nothing. From 2.4.3 the upgrade installs the checker first, whatever version it starts from.
- **Update check hook**: Offers the optional session-start hook that says when a newer keel is published.
- **Projects upgraded by 2.1**: A 2.1 upgrade could record a request for an orchestrator to create an agent. The upgrade replaces that record: with your full-time agent if one really exists for the role, otherwise with the repo-local subagent.

## Moving a project to the 2.0 format

A project documented by keel 1.x is detected as *format 1* (a single `ADR.md` with addenda, a prose status section, bullet exit gates, no `DEPLOYMENT.md`). `/keel upgrade` then offers a `FORMAT_MIGRATION` path that runs as one reviewable commit per step on a `keel-upgrade-2.0` branch: archive first, audit, **classify** every ADR addendum and status paragraph (build deviation, deploy state, incident, client round) and relocate it verbatim to its new home, reformat ADRs into `docs/adr/` in parallel worktrees, rebuild the plan and keystone with evidence levels set to *what the prose actually claimed* (never upgraded), seed `DEPLOYMENT.md` from what's on disk and `CHANGELOG.md` from git history, regenerate the scripts, and write an `UPGRADE_REPORT.md` listing every relocation source → destination. IDs never change; nothing is deleted; anything unclassifiable is left in an *Unclassified (review)* row rather than guessed.

## Gap categories

- **FORMAT_MIGRATION**: The doc set is in the 1.x layout; the 2.0 migration path above applies.
- **BUDGET_EXCEEDED**: A doc is over its byte budget. The report uses the checker's verdict: `archive` or `split` is proposed with the planned parts listed, and `manual` is reported with its reason. Nothing moves until you approve.
- **MISSING_DOC**: A document that should exist for this project type is absent entirely.
- **MISSING_SECTION**: A required section within an existing document is absent.
- **OUTDATED_CONVENTION**: A section exists but uses an older format; for example, a phase block missing an exit gate or a workflow script reference.
- **MISSING_FEATURE**: A capability added in a later version of keel (such as the impeccable lifecycle table in DESIGN.md) is not present.
- **UNFILLED_PLACEHOLDER**: A generated placeholder marked `[TBD]` or `[NEEDS DECISION]` that was never filled in.
- **MISSING_SKILL**: A skill referenced in the docs (impeccable, modern-web-guidance) is not installed in the project.
