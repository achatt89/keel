---
title: "Why Keel?"
lead: "Five decisions shape everything Keel writes: it interviews first, scopes to the project, keeps each fact in one place, can harden the design before you code and writes for Claude Code."
group: "Introduction"
order: 2
slug: why-keel
anchor: why-keel
---

- **Interview first.** Keel never writes a document from a one-line idea. The questions are the work: they surface what you have not thought through yet.
- **Scope to the project.** A weekend prototype and a regulated multi-tenant platform need different documents. Keel proposes only the ones your project needs, and tells you what it is leaving out and why.
- **One fact, one home.** Nothing is copied between documents. Each fact lives once, and every document that depends on it refers to it by a stable requirement ID.
- **Hardened before you code.** Keel can run an adversarial pass over the documents it has just written and fix the weaknesses in them, adding controls, security requirements and decision records, instead of noting a risk to deal with later.
- **Written for Claude Code.** The documents are the source of truth for the build. AGENTS.md is the keystone index and CLAUDE.md imports it. Every other document hangs off it by a stable reference.

## When to use Keel

Use Keel at the start, before you have written code, chosen a stack or settled on a structure. It also works on a project that grew without a spec, where the foundations have to be written down after the fact.

Keel does not replace keeping documents current, planning the work or operating the thing in production. It writes the first version of each of those documents, and then they are yours to keep.
