---
title: "The Interview"
lead: "Keel conducts a staged multi-persona interview before writing a single document. Each persona adapts every question to what was just said; it challenges weak assumptions instead of transcribing them."
group: "How It Works"
order: 8
slug: the-interview
anchor: the-interview
---

- **Phase 0**: **Intake:** reflect the idea back, agree how far the project goes (Prototype, MVP or Platform), and set expectations for the session ahead.
- **Phase 1**: **Business Analyst:** the real problem, who pays, why now, and what success looks like in concrete metrics.
- **Phase 2**: **Product Manager:** user personas, key journeys, the MVP cut, and what is explicitly out of scope.
- **Phase 3**: **Architect:** stack choice, data model, integrations, and the hard technical bets that will be difficult to reverse later.
- **Phase 4**: **Security and Compliance:** data sensitivity, tenancy model, authentication approach, and regulatory exposure.
- **Phase 5**: **Designer:** surfaces, key user flows, tone, accessibility needs, and brand feel (only if the project has a UI).
- **Phase 6**: **Delivery and Operations:** phasing, deployment environment, git workflow, worktree parallelism, doc-sync strategy, and how a stuck build task should be handled.

**Team answers (opt-in).** By default one person answers every round. In Phase 0 you can instead hand rounds to your team: Keel names an owner, asks who answers each round and who settles disagreements, and writes one packet file per round under `.keel/rounds/`. Each person runs `/keel answer` on their packet, or types into the file. Every answer is marked as given by a person or by Claude, and a person can overrule a Claude answer while the original is kept. A question is open by default; the owner can make it blind, so nobody sees the other answers until everyone named has answered or the owner closes it. `/keel merge` then lists gaps and disagreements with both sides quoted, and the person the owner chose settles each one. A Claude answer never settles a disagreement. A small checker flags anything in a packet that looks like a key or a password, and for a public repository Keel offers to keep `.keel/rounds/` out of git. Details are in the "Team answers" section of the [Roadmap](./19-roadmap.md) page.
