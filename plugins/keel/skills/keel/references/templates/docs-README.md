<!--
  Keel template — docs/README.md (documentation index)
  WHAT: A catalog of every doc in docs/ with a status badge and a one-line description,
        plus a per-persona reading order and a note on ID conventions.
  INCLUDE WHEN: docs/ holds 3+ files — once the folder needs a map. Below that, the
        CLAUDE.md document map is enough; omit this file.
  DEPENDS ON: All docs (written last, alongside CLAUDE.md, so it lists only what exists).
  OWNS: No IDs. It is the docs index — every other doc owns its own namespace.
  Delete all <!-- Keel guidance --> comments (and this block) when filling this in.
-->

# {{PROJECT_NAME}} — Docs Index

> All product and technical documentation for {{PROJECT_NAME}}.

---

## Documents

<!-- Keel guidance: one row per file that exists on disk — no more, no less (the
     CLAUDE.md document map and this table must agree). Status badge from the
     conventions set: ✅ complete · 🔄 in progress · ⬜ not started · ⚠️ superseded.
     Description is one line: the doc's job, not its contents. Order by reading
     dependency (requirements spine → technical → experience → operational → index). -->

| File | Status | Description |
|------|--------|-------------|
| [{{BRD}}]({{BRD}}) | {{STATUS}} | Business requirements — problem, objectives, requirements, constraints, risk register |
| [{{PRD}}]({{PRD}}) | {{STATUS}} | Product requirements — personas, features, user stories, acceptance criteria |
| [{{ENGINEERING_DESIGN}}]({{ENGINEERING_DESIGN}}) | {{STATUS}} | Design pillars, the core domain model, data classification, the non-negotiables |
| [{{ARCHITECTURE}}]({{ARCHITECTURE}}) | {{STATUS}} | Components, schema, trust boundaries, controls by threat category, accepted risks |
| [{{HLD}}]({{HLD}}) | {{STATUS}} | High-level design — component interactions, end-to-end data flows, deployment topology |
| [{{LLD}}]({{LLD}}) | {{STATUS}} | Low-level design — module map, interfaces, shared types, security-module implementations |
| [adr/](adr/README.md) | {{STATUS}} | Architecture decision records — one file per decision (`ADR-NNN-slug.md`), index + open decisions in `adr/README.md` |
| [{{NFR}}]({{NFR}}) | {{STATUS}} | Non-functional requirements — targets + verification methods, build-time gates |
| [{{DESIGN_DOC}}]({{DESIGN_DOC}}) | {{STATUS}} | UX/UI design system — language, brand, tokens, components, patterns, accessibility |
| [{{COMPLIANCE}}]({{COMPLIANCE}}) | {{STATUS}} | Data protection — inventory, rights workflows, consent, retention, breach response |
| [{{EXTENSION_SPEC}}]({{EXTENSION_SPEC}}) | {{STATUS}} | {{EXTENSION_POINT}} contract — interface, lifecycle, the universal test suite |
| [{{IMPLEMENTATION_PLAN}}]({{IMPLEMENTATION_PLAN}}) | {{STATUS}} | Phased build plan — exit gates with evidence, Changes table, deferred items, requirement traceability |
| [{{DEPLOYMENT}}]({{DEPLOYMENT}}) | {{STATUS}} | Environment matrix, promotion path, build-time vs runtime config, checklists, rollback, **deploy log** |
| [{{CHANGELOG}}]({{CHANGELOG}}) | {{STATUS}} | What shipped, in what deploy state — one line per unit of work, Keep-a-Changelog |
| [{{FEEDBACK_ROUNDS}}]({{FEEDBACK_ROUNDS}}) | {{STATUS}} | *(optional)* External feedback batches and where each item went |
| [{{COST_ANALYSIS}}]({{COST_ANALYSIS}}) | {{STATUS}} | *(optional)* Measured unit economics from real telemetry, formula, methodology, revisit trigger |
| `SPIKE_<slug>.md` | — | *(on demand)* Investigation snapshots — what exists, what doesn't, negative-result searches |
| `AUDIT_<kind>_<date>.md` | — | *(on demand)* Dated audit snapshots — scores, P0/P1/P2, systemic patterns, disposition |
| [PHASE_ARCHIVE.md](PHASE_ARCHIVE.md) | — | *(once `/keel archive` has run)* Relocated detail — finished phases, old releases, closed postmortems |

---

## Reading order

<!-- Keel guidance: route by persona — the question someone arrives with, then the doc
     order that answers it. Keep the personas below that the project actually has; drop
     "security review" if there's no security surface, "operating" if nothing is
     deployed. Reference docs by file + section where structure matters. -->

1. **New to the project?** Start with `{{BRD}}` — the problem, positioning, and all requirements.
2. **Building a feature?** `{{ENGINEERING_DESIGN}}` → `{{IMPLEMENTATION_PLAN}}` (current phase + exit gates) → `{{LLD}}` for the modules in scope.
3. **Building UI?** `{{DESIGN_DOC}}` — the design system: tokens, components, patterns, per-surface rules.
4. **Designing the system?** `{{HLD}}` → `{{ARCHITECTURE}}` → `{{LLD}}`.
5. **Deploying it?** `{{DEPLOYMENT}}` — the environment matrix, promotion gates, pre/post-deploy checklists, rollback, deploy log; `{{COMMANDS}}` for the exact commands.
6. **Operating it?** `{{RUNBOOK}}` for incident playbooks, monitoring, backup/recovery, postmortems; `{{COMMANDS}}` for seed/test-data and data-reconciliation commands.
7. **What shipped, and is it live?** `{{CHANGELOG}}` — every merged unit with its deploy-state tag; `{{DEPLOYMENT}}` §7 for the deploy that made it so.
8. **Something broke in production?** `{{RUNBOOK}}` playbooks first; afterwards a `PM-xxx` row in its Postmortems table — never an ADR addendum.
9. **Feedback came in?** `{{FEEDBACK_ROUNDS}}` — log the round, triage each item into a Phase / Change / deferred row.
10. **Need a fact nobody has pinned down?** Write a `SPIKE_<slug>.md` before scoping the phase.
11. **Security review?** `{{ARCHITECTURE}}` (trust boundaries + accepted risks) and `{{NFR}}` (NFR-SEC, build gates); review cadence lives in `{{RUNBOOK}}`.
12. **Touching personal data?** `{{COMPLIANCE}}` — data classes, consent, retention, erasure/export.

---

## ID conventions

<!-- Keel guidance: a short note on who owns what ID namespace so cross-references stay
     resolvable. Each doc owns one namespace; IDs are stable once assigned. Full rules
     live in the conventions reference — this is just the at-a-glance map. -->

Each document **owns** an ID namespace; IDs are stable once assigned (retire with a
tombstone, never renumber). Cross-reference by ID for requirements/decisions/features
(`{{REQ_PREFIX}}-001`, `ADR-014`) and by doc + section for structure (`{{ARCHITECTURE}} §6`).

| Namespace | Owner | Example |
|---|---|---|
| `{{OBJECTIVE_PREFIX}}-xx` | `{{BRD}}` | Business objective |
| `{{REQ_PREFIX}}-xxx` | `{{BRD}}` | Requirement (grouped by outcome) |
| `F-xx` | `{{PRD}}` | Feature |
| `ADR-xxx` | `adr/ADR-xxx-slug.md` | Decision record |
| `NFR-<AREA>-xxx` | `{{NFR}}` | Non-functional requirement |
| `Phase 0..N` | `{{IMPLEMENTATION_PLAN}}` | Build phase (gated milestone) |
| `CHG-xxx` | `{{IMPLEMENTATION_PLAN}}` Changes table | Hotfix-weight unit of work |
| `PM-xxx` | `{{RUNBOOK}}` Postmortems | Incident record |
| `FR-xx` / `FR-xx.n` | `{{FEEDBACK_ROUNDS}}` | Feedback round / item |
| `vNN` | `{{CHANGELOG}}` / `{{DEPLOYMENT}}` §7 | Release / deploy |
