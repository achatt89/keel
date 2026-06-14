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
| [{{ADR}}]({{ADR}}) | {{STATUS}} | Architecture decision records — one per significant bet, with revisit triggers |
| [{{NFR}}]({{NFR}}) | {{STATUS}} | Non-functional requirements — targets + verification methods, build-time gates |
| [{{DESIGN_DOC}}]({{DESIGN_DOC}}) | {{STATUS}} | UX/UI design system — language, brand, tokens, components, patterns, accessibility |
| [{{COMPLIANCE}}]({{COMPLIANCE}}) | {{STATUS}} | Data protection — inventory, rights workflows, consent, retention, breach response |
| [{{EXTENSION_SPEC}}]({{EXTENSION_SPEC}}) | {{STATUS}} | {{EXTENSION_POINT}} contract — interface, lifecycle, the universal test suite |
| [{{IMPLEMENTATION_PLAN}}]({{IMPLEMENTATION_PLAN}}) | {{STATUS}} | Phased build plan with per-phase exit gates and requirement traceability |

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
5. **Operating it?** `{{RUNBOOK}}` for setup, deploy, rollback, and incident playbooks; `{{COMMANDS}}` for the command surface.
6. **Security review?** `{{ARCHITECTURE}}` (trust boundaries + accepted risks) and `{{NFR}}` (NFR-SEC, build gates); review cadence lives in `{{RUNBOOK}}`.
7. **Touching personal data?** `{{COMPLIANCE}}` — data classes, consent, retention, erasure/export.

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
| `ADR-xxx` | `{{ADR}}` | Decision record |
| `NFR-<AREA>-xxx` | `{{NFR}}` | Non-functional requirement |
| `Phase 0..N` | `{{IMPLEMENTATION_PLAN}}` | Build phase |
