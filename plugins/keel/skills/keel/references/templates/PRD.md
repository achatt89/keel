<!--
  Keel template — Product Requirements Document (PRD.md)

  What this is: The product-level *what*. Vision, personas, the headline user journey,
  the feature list (MoSCoW-prioritized with acceptance criteria), UX flows, the phased
  roadmap, non-goals, user stories, and product success metrics. The middle of the
  requirements spine (BRD → PRD → ENGINEERING_DESIGN).

  When to include: Product tier and up — whenever there are real end users and
  non-trivial scope. SKIP for a pure internal script or library (a BRD + ARCHITECTURE
  is enough there).

  Depends on: BRD (references its requirement IDs for traceability); Product Manager +
  Designer interview rounds.

  Owns (ID namespace — do not reuse elsewhere):
    F-xx   features
  References BRD requirement IDs (e.g. ING-001, RET-004) on every feature for traceability.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Product Requirements Document
## {{PROJECT_NAME}} — {{ONE_LINE_DESCRIPTOR}}

**Version:** {{VERSION}}
**Date:** {{DATE}}
**Author:** {{AUTHOR}}
**Status:** {{STATUS}}
**BRD Reference:** BRD {{BRD_VERSION}}

---

## 1. Product Vision

<!-- Keel guidance: one tight paragraph. Who it's for, what it does, and the single
     thing that makes it different from everything else in the category. No feature
     enumeration — that's §5. Echo the BRD positioning statement without copy-pasting it. -->

{{PRODUCT_VISION_PARAGRAPH}}

---

## 2. User Personas

<!-- Keel guidance: 2–4 named personas drawn from the interview's real target users.
     Each persona is a short narrative: who they are, what they're trying to do, what
     frustrates them today, and the trigger that makes them switch. Name + archetype
     (e.g. "The Builder — Omar"). If the product has a major future mode (v2 vision),
     show each persona's "after" experience in a second block. -->

### Persona 1: {{ARCHETYPE}} — {{PERSONA_NAME}}
{{PERSONA_NARRATIVE_TODAY}}

### Persona 2: {{ARCHETYPE}} — {{PERSONA_NAME}}
{{PERSONA_NARRATIVE_TODAY}}

<!-- Optional: a forward-looking vision block per persona for a v2 mode.
### Persona 1 in v2 — {{PERSONA_NAME}} and {{V2_MODE}}
{{PERSONA_NARRATIVE_FUTURE}}
-->

---

## 3. User Journey — {{PRIMARY_PERSONA_NAME}}

<!-- Keel guidance: walk the PRIMARY persona end-to-end in prose, from first contact to
     the "aha" moment. Concrete, specific, present tense. This is the emotional spine
     the features serve — name the moment the product proves its worth. One persona is
     enough; pick the one whose journey is most representative. -->

{{NARRATIVE_FROM_DISCOVERY_TO_AHA_MOMENT}}

---

## 4. Business Model

<!-- Keel guidance: include only if the product monetizes. Summarize the model at the
     PRODUCT level (what the user sees/pays), not the financial detail (that's BRD §2.5).
     Omit for internal/unmonetized tools. -->

{{PRODUCT_FACING_MODEL_SUMMARY}}

---

## 5. Feature List (MoSCoW Prioritised)

<!-- Keel guidance: the core of the PRD. Group features by USER OUTCOME (mirror the BRD's
     outcome groups). Each feature gets: a stable F-xx ID, a one-line description, a
     MoSCoW priority, the BRD requirement IDs it implements (traceability!), and
     concrete, testable acceptance criteria. Acceptance criteria are the contract — they
     must be verifiable, not aspirational. Add outcome groups to fit the product. -->

---

### Outcome: {{OUTCOME_HEADLINE}}

#### F-01 — {{Feature Name}}
One-line: {{ONE_SENTENCE_DESCRIPTION}}.
Priority: **Must** ({{BRD_REQ_IDS}})
Acceptance criteria:
- {{TESTABLE_CRITERION}}
- {{TESTABLE_CRITERION}}
- {{TESTABLE_CRITERION}}

#### F-02 — {{Feature Name}}
One-line: {{ONE_SENTENCE_DESCRIPTION}}.
Priority: **Should** ({{BRD_REQ_IDS}})
Acceptance criteria:
- {{TESTABLE_CRITERION}}

---

### Outcome: {{OUTCOME_HEADLINE}}

#### F-03 — {{Feature Name}}
One-line: {{ONE_SENTENCE_DESCRIPTION}}.
Priority: **Could** ({{BRD_REQ_IDS}})
Acceptance criteria:
- {{TESTABLE_CRITERION}}

<!-- Optional: a v2/future-mode outcome group. Mark features "Must (v2)" etc. and note
     where the supporting architecture lives (e.g. "see ARCHITECTURE.md §2.16"). -->

---

## 6. UX Flows

<!-- Keel guidance: numbered step-by-step walkthroughs of the few highest-stakes flows
     (onboarding, the core action, an admin/RBAC flow). Each flow ends with a bolded
     **Success state**. These are the screens-in-words the Designer round fleshes out in
     DESIGN.md. 3–5 flows; don't document every screen. -->

### Flow 1: {{FLOW_NAME}}
1. {{STEP}}
2. {{STEP}}
3. {{STEP}}

**Success state:** {{WHAT_DONE_LOOKS_LIKE}}.

### Flow 2: {{FLOW_NAME}}
1. {{STEP}}
2. {{STEP}}

**Success state:** {{WHAT_DONE_LOOKS_LIKE}}.

---

## 7. Product Roadmap

<!-- Keel guidance: phase the delivery. Each phase has a goal sentence and a deliverables
     list that cross-references feature IDs and BRD requirement IDs. Phase numbering here
     is the product narrative; IMPLEMENTATION_PLAN owns the build-sequence Phase 0..N
     with exit gates. Keep them aligned but don't duplicate the gate detail. -->

### Phase 1 — {{PHASE_NAME}} (v1)
Goal: {{ONE_SENTENCE_GOAL}}.
Deliverables: {{FEATURE_AND_REQ_ID_LIST}}.

### Phase 2 — {{PHASE_NAME}} (v1.5)
Goal: {{ONE_SENTENCE_GOAL}}.
Deliverables: {{FEATURE_AND_REQ_ID_LIST}}.

### Phase 3 — {{PHASE_NAME}} (v2)
Goal: {{ONE_SENTENCE_GOAL}}.
Deliverables: {{FEATURE_AND_REQ_ID_LIST}}.

---

## 8. Non-Goals (v1)

<!-- Keel guidance: deliberate product decisions NOT to build something in v1, each with
     a one-line reason and the phase it lands in (if ever). Mirror BRD §10 out-of-scope
     but framed as product choices with rationale. -->

**{{NON_GOAL_HEADLINE}}.** {{REASON_AND_WHEN_IF_EVER}}

**{{NON_GOAL_HEADLINE}}.** {{REASON_AND_WHEN_IF_EVER}}

---

## 9. User Stories

<!-- Keel guidance: "As {persona}, I want {capability}, so that {benefit}." Group by
     persona. These trace personas → features; every Must-have feature should be reachable
     from at least one story. Keep them outcome-focused, not UI-prescriptive. -->

### {{PERSONA_NAME}}
As {{PERSONA_NAME}}, I want {{CAPABILITY}}, so that {{BENEFIT}}.
As {{PERSONA_NAME}}, I want {{CAPABILITY}}, so that {{BENEFIT}}.

### {{PERSONA_NAME}}
As {{PERSONA_NAME}}, I want {{CAPABILITY}}, so that {{BENEFIT}}.

---

## 10. Success Metrics

<!-- Keel guidance: the product-level go/no-go bar, mapped to BRD §3 objectives. Each has
     a target and measurement method. Don't restate BRD business metrics verbatim —
     reference them; add product-specific ones (activation, conversion, relevance). -->

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| {{METRIC}} | {{TARGET}} | {{METHOD}} |

---

*End of PRD {{VERSION}} — {{PROJECT_NAME}}*
