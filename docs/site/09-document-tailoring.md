---
title: "Document Tailoring"
lead: "Keel does not stamp out the same fifteen files every time. It proposes a doc set matched to your project's real complexity."
group: "How It Works"
order: 9
slug: document-tailoring
anchor: document-tailoring
---

## By ambition tier

- **Weekend prototype:** `CLAUDE.md` + `README`, possibly a lightweight PRD if the idea needs clarifying before building.
- **Product / MVP:** full requirements suite (`BRD`, `PRD`), architecture, engineering design, and an implementation plan with concrete exit gates.
- **Platform / regulated:** everything above plus `NFR`, `COMPLIANCE`, `THREAT_MODEL`, `RUNBOOK`, and optionally an `almanac/` knowledge base.

## Cross-references and stable IDs

Every document is generated with stable requirement IDs (e.g., `REQ-001`, `ADR-003`). When a requirement from the BRD drives a design decision in the architecture, the architecture document references the requirement ID, not a paraphrase of its content. This means the doc set stays coherent as individual documents evolve.

> One fact, one home. If you update a requirement in the BRD, you know exactly which other documents reference it and need to be reviewed.
