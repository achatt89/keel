<!--
  Keel template — SPIKE.md (investigation / deep-dive record)
  FILE NAME: docs/SPIKE_<slug>.md — one per investigation, dated inside.
  WHAT: The written result of a time-boxed investigation into a question the docs can't
        answer yet ("can we do sub-tenants on this schema?", "why is P95 spiking?"). It
        records what EXISTS (with file:line), what DOES NOT, the structural constraints
        that will actually bite, and — crucially — the searches that found nothing, so
        nobody repeats them.
  INCLUDE WHEN: on demand, before scoping a phase whose shape depends on facts about the
        codebase or the world that nobody has pinned down. Not for decisions (that's an
        ADR) and not for plans (that's IMPLEMENTATION_PLAN).
  DEPENDS ON: the codebase; ARCHITECTURE/LLD for what was intended.
  OWNS: nothing. Its output is a decision checklist that feeds ADRs and a phase scope.
  KEY RULE: claims cite a location or a command. "It seems like" is not a finding.
        A spike is a snapshot — it does not get updated; a later spike supersedes it.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Spike — {{Question in one line}}

**Date:** {{YYYY-MM-DD}} · **Time-box:** {{N hours}} · **Author:** {{role}}
**Status:** {{Complete — findings feed Phase N scoping / Superseded by SPIKE_<slug>}}
**Prompted by:** {{FR-xx / deferred item / [NEEDS DECISION] in <doc>:line}}

---

## 1. Question

<!-- Keel guidance: the exact question, and what a "yes" or "no" would change. -->

{{What we need to know, and which decision or phase is blocked on the answer.}}

## 2. What exists

<!-- Keel guidance: only things you actually found, each with a location. Table, not prose. -->

| Thing | Where | What it does today | Relevant because |
|---|---|---|---|
| {{tenant boundary}} | `{{packages/data/src/tenant.ts:42}}` | {{scopes every query by tenant_id}} | {{sub-tenants need a second key}} |
| {{…}} | `{{file:line}}` | {{…}} | {{…}} |

## 3. What does not exist

<!-- Keel guidance: the gaps — stated as absences you verified (see the appendix), not
     as guesses. -->

| Missing | Verified how | Consequence |
|---|---|---|
| {{no parent_tenant_id anywhere in schema}} | appendix A-1 | {{hierarchy must be added, not exposed}} |
| {{…}} | {{A-n}} | {{…}} |

## 4. Structural constraints — what will actually bite

<!-- Keel guidance: the 2–5 things that make the naive approach wrong. Each one names the
     mechanism, not a feeling. -->

1. {{Constraint — e.g. RLS policies key on a single session variable; a two-level hierarchy needs either a second variable or a materialised path.}}
2. {{…}}

## 5. Related open items already tracked

| Item | Where | Relationship |
|---|---|---|
| {{deferred row / NEEDS DECISION}} | `{{IMPLEMENTATION_PLAN.md#deferred}}` | {{resolved by / blocked by this spike}} |

## 6. Decision checklist before any implementation

<!-- Keel guidance: the questions a phase scope must answer, each destined for an ADR.
     Tag the decider. -->

- [ ] {{Question 1}} — decider: {{founder / engineering / legal}} → ADR-{{reserved}}
- [ ] {{Question 2}} — decider: {{…}}

## 7. Reference map

{{Docs and sections a reader should have open: ARCHITECTURE §n, LLD §n, ADR-xxx, COMPLIANCE §n.}}

---

## Appendix A — negative-result searches

<!-- Keel guidance: every grep / query / API call that returned NOTHING, verbatim, so the next
     person doesn't re-run it. This appendix is the difference between "I don't think we have
     that" and "we do not have that". -->

| # | Search | Scope | Result |
|---|---|---|---|
| A-1 | `grep -rn "parent_tenant" packages/ apps/ migrations/` | repo @ `{{abc1234}}` | 0 hits |
| A-2 | `{{SELECT … FROM information_schema.columns WHERE column_name LIKE '%parent%'}}` | staging DB | 0 rows |
| A-3 | {{vendor docs search: "sub-account"}} | {{provider}} docs {{YYYY-MM-DD}} | not offered |

---

*End of SPIKE_{{slug}}.md — {{PROJECT_NAME}}*
