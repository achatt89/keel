<!--
  Keel template — HLD.md (High-Level Design)
  =================================================================
  WHAT THIS DOC IS:
    The visual/flow elaboration of ARCHITECTURE.md: a system overview, an ASCII
    component-interaction diagram, the end-to-end data flows traced step-by-step
    with interim state, an integration-touchpoints table with failure modes, and
    the deployment topology. It answers "how do the pieces move data between
    them" — narrative where ARCHITECTURE is reference.

  WHEN TO INCLUDE (catalog adaptivity trigger):
    Product tier and up, OPTIONAL. Include when the system has several interacting
    components/services and the end-to-end data flow is not obvious from
    ARCHITECTURE alone. FOLD INTO ARCHITECTURE for simple systems — if the flows
    fit in ARCHITECTURE §2, skip this doc entirely.

  DEPENDS ON:
    ARCHITECTURE.md (components, trust boundaries, schema). Adds nothing the
    Architect round didn't already establish — it re-presents it as flows.

  IDS THIS DOC OWNS:
    None. HLD mints no ids. It references ARCHITECTURE §-sections, BRD/PRD
    requirement ids, and ADRs — it does not define new ones. (One fact, one home:
    if a fact lives in ARCHITECTURE, link it; don't restate it.)

  Cross-reference siblings: point detail down to ARCHITECTURE.md §x and the
    deciding ADR; point requirements back to BRD/PRD ids.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# High-Level Design
## {{PROJECT_NAME}}

**Version:** 0.1
**Date:** {{DATE}}
**Status:** Draft
**References:** ARCHITECTURE.md, BRD.md, ADR.md

---

## 1. System Overview

<!-- Keel guidance: one tight paragraph. What the system does end to end, the
     primary flow(s), and the 2-4 invariants every flow must uphold (pulled from
     ARCHITECTURE principles P-xx). No new facts — a synthesis. -->

{{One paragraph: what the system ingests/accepts, how it processes it, what it
returns, and the invariants ({{P-01}}, {{P-02}}…) every flow enforces.}}

---

## 2. High-Level Component Diagram

<!-- Keel guidance: a single ASCII diagram showing the layers and how components
     talk. Mirror ARCHITECTURE §2's component set — same names, drawn as
     interactions. Layer it: client → entry/API → processing → data → external. -->

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
│   {{CLIENT_A}}   │   {{CLIENT_B}}   │   {{CLIENT_C}}                     │
└──────────┬─────────────────┬──────────────────────┬────────────────────┘
           ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              {{ENTRY / API LAYER}}                       │
│   {{ROUTER}}        {{AUTH / SCOPE}}        {{secondary entrypoint}}     │
└──────────────────────────────┬──────────────────────────────────────────┘
              ┌────────────────┴───────────────────┐
              ▼                                    ▼
┌──────────────────────────┐            ┌───────────────────────────────────┐
│     {{PIPELINE_A}}       │            │         {{PIPELINE_B}}            │
│  {{stage → stage → …}}   │            │   {{step 1 … step N}}             │
└─────────────┬────────────┘            └───────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                   │
│   {{PRIMARY_STORE}}                    {{CACHE / QUEUE}}                 │
└──────────────────────────────┬──────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                               │
│   {{SVC_A}}   │   {{SVC_B}}   │   {{SVC_C}}   │   {{HOSTING}}            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow — {{PRIMARY_INBOUND_FLOW}}

<!-- Keel guidance: the main write/ingest path, step by step. For EACH step state
     what happens AND the interim state produced (what's now in memory / queued /
     persisted) and where the isolation/scope boundary is enforced. If there are
     multiple entry paths that converge, note the convergence point and don't
     repeat the shared tail. Reference requirement ids where a step implements one. -->

<!-- If there are two+ entry paths, introduce them, then show each, noting where
     they merge:
     **Path A — {{name}}:** {{when this path applies}}.
     **Path B — {{name}}:** {{when}}. Merges with Path A at Step {{n}}. -->

**Step 1 — {{name}}**
{{What happens. Interim state: {{what now exists}}. Boundary: {{scope enforced how}}.}}

**Step 2 — {{name}}**
{{...}}

**Step N — {{name}}**
{{Terminal state: {{what is now persisted / returned}}.}}

---

## 4. Data Flow — {{PRIMARY_OUTBOUND_FLOW}}

<!-- Keel guidance: the main read/query/response path, same step-by-step style.
     Call out latency budgets per stage if the system has a performance target
     (trace the budget to NFR-PERF, don't invent it). Show where scope filtering
     and any content-safety wrapping happen. -->

**Step 1 — {{name}}**
{{What happens. Interim state. [Budget: ~{{n}}ms → NFR-PERF-xxx]}}

**Step 2 — {{name}}**
{{...}}

**Step N — Return**
{{Response shape returned to the caller; what gets audited.}}

---

## 5. Integration Touchpoints

<!-- Keel guidance: every external dependency, one row each. Failure mode is the
     load-bearing column — what the system does when this integration is down or
     misbehaves. Derive auth + failure handling from the Architect round. -->

| Integration | Purpose | Called by | Auth method | Failure mode |
|---|---|---|---|---|
| {{SERVICE}} | {{why}} | {{component}} | {{auth}} | {{what happens on outage / error}} |
| {{SERVICE}} | {{why}} | {{component}} | {{auth}} | {{behaviour}} |

---

## 6. Deployment Topology

<!-- Keel guidance: the runtime shape — services, statefulness, scaling axis, and
     what scales first under load. Note the highest-blast-radius dependency.
     Derive from the Delivery/Ops + Architect rounds; operational detail lives in
     RUNBOOK.md. -->

```
{{REGION / PLATFORM}}
│
├── {{service-a}}        [{{runtime}}]
│   - {{stateless/stateful}}; {{scaling axis}}
│   - {{ports / what it reads}}
│
├── {{service-b}}        [{{runtime}}]
│   - {{notes}}
│
├── {{primary-datastore}}  [{{engine}}]
│   - {{stateful; backups; scaling}}
│
└── {{cache / queue}}     [{{engine}}]
    - {{durability; scaling}}
```

**Scaling notes:**
- {{which component to scale first and why}}
- {{the single stateful dependency with highest blast radius}}

---

*End of HLD.md — {{PROJECT_NAME}}*
