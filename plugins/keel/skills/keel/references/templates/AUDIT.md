<!--
  Keel template — AUDIT.md (dated quality snapshot)
  FILE NAME: docs/AUDIT_<kind>_<YYYY-MM-DD>.md — kind ∈ {UI, SECURITY, A11Y, PERF, DOCS, …}.
  WHAT: The findings of one audit pass at one point in time — scored dimensions, findings
        by severity, what is worth preserving, the systemic patterns behind the findings,
        and where each finding went (a phase, a change, a deferred row). A snapshot, never
        edited after the fact; a later audit is a new file.
  INCLUDE WHEN: any structured review produces more than a handful of findings — an
        `/impeccable audit` sweep, an external pen test, a pre-launch review, a docs
        staleness sweep.
  DEPENDS ON: the thing audited; DESIGN.md / NFR.md / THREAT_MODEL.md for the bar being
        measured against.
  OWNS: finding IDs `{{KIND}}-P0-nn / -P1-nn / -P2-nn` within this file. Disposition rows
        reference IDs owned elsewhere (Phase N, CHG-xxx, deferred row).
  KEY RULE: every finding has a disposition before the audit is called done. An audit whose
        findings evaporate into "noted" was a cost, not an investment.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{KIND}} Audit — {{YYYY-MM-DD}}

**Scope:** {{what was audited — routes / screens / modules / docs, at commit `{{abc1234}}`}}
**Method:** {{`/impeccable audit apps/web` + manual pass in {{browser}} at {{widths}} / external pen test by {{firm}} / …}}
**Bar:** {{DESIGN.md §10 WCAG 2.2 AA; NFR-PERF-00x; THREAT_MODEL.md}}
**Auditor:** {{role / tool}} · **Status:** {{Complete — all findings dispositioned in §7}}

---

## 1. Dimension scores

<!-- Keel guidance: 0–4 per dimension per area. The table is the executive summary; the
     narrative is below. Keep dimensions consistent across audits of the same kind so they
     compare. -->

| Area | {{Hierarchy}} | {{A11y}} | {{Responsive}} | {{Performance}} | {{Copy}} | Overall |
|---|---|---|---|---|---|---|
| {{Dashboard}} | {{3}} | {{2}} | {{3}} | {{4}} | {{3}} | {{3.0}} |
| {{Onboarding}} | {{2}} | {{1}} | {{2}} | {{3}} | {{2}} | {{2.0}} |

---

## 2. P0 — Blocking

<!-- Keel guidance: ships nothing until fixed. Each: where, what, how to reproduce, the
     rule it breaks. -->

| ID | Where | Finding | Repro | Breaks |
|---|---|---|---|---|
| {{KIND}}-P0-01 | `{{apps/web/src/routes/Checkout.tsx:88}}` | {{submit button unreachable by keyboard}} | {{Tab from card field → focus skips to footer}} | {{DESIGN §10.2}} |

## 3. P1 — Major

| ID | Where | Finding | Repro | Breaks |
|---|---|---|---|---|
| {{KIND}}-P1-01 | {{…}} | {{…}} | {{…}} | {{…}} |

## 4. P2 — Minor

| ID | Where | Finding | Breaks |
|---|---|---|---|
| {{KIND}}-P2-01 | {{…}} | {{…}} | {{…}} |

---

## 5. Positive findings — worth preserving / replicating

<!-- Keel guidance: what is already right, so a fix pass doesn't regress it and new work
     copies it. -->

- {{Empty states on Jobs/Candidates follow DESIGN §6.4 exactly — reuse the pattern for Reports.}}
- {{…}}

## 6. Systemic patterns — fix once, not per file

<!-- Keel guidance: the root causes behind clusters of findings. One fix here closes many
     rows above. Name the mechanism and the single place to fix it. -->

| Pattern | Findings it explains | Fix once at |
|---|---|---|
| {{Buttons built ad hoc instead of from `<Button>`}} | {{P0-01, P1-03, P1-07, P2-02}} | {{`packages/ui/Button` + lint rule banning raw `<button>` in routes}} |
| {{…}} | {{…}} | {{…}} |

---

## 7. Disposition

<!-- Keel guidance: every finding ID appears exactly once. "Won't fix" is a valid disposition
     with a reason and an owner. -->

| Finding | Disposition | Ref | Owner |
|---|---|---|---|
| {{KIND}}-P0-01 | fix now | CHG-{{xxx}} | {{engineering}} |
| {{KIND}}-P1-01 | scheduled | Phase {{N}} | {{engineering}} |
| {{KIND}}-P2-01 | deferred | IMPLEMENTATION_PLAN deferred row | {{engineering}} |
| {{KIND}}-P2-02 | won't fix — {{reason}} | — | {{founder}} |

---

*End of AUDIT_{{KIND}}_{{YYYY-MM-DD}}.md — {{PROJECT_NAME}}*
