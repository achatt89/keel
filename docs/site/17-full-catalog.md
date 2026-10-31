---
title: "The Full Catalog"
lead: "Every document Keel can generate, and the question it answers."
group: "Document Reference"
order: 17
slug: full-catalog
anchor: full-catalog
---

| Document | What it answers |
| --- | --- |
| AGENTS.md / CLAUDE.md | Keystone index: invariants with their enforcement and gaps, document map, two-row status, pre-PR checklist. `AGENTS.md` is canonical; `CLAUDE.md` imports it and adds Claude-specific sections. Budgeted at 12 KB. |
| BRD.md | Business requirements: the problem being solved, objectives, success metrics, constraints, and risks. |
| PRD.md | Product requirements: user personas, key journeys, feature list, scope cuts, and roadmap. |
| ENGINEERING_DESIGN.md | Design pillars, data classification policy, and non-negotiable technical constraints. |
| ARCHITECTURE.md | System components, data flows, trust boundaries, security controls, and accepted risks. |
| HLD.md / LLD.md | High- and low-level design: sequence flows, module map, API interfaces, and key types. |
| docs/adr/ | Architecture Decision Records, one table-based file per decision: Y-statement decision, options with a verdict, consequences, revisit trigger, lifecycle status with commits. `adr/README.md` is the index and the open-decisions register. |
| NFR.md | Non-functional requirements: performance, security, cost, and scalability targets, each with a concrete verification method. |
| DESIGN.md | UX and UI design system: tokens, component patterns, accessibility requirements, and brand feel. Generated only if the project has a UI. |
| COMPLIANCE.md | Data protection obligations, retention schedules, consent requirements, and lawful basis for processing. Generated only if the project holds sensitive data. |
| THREAT_MODEL.md | Threat register with mitigations wired into the architecture. Each threat points to where it was fixed. Generated only if the project holds sensitive data or was threat-modeled. |
| IMPLEMENTATION_PLAN.md | Phased build plan with concrete exit gates: the sequence in which Claude Code (or a human team) should build the system. |
| COMMANDS.md | How to run the project: dev server, build, test, migrate, seed, and any environment-specific variations. |
| DEPLOYMENT.md | Every environment in one place: env matrix, promotion path and gates, build-time vs runtime config, pre/post-deploy checklists, rollback, deploy log, known gotchas. |
| CHANGELOG.md | What shipped, in what deploy state — one line per Phase or Change, Keep-a-Changelog layout, fed by doc-sync. |
| RUNBOOK.md | How to operate and recover the system: incident playbooks as Symptom · Check · Fix · Escalate tables, monitoring, drills, and the postmortem register. |
| FEEDBACK_ROUNDS.md | External feedback batches (client, founder, user tests) and where each item went — a Phase, a Change, or a deferred row. Generated for client-facing products. |
| SPIKE_\<slug>.md / AUDIT_\<kind>_\<date>.md / COST_ANALYSIS.md | On-demand records: an investigation (what exists, what doesn't, negative-result searches), a dated audit snapshot with disposition, and measured unit economics with the methodology to reproduce them. |
| docs/keel-transcript.md | The interview itself, kept with the docs it produced. |
| almanac/ | Optional topology-stable knowledge base: positioning, methodology, go-to-market strategy, AI training data. Useful for products with strong editorial or brand dimensions. |
| docs/\<name>/ | Parts of a doc that outgrew its size budget (for example `docs/design/01-foundations.md`). The parent doc becomes an index linking every part; each part links back. Created by doc-sync or `/keel upgrade`, never at the start unless a generated doc is already over budget. |
| .claude/agents/*.md | Repo-local subagents for the doc-sync, security and design roles, only where the project has no full-time agent for the role. Each ends with the fixed Report block it returns to its caller. |
| PHASE_ARCHIVE.md | Relocated detail for finished or superseded work — completed phases, resolved deferred items, superseded decisions. Created by `/keel archive` or by doc-sync's automatic budget trigger, never at initial generation. |
