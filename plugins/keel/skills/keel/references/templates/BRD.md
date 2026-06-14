<!--
  Keel template — Business Requirements Document (BRD.md)

  What this is: The business-level *why* and *what*. Problem, objectives, market
  positioning, business requirements grouped by outcome, constraints, assumptions,
  success metrics, out-of-scope, and the risk register. It is the head of the
  requirements spine (BRD → PRD → ENGINEERING_DESIGN); everything downstream traces
  back to an ID owned here.

  When to include: ALWAYS (scaled to tier). Lite for prototypes — keep Executive
  Summary, Problem, Objectives, Constraints, and a handful of Risks; drop Business
  Model, Market Positioning, Stakeholder Map, Feature Parity, and the v2-only
  requirement groups. Full for product/platform tiers.

  Depends on: the Business Analyst interview round.

  Owns (ID namespaces — do not reuse elsewhere):
    BO-xx        business objectives
    <GROUP>-xxx  requirements, grouped by outcome (pick 3–4-letter prefixes from the
                 project's OWN domain, e.g. AUTH-, ING-, SEC-; define them in §6)
    CON-xxx      constraints
    A-xx         assumptions
    RSK-xxx      risks (mirrored in ARCHITECTURE.md §9 accepted-risk register)

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Business Requirements Document
## {{PROJECT_NAME}} — {{ONE_LINE_DESCRIPTOR}}

**Version:** {{VERSION}}
**Date:** {{DATE}}
**Author:** {{AUTHOR}}
**Status:** {{STATUS}}  <!-- e.g. Draft — Pending Review -->

---

## 1. Executive Summary

<!-- Keel guidance: 3–6 short paragraphs in the founder's own framing. Lead with the
     pain, name the product, state what it does in one sentence, then one concrete
     "ask it for X, it does Y" example. Close with a line for the builder/buyer
     audience if there is one. No feature lists here — that's the PRD. -->

{{PROBLEM_IN_THE_USER_S_WORDS}}

**{{PROJECT_NAME}} {{WHAT_IT_DOES_IN_ONE_SENTENCE}}.**

{{CONCRETE_EXAMPLE_OF_THE_PRODUCT_IN_ACTION}}

---

## 2. The Problem

<!-- Keel guidance: name the 2–4 distinct frustrations the product attacks, each as a
     bolded one-liner + a short paragraph. Derive from the interview's pain points.
     End with the cost of the status quo — what is wasted/lost today. -->

**{{FRUSTRATION_1_HEADLINE}}**
{{FRUSTRATION_1_DETAIL}}

**{{FRUSTRATION_2_HEADLINE}}**
{{FRUSTRATION_2_DETAIL}}

The result: {{COST_OF_THE_STATUS_QUO}}.

---

## 2.5 Business Model

<!-- Keel guidance: include ONLY if the product charges money or has a defined
     monetization model. Describe what each revenue mechanism covers and what drives
     variable cost. If pricing is unvalidated, say so with [ASSUMPTION] — do not invent
     numbers the interview didn't establish. Omit this whole section for internal tools
     or unmonetized prototypes. -->

{{REVENUE_MODEL_SUMMARY}}

- {{WHAT_THE_SUBSCRIPTION_OR_BASE_COVERS}}
- {{WHAT_DRIVES_VARIABLE_OR_USAGE_COST}}

> [ASSUMPTION] {{PRICING_HYPOTHESES_PENDING_VALIDATION}}

---

## 3. Business Objectives

<!-- Keel guidance: 4–8 outcomes the business must achieve, each with a *measurable*
     success metric and how it's measured. Each BO-xx is referenced downstream
     ("implements BO-01"). Don't pad — one objective per genuine business goal. -->

| ID | Objective | Success Metric | Measurement |
|----|-----------|----------------|-------------|
| BO-01 | {{OBJECTIVE}} | {{TARGET}} | {{HOW_MEASURED}} |
| BO-02 | {{OBJECTIVE}} | {{TARGET}} | {{HOW_MEASURED}} |
| BO-03 | {{OBJECTIVE}} | {{TARGET}} | {{HOW_MEASURED}} |

---

## 4. Market Positioning & Competitive Differentiation

<!-- Keel guidance: include for product/platform tiers; omit or compress for prototypes.
     Name the category and the primary incumbent to benchmark against. Be honest about
     what the incumbent does well, then the gap you exploit. Use a gap-vs-response
     table. End with a one-line positioning statement and the target-user breakdown. -->

### The Category
{{CATEGORY_AND_PRIMARY_INCUMBENT}}

### What {{INCUMBENT}} Does Well
- {{INCUMBENT_STRENGTH}}

### Where {{INCUMBENT}} Stops — Where {{PROJECT_NAME}} Starts

| Gap in {{INCUMBENT}} | What {{PROJECT_NAME}} Does |
|----------------------|----------------------------|
| {{GAP}} | {{RESPONSE}} |

### Positioning Statement
> *{{ONE_LINE_POSITIONING_STATEMENT}}*

### Target Users
- **Primary (v1):** {{PRIMARY_USERS}}
- **Secondary (v2):** {{SECONDARY_USERS}}

---

## 5. Stakeholder Map

<!-- Keel guidance: everyone with an interest in the outcome — owner, paying users,
     external dependencies, gatekeepers, infra providers. Capture their primary
     interest so later trade-offs name who they affect. -->

| Stakeholder | Role | Primary Interest |
|-------------|------|------------------|
| {{NAME_OR_GROUP}} | {{ROLE}} | {{INTEREST}} |

---

## 6. Business Requirements

<!-- Keel guidance: the core of the BRD. Group requirements by USER OUTCOME, not by
     component. Pick a 3–4-letter prefix per group from the project's domain and define
     it here once (e.g. "ING — Ingestion", "AUTH — Authentication"). Every row gets a
     stable zero-padded ID and a MoSCoW priority (Must / Should / Could / Won't). These
     IDs are referenced by PRD features and IMPLEMENTATION_PLAN phases — they are the
     traceability backbone. Add or remove groups to fit the domain. -->

### {{GRP}} — {{Group Name}} Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| {{GRP}}-001 | {{REQUIREMENT}} | Must |
| {{GRP}}-002 | {{REQUIREMENT}} | Must |
| {{GRP}}-003 | {{REQUIREMENT}} | Should |

### {{GRP2}} — {{Group Name}} Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| {{GRP2}}-001 | {{REQUIREMENT}} | Must |
| {{GRP2}}-002 | {{REQUIREMENT}} | Could |

### SEC — Security & Trust Requirements

<!-- Keel guidance: include whenever the product holds user/personal/regulated data.
     These are BUSINESS requirements (they protect trust or the cost envelope), not
     implementation detail — point to ARCHITECTURE/LLD/NFR for the "how". Drop for
     trivial throwaway prototypes with no sensitive data. -->

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-001 | {{ISOLATION_OR_ACCESS_GUARANTEE}} | Must |
| SEC-002 | {{BUILD_TIME_ENFORCEMENT_OF_INVARIANTS}} | Must |

> Note on any cross-cutting rule (e.g. role model, admin scope): state it once here and
> reference the owning ADR. {{CROSS_CUTTING_NOTE}}

---

## 7. Constraints

<!-- Keel guidance: hard boundaries that dictate technical choices — cost ceilings,
     runtime mandates, regulatory limits, ToS limits. State the constraint AND its
     explicit downstream impact (what it forces or forbids), so architecture decisions
     can cite it. -->

| ID | Constraint | Explicit Impact on Technical Decisions |
|----|-----------|----------------------------------------|
| CON-001 | {{CONSTRAINT}} | {{WHAT_IT_FORCES_OR_ELIMINATES}} |
| CON-002 | {{CONSTRAINT}} | {{WHAT_IT_FORCES_OR_ELIMINATES}} |

---

## 8. Assumptions

<!-- Keel guidance: things taken as true but not yet proven, each one a thing that, if
     wrong, changes the design. Mark with [ASSUMPTION] in prose elsewhere when referenced.
     Do not invent scale/cost figures the interview didn't give — flag them as unvalidated. -->

| ID | Assumption |
|----|-----------|
| A-01 | {{ASSUMPTION}} |
| A-02 | {{ASSUMPTION}} |

---

## 9. Success Metrics

<!-- Keel guidance: the measurable bar for "did this work." Each metric has a target and
     a measurement method. These feed PRD success metrics and IMPLEMENTATION_PLAN exit
     gates — keep them consistent (one home: this table). -->

| Metric | Target | How Measured |
|--------|--------|-------------|
| {{METRIC}} | {{TARGET}} | {{METHOD}} |

---

## 10. Out of Scope — v1

<!-- Keel guidance: explicit non-goals for the first release, each a deliberate decision.
     Pull from the interview's "not now" list. These prevent scope creep and become PRD
     non-goals. -->

- {{OUT_OF_SCOPE_ITEM}}
- {{OUT_OF_SCOPE_ITEM}}

---

## 11. Risk Register

<!-- Keel guidance: every material risk with likelihood, impact, mitigation, and owner.
     Append-only — grow this list downward, never delete; mark resolved/retired with a
     date. Accepted residual risks (the team chooses to live with them) are mirrored in
     ARCHITECTURE.md §9 with a revisit trigger; mark them "**Accepted residual risk**"
     and cite the ADR. -->

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|-----------|--------|-----------|-------|
| RSK-001 | {{RISK}} | {{High/Med/Low}} | {{High/Med/Low}} | {{MITIGATION}} | {{OWNER}} |
| RSK-002 | {{RISK}} | Low | High | **Accepted residual risk** (see ADR-xxx). {{RATIONALE_AND_REVISIT_TRIGGER}} | {{OWNER}} |

---

## 12. Feature Parity Roadmap vs. {{INCUMBENT}}

<!-- Keel guidance: OPTIONAL — include only when positioning directly against a named
     incumbent. Maps each of their notable features to your version and target release.
     Omit if there's no single benchmark competitor. -->

| {{INCUMBENT}} Feature | {{PROJECT_NAME}} Version | Notes |
|-----------------------|--------------------------|-------|
| {{FEATURE}} | v1 / v2 | {{NOTE}} |

---

## 13. Dependencies

<!-- Keel guidance: external services, infrastructure, and libraries the product relies
     on, with a note on why/how. These resurface in ARCHITECTURE and COMMANDS env vars. -->

| Dependency | Type | Notes |
|-----------|------|-------|
| {{DEPENDENCY}} | Infrastructure / External / Library | {{NOTE}} |

---

*End of BRD {{VERSION}} — {{PROJECT_NAME}}*
