---
title: "Document Tailoring"
lead: "Every project gets every document type. Keel matches each document's depth to your project, and a type that does not apply yet is a short stub that says why."
group: "How It Works"
order: 9
slug: document-tailoring
anchor: document-tailoring
---

## Every type, in full or as a stub

Keel writes every document type for every project. How far the project goes decides which ones are written in full:

- **Prototype:** `AGENTS.md` and `CLAUDE.md`, a short `BRD` and `ARCHITECTURE`, decision records, the implementation plan, the changelog and the interview transcript.
- **MVP:** everything above plus `PRD`, engineering design, `HLD`, `LLD`, `NFR`, `COMMANDS`, `DEPLOYMENT` and `RUNBOOK` where they apply, and `DESIGN` if there is a UI.
- **Platform:** everything above plus `COMPLIANCE`, `THREAT_MODEL`, extension contracts and, where it helps, an `almanac/` knowledge base.

Every other type is a **stub**: a short file at the usual path that says why it does not apply yet, what would make it apply, and where those facts live for now. A prototype run from a laptop, for example, gets a `DEPLOYMENT.md` stub that quotes your answer ("no remote environment") and says to write the full document once the project deploys. During the interview Keel shows every type as full or stub, with the reason, and you can change any of them.

`/keel check` reports a stub whose reason no longer holds, for example a `Dockerfile` appearing next to a `DEPLOYMENT.md` stub. `/keel upgrade` offers stubs for any type an older project is missing.

## Cross-references and stable IDs

Every document is generated with stable requirement IDs (e.g., `REQ-001`, `ADR-003`). When a requirement from the BRD drives a design decision in the architecture, the architecture document references the requirement ID, not a paraphrase of its content. This means the doc set stays coherent as individual documents evolve.

> One fact, one home. If you update a requirement in the BRD, you know exactly which other documents reference it and need to be reviewed.
