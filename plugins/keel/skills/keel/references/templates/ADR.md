<!--
  Keel template — ADR.md (Architecture Decision Records)

  WHAT THIS DOC IS: One record per significant technical decision — context, options
  weighed, the decision, its consequences, and the trigger that would force a rethink.
  The "why is it like this?" reference. Immutable once accepted.

  WHEN TO INCLUDE: Product tier and up — whenever the project has non-obvious technical
  bets. Even a prototype benefits from 3–5 ADRs on its hard bets. (document-catalog.md)

  DEPENDS ON: Architect (+ Security) interview rounds; the "hard bets" surfaced there.
  ARCHITECTURE.md (principles/components the decisions shape), BRD (constraints that
  bound the decisions — ADRs document reasoning, they do not relitigate product choices).

  IDS THIS DOC OWNS: ADR-xxx (zero-padded, stable forever). Referenced from nearly every
  other technical doc. Never renumber; supersede instead (see Immutability below).

  IMMUTABILITY: Accepted ADRs are immutable. To change a decision, write a NEW ADR that
  references and replaces the old one, and mark the old one "⚠️ Superseded by ADR-xxx".

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Architecture Decision Records
## {{PROJECT_NAME}}

**Project:** {{PROJECT_NAME}}
**Maintained by:** {{MAINTAINER}}
**Last updated:** {{YYYY-MM-DD}}

All decisions here derive from constraints and requirements in `BRD.md`. BRD decisions are
final — ADRs document the technical reasoning, not relitigate product choices.

> ADRs are immutable once accepted. A superseded decision gets a new ADR, not an edit.

---

## Index

<!-- Keel guidance: one row per ADR, in number order. Keep titles to "Topic — Choice"
     form ("Primary datastore — PostgreSQL"). Status is one of Proposed / Accepted / Superseded.
     Add a Date column if the project wants it; keep it consistent. -->

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| ADR-001 | {{Topic}} — {{Chosen option}} | Accepted | {{YYYY-MM-DD}} |
| ADR-002 | {{Topic}} — {{Chosen option}} | Proposed | {{YYYY-MM-DD}} |
| ADR-003 | {{Topic}} — {{Chosen option}} | ⚠️ Superseded by ADR-00X | {{YYYY-MM-DD}} |

---

<!-- Keel guidance: FILLED EXAMPLE below — generic (choice of datastore) so the shape is
     concrete. Delete it when generating; it is here only to show the per-ADR structure. -->

## ADR-001: Primary datastore — {{managed relational DB}}

**Date:** {{YYYY-MM-DD}}
**Status:** Accepted
**Deciders:** {{names / roles}}

### Context

The system needs a primary store for {{relational data + the core query path}}. This is on
the critical path of {{every request / the main workflow}}. The choice is bounded by
{{CON-xxx: the cost ceiling}} and must meet {{NFR-PERF-xxx: P95 query latency}}. {{One or two
sentences of the real situation — no more.}}

### Options considered

| Option | Pros | Cons |
|--------|------|------|
| **{{Option A}}** | {{strong managed experience; scales well}} | {{cost breaks CON-xxx; second service to operate}} |
| **{{Option B}}** | {{co-located with existing data; one connection pool; no extra cost}} | {{needs tuning; ceiling at {{scale figure}}}} |
| **{{Option C}}** | {{full control}} | {{high build + maintenance cost}} |

### Decision

**{{Option B}}.** {{One-sentence why: it is the only option inside CON-xxx and removes
cross-service latency.}} {{Optional: one or two more sentences of decisive detail.}}

### Consequences

- **Easier:** {{single backup/restore story; free joins across the data; one ops surface}}.
- **Harder:** {{connection-limit management at high concurrency; index tuning before launch}}.
- **Off the table:** {{any path requiring a purpose-built {{X}} API — all access goes through {{this store}}}}.

### Revisit trigger

{{A single, observable condition that forces re-evaluation — e.g. "a tenant exceeds {{N}}
rows and P95 breaches {{target}} after tuning." Not "if it gets slow."}}

---

<!-- Copy this block per decision -->

## ADR-{{NNN}}: {{Topic}} — {{Chosen option}}

**Date:** {{YYYY-MM-DD}}
**Status:** {{Proposed | Accepted | Superseded by ADR-xxx}}
**Deciders:** {{names / roles}}

### Context

<!-- Keel guidance: the forces in play — the requirement/constraint IDs that bound this
     (CON-xxx, NFR-xxx, RSK-xxx), what is on the critical path, what makes it non-obvious.
     Reference, do not restate, requirements that live in BRD/NFR. 2–4 sentences. -->

{{What problem, under what constraints, why now.}}

### Options considered

<!-- Keel guidance: at least two real options (a decision with one option is not a decision).
     Pros/cons in the cells; keep them terse and comparable. Bold the option name. -->

| Option | Pros | Cons |
|--------|------|------|
| **{{Option A}}** | {{...}} | {{...}} |
| **{{Option B}}** | {{...}} | {{...}} |

### Decision

<!-- Keel guidance: name the chosen option in bold, then ONE sentence stating why it wins.
     Add at most a couple of sentences of decisive detail. -->

**{{Chosen option}}.** {{One-sentence rationale.}}

### Consequences

<!-- Keel guidance: be honest about the downsides. "Harder" and "off the table" are the
     fields reviewers actually read. Each bullet a concrete effect, not a platitude. -->

- **Easier:** {{what this unlocks / simplifies}}.
- **Harder:** {{the cost you are accepting; what now needs care}}.
- **Off the table:** {{what this decision forecloses}}.

### Revisit trigger

<!-- Keel guidance: a measurable, observable condition — not a vibe. If none exists, say
     "Revisit on the next architecture review" rather than inventing a number. -->

{{The condition that would reopen this decision.}}

---

*End of ADR — {{PROJECT_NAME}}*
