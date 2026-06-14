<!--
  Keel template — Engineering Design (ENGINEERING_DESIGN.md)

  What this is: The bridge between the requirement docs and code. Design pillars, the
  core domain/isolation model, data classification, the system module map, the numbered
  non-negotiables (each with an enforcement mechanism), and the build-order rationale.
  It states the design intent an engineer must hold in their head while implementing any
  phase. Tail of the requirements spine (BRD → PRD → ENGINEERING_DESIGN).

  When to include: Product tier and up — ESPECIALLY anything with isolation, multi-
  tenancy, or data-sensitivity rules. Skip for trivial projects with no sensitive data
  and no non-obvious invariants.

  Depends on: Architect (+ Security) interview rounds; the BRD constraints/requirements
  and the PRD features.

  Owns (do not redefine elsewhere):
    C0–C3   the data classification tiers
    the numbered non-negotiables list
  Referenced by ARCHITECTURE.md, LLD.md, NFR.md, COMPLIANCE.md. Component-level detail
  lives in ARCHITECTURE.md; type/signature detail lives in LLD.md.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — Engineering Design

**Version:** {{VERSION}}
**Date:** {{DATE}}
**Author:** {{AUTHOR}}
**Status:** {{STATUS}}  <!-- e.g. Active — read before starting any implementation phase -->
**References:** BRD.md {{BRD_VERSION}}, ARCHITECTURE.md, LLD.md, NFR.md, ADR.md

---

## 1. What This Document Is

<!-- Keel guidance: one paragraph. State that this is the requirements→code bridge, name
     the central organising concept of the system (the domain/isolation model defined in
     §3), and set the precedence rule: if this and LLD.md disagree, reconcile before
     writing code. -->

{{WHAT_THIS_DOC_IS_AND_ITS_PRECEDENCE_RULE}}

---

## 2. Design Pillars

<!-- Keel guidance: the 3–5 properties that rank ABOVE feature velocity for this system.
     Each pillar: what it means in practice (concrete, mechanical), and where it's
     specified (cross-ref the owning doc/ADR). Derive from what the BRD treats as
     non-negotiable trust/cost guarantees. -->

| Pillar | What it means in practice | Where it's specified |
|---|---|---|
| **{{PILLAR}}** | {{CONCRETE_MEANING}} | {{ADR_OR_DOC_REF}} |
| **{{PILLAR}}** | {{CONCRETE_MEANING}} | {{ADR_OR_DOC_REF}} |

---

## 3. The {{CORE_DOMAIN_MODEL}}

<!-- Keel guidance: the central organising concept — the unit of isolation, provisioning,
     export, and erasure (e.g. a per-tenant container, a per-user vault, a per-account
     workspace). If the system has NO isolation/multi-tenancy dimension, replace this
     section with the system's actual core domain model and drop the boundary/ladder
     sub-sections. -->

### 3.1 Definition

<!-- Keel guidance: define the unit and enumerate exactly what it holds. State the
     invariant: nothing inside is readable/writable/inferable from outside. -->

{{DEFINITION_OF_THE_UNIT_AND_WHAT_IT_HOLDS}}

### 3.2 How the boundary is enforced — layers

<!-- Keel guidance: the boundary is not one mechanism but several mutually reinforcing
     layers, each of which can fail without breaching the boundary. One row per layer:
     mechanism + where it's specified. Tie each to an enforcement point (token, handle,
     query discipline, DB backstop, async re-verification, egress control). -->

| # | Layer | Mechanism | Specified in |
|---|---|---|---|
| 1 | **{{LAYER}}** | {{MECHANISM}} | {{DOC_REF}} |
| 2 | **{{LAYER}}** | {{MECHANISM}} | {{DOC_REF}} |

### 3.3 What is deliberately *outside* the boundary

<!-- Keel guidance: list anything intentionally cross-cutting/shared, each with a
     documented rationale and (if it's an accepted risk) a revisit trigger + ADR ref.
     "Anything else found crossing the boundary is a defect, not a trade-off." -->

- {{SHARED_THING}} — {{RATIONALE_AND_ADR_REF}}

### 3.4 {{Unit}} lifecycle

<!-- Keel guidance: provision → operate → export → erase, with what happens at each stage
     and where it's specified. Erasure and export are first-class if the product touches
     personal/regulated data (GDPR). -->

| Stage | What happens | Specified in |
|---|---|---|
| **Provision** | {{WHAT_HAPPENS}} | {{DOC_REF}} |
| **Operate** | {{WHAT_HAPPENS}} | — |
| **Export** | {{WHAT_HAPPENS}} | {{DOC_REF}} |
| **Erase** | {{WHAT_HAPPENS}} | {{DOC_REF}} |

### 3.5 Isolation hardening ladder

<!-- Keel guidance: OPTIONAL — include only if physical isolation can be raised per tier
     without rewriting the app (because all access flows through one handle). State the
     implementation rule that keeps the ladder cheap. Omit if isolation is single-level. -->

| Level | Topology | When |
|---|---|---|
| **L1** (v1) | {{TOPOLOGY}} | {{WHEN}} |
| **L2** | {{TOPOLOGY}} | {{WHEN}} |

---

## 4. Data Classification

<!-- Keel guidance: every piece of data belongs to exactly one class; destinations are
     ALLOWLISTS (anything unlisted is forbidden). C0 = operational metadata (safe for
     telemetry); higher classes = increasingly sensitive content/PII with narrower
     allowed destinations. Tailor the examples to the project's real data. State how each
     boundary is mechanically enforced. This C0–C3 scheme is owned here and referenced by
     COMPLIANCE.md and NFR-SEC. -->

| Class | Examples | Allowed destinations |
|---|---|---|
| **C0 — Operational metadata** | {{IDS_COUNTS_LATENCIES_HASHES}} | {{TELEMETRY_DB_CACHE}} |
| **C1 — {{Content class}}** | {{EXAMPLES}} | {{DESTINATIONS}} |
| **C2 — {{Sensitive/personal class}}** | {{EXAMPLES}} | {{NARROWER_DESTINATIONS}} |
| **C3 — {{Most-restricted class}}** | {{EXAMPLES}} | {{MOST_RESTRICTED_DESTINATIONS}} |

{{HOW_CLASS_BOUNDARIES_ARE_MECHANICALLY_ENFORCED}}

---

## 5. System Decomposition

<!-- Keel guidance: the module map — one row per build unit with a one-sentence contract
     (what it owns) and a pointer to the LLD section that details it. This is the summary;
     the full map lives in LLD.md §1. Tailor module names to the project's actual
     decomposition. -->

| Module | Contract | LLD |
|---|---|---|
| `{{module}}` | {{ONE_SENTENCE_CONTRACT}} | §{{N}} |
| `{{module}}` | {{ONE_SENTENCE_CONTRACT}} | §{{N}} |

---

## 6. Non-Negotiables

<!-- Keel guidance: the numbered rules that hold the pillars up. EACH ONE names its
     enforcement mechanism — a lint rule, a DB constraint/trigger, a typed interface, a
     CI gate — not "by code review." A rule whose enforcement depends on a reviewer
     noticing its absence is treated as not enforced. State the exception path explicitly
     if one exists (e.g. an audited admin bypass counted against a committed baseline).
     These are the invariants CLAUDE.md will summarize. Keep them imperative and testable. -->

1. **{{RULE}}** — enforced by {{MECHANISM}}.
2. **{{RULE}}** — enforced by {{MECHANISM}}; the only exception is {{AUDITED_EXCEPTION_PATH}}.
3. **{{RULE}}** — enforced by {{MECHANISM}}.
4. **{{RULE}}** — enforced by {{MECHANISM}}.
5. **{{RULE}}** — enforced by {{MECHANISM}}.

<!-- Keel guidance: include as many as the system genuinely needs (a sensitive platform
     may have 15+; a simple product 4–6). Don't invent rules to pad the list. -->

---

## 7. Build Order Rationale

<!-- Keel guidance: one paragraph stating the single rule the phase plan follows (e.g.
     "the boundary and its guardrails are built before anything that could leak through
     them"). Explain why the enforcement machinery / core domain model comes first, so
     the quality property holds at every commit rather than as an end-of-project
     hardening pass. Cross-ref IMPLEMENTATION_PLAN.md for the actual phases. -->

{{BUILD_ORDER_RULE_AND_WHY}}

---

*End of ENGINEERING_DESIGN.md {{VERSION}} — {{PROJECT_NAME}}*
