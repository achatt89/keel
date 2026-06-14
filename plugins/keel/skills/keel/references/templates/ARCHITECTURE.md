<!--
  Keel template — ARCHITECTURE.md
  =================================================================
  WHAT THIS DOC IS:
    The system architecture of record: principles, component breakdown, data &
    DB schema, API design, trust boundaries, security controls by threat
    category, observability, cost model, and the accepted/residual-risk register.
    The authoritative "how the system is built" — one level above LLD.

  WHEN TO INCLUDE (catalog adaptivity trigger):
    ALWAYS, scaled to tier. Prototype = a "lite" version: §1 principles (3-5),
    §2 components + the System Overview diagram, and the key decisions only —
    drop §5-§9 or fold them into a one-paragraph "Security & risks" note. The
    security-controls / trust-boundary / residual-risk depth scales UP with the
    project's data sensitivity (Product → Platform/regulated).

  DEPENDS ON:
    ENGINEERING_DESIGN.md (design pillars, data classes, non-negotiables) and the
    Architect + Security interview rounds. Generated before HLD/LLD.

  IDS THIS DOC OWNS:
    - P-xx (architecture principles) — the only home for these.
    - Hosts the ACCEPTED-RISK REGISTER (§9): mirrors BRD RSK-xxx ids with
      operational detail + revisit triggers. Does NOT mint new RSK ids.
    Owns its own §-numbering so HLD/LLD/NFR can cross-reference (e.g. "§6").

  Cross-reference chain: BRD (what/why) → this doc (how/component) →
    HLD.md (flows/topology) → LLD.md (module/type) → ADR.md (why) →
    NFR.md (verification). Reference by id (P-03, ADR-014) or doc+§.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# System Architecture Document
## {{PROJECT_NAME}}

**Version:** 0.1
**Date:** {{DATE}}
**Author:** {{AUTHOR}}
**Status:** Draft

---

## Table of Contents

1. [Architecture Principles](#1-architecture-principles)
2. [Component Breakdown](#2-component-breakdown)
3. [Data & Database Schema](#3-data--database-schema)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Security Controls by Threat Category](#6-security-controls-by-threat-category)
7. [Observability Architecture](#7-observability-architecture)
8. [Cost Architecture](#8-cost-architecture)
9. [Residual & Accepted Risks](#9-residual--accepted-risks)

---

## 1. Architecture Principles

<!-- Keel guidance: 4-8 load-bearing principles from the Architect round. Each
     must be traceable to a BRD objective/constraint or an ADR. State the
     principle, then the concrete consequence it forces. Number P-01.. — these
     ids are referenced everywhere downstream. One principle, one home. -->

### P-01 — {{PRINCIPLE_TITLE}}

{{One sentence statement, then the consequence it forces on the design.}} ({{ADR-xxx / BRD ref}})

### P-02 — {{PRINCIPLE_TITLE}}

{{...}}

### P-03 — {{PRINCIPLE_TITLE}}

{{...}}

<!-- Add P-04..P-0N as the interview warrants. -->

---

## 2. Component Breakdown

<!-- Keel guidance: derive the component list from the Architect round. Open with
     an ASCII System Overview, then one subsection per component (§2.1, §2.2…).
     Each component states what it IS, what it OWNS, what it does NOT own, its
     interfaces, and its failure modes — this clean ownership boundary is what
     LLD §1 turns into a module map. Use the same shape for every component. -->

### System Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Client Layer   {{CLIENT_A}} │ {{CLIENT_B}} │ {{CLIENT_C}}    │
└───────────────────────────────┬──────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────┐
│  {{ENTRY_SERVICE}}   {{middleware / routing / validation}}    │
└────────┬─────────────────────────────────────────┬───────────┘
         ▼                                          ▼
┌──────────────────┐                  ┌───────────────────────────┐
│  {{PIPELINE_A}}  │                  │      {{PIPELINE_B}}       │
└────────┬─────────┘                  └─────────────┬─────────────┘
         ▼                                          ▼
┌──────────────────┐   ┌───────────────────────────────────────────┐
│  {{DATA_LAYER}}  │   │          {{EXTERNAL_SERVICES}}            │
└──────────────────┘   └───────────────────────────────────────────┘
```

### 2.1 {{COMPONENT}}

**What it is:** {{One-paragraph role. What it handles; what it delegates.}}
**What it owns:** {{responsibilities}}
**What it does not own:** {{delegated concern}} (→ {{which component}})
**Interfaces:** {{Called by … / Calls … / Reads-writes …}}
**Failure modes:** {{condition → status/behaviour}}; {{condition → behaviour}}

<!-- Repeat §2.2, §2.3 … per component. For components with a contract, add:
```{{language}}
interface {{ComponentContract}} { {{method}}({{args}}): {{ReturnType}}; }
```
-->

---

## 3. Data & Database Schema

<!-- Keel guidance: the persisted data model from the Architect + Security rounds.
     State the tenancy/ownership rule first (e.g. every tenant-scoped table
     carries {{SCOPE_KEY}} + an isolation policy), then the schema. Mark
     append-only / immutable tables and the mechanism that enforces it. Keep this
     the SINGLE home for the schema — LLD references it, never re-states it. -->

**Data-scoping rule:** {{e.g. every {{ENTITY}}-scoped table carries {{SCOPE_KEY}}
NOT NULL with a row-isolation policy; the app connects as a least-privilege role.}}

```sql
-- {{ENTITY}} — {{one-line purpose}}
CREATE TABLE {{table_name}} (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  {{scope_key}}   UUID NOT NULL,        -- {{isolation key}}
  {{column}}      {{TYPE}} NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- {{indexes, isolation policy, append-only triggers as applicable}}
```

| Table | Purpose | Scope key | Append-only? | Notes |
|---|---|---|---|---|
| `{{table}}` | {{purpose}} | `{{scope_key}}` | {{yes/no}} | {{retention / FK notes}} |

---

## 4. API Design

<!-- Keel guidance: the external contract surface (Architect round). State the
     base path, the auth model, and the uniform success/error envelope ONCE, then
     list endpoints grouped by capability. Per endpoint: method+path, auth/role,
     request shape, response shape, error codes. LLD § routes implement these;
     don't restate handler logic here. -->

All routes under `{{BASE_PATH}}`. Auth: `{{AUTH_HEADER}}` unless noted. Envelope:

```{{language}}
// Success
{ data: T, meta?: {{PaginationMeta}} }
// Error
{ error: { code: string; message: string; requestId: string } }
```

### {{Capability group}}

#### `{{METHOD}} {{BASE_PATH}}/{{resource}}`

{{One-line purpose.}} **Auth:** {{role(s)}}

```{{language}}
interface {{RequestType}} { {{...}} }   // Request
interface {{ResponseType}} { {{...}} }  // Response — {{status}}
```

**Error codes:** `{{4xx CODE}}`, `{{4xx CODE}}`

<!-- Repeat per endpoint, grouped by capability. -->

---

## 5. Security Architecture

<!-- Keel guidance: from the Security round. The guiding principle (e.g.
     enforce-at-build-time, not runtime-policy-alone), the trust-boundary diagram,
     and a step-by-step request walkthrough. Scale this section with data
     sensitivity — a prototype may collapse it to a paragraph. -->

### Trust Boundaries & Attack Surface

```
╔═════════════════════════════════════════════════════════╗
║  UNTRUSTED ZONE — {{external actors}}                   ║
╚══════════════╪══════════════════════════════════════════╝
               │  BOUNDARY #1 ({{TLS + authn}})
╔══════════════╪══════════════════════════════════════════╗
║  {{DMZ / API ZONE}}                                     ║
╚══════════════╪══════════════════════════════════════════╝
               │  BOUNDARY #2 ({{queue / async hop}})
╔══════════════╪══════════════════════════════════════════╗
║  {{INTERNAL / WORKER ZONE}}                             ║
╚══════════════╪══════════════════════════════════════════╝
               │  BOUNDARY #3 ({{data-layer writes}})
╔══════════════╪══════════════════════════════════════════╗
║  {{DATA ZONE — most sensitive}}                         ║
╚═════════════════════════════════════════════════════════╝
```

**Boundary #1 — {{name}}.** {{What is enforced as a request crosses it.}}
**Boundary #2 — {{name}}.** {{...}} **Boundary #3 — {{name}}.** {{...}}

<!-- Keel guidance: then trace one representative request through every control
     in order (TLS → headers → rate limit → authn → scope/context → authz →
     input validation → handler → audit). Number the steps. -->

**End-to-end walkthrough:**
`Client → [1] {{control}} → [2] {{control}} → … → [N] {{handler}} → {{audit}}`

---

## 6. Security Controls by Threat Category

<!-- Keel guidance: map concrete, implemented controls to threat categories
     (STRIDE or per-boundary). Controls with an ADR ref are recorded decisions;
     others are implementation requirements. Test/CI gates for these live in
     NFR.md — reference, don't duplicate. Group by category; scale with tier. -->

### A. Authentication & Identity
- {{control}} ({{ADR-xxx}})

### B. API Layer
- {{control}}

### C. {{Threat category — e.g. Input / Ingestion}}
- {{control}}

### D. {{Threat category — e.g. Data isolation}}
- {{control}}

### E. {{Threat category — e.g. Secrets / External calls}}
- {{control}}

### F. Observability
- {{control — e.g. content never enters telemetry; attribute allowlist}}

---

## 7. Observability Architecture

<!-- Keel guidance: instrumentation points, what leaves the system (and what is
     forbidden to — content stays out of telemetry), dashboards, and alert rules.
     Alert thresholds should trace to NFR targets, not be invented here. -->

**Instrumentation points** — spans/metrics and the *allowlisted* attributes each carries:

| Span / Metric | Parent | Key attributes (allowlisted) |
|---|---|---|
| `{{span.name}}` | `{{parent}}` | `{{attr}}`, `{{attr}}` |

**What leaves the system:** {{traces/logs/metrics exported, sampling, sink}}.
**Forbidden in telemetry:** {{content classes that must never appear}}.

**Alerting rules** (thresholds trace to NFR targets, not invented here):

| Alert | Condition | Severity |
|---|---|---|
| {{alert}} | {{threshold (→ NFR-xxx)}} | {{Warning / Critical}} |

---

## 8. Cost Architecture

<!-- Keel guidance: only if cost is a real constraint (it often is for anything
     calling paid APIs or managed infra). State the modelling assumptions, a
     baseline and a scale scenario, then the guard rails that keep spend bounded.
     If there's no meaningful cost story, delete this section. -->

**Assumptions:** {{key cost drivers + values, as a short table or list.}}

```
Baseline — {{scenario}}:  {{itemised}}   →  ~${{n}}/month
Scale    — {{scenario}}:  {{itemised}}   →  ~${{n}}/month
```

**Cost guard rails:** {{per-driver quota / cache / hard cap that bounds spend.}}

---

## 9. Residual & Accepted Risks

<!-- Keel guidance: the accepted-risk register — DELIBERATE decisions, not open
     action items. Mirror each BRD RSK-xxx that lands as an accepted architectural
     risk; add operational detail and a mandatory REVISIT TRIGGER (the condition
     that re-opens the decision). Append-only: resolved/retired entries are dated,
     never deleted. Cross-link the deciding ADR. -->

| Risk | Mirrors | Disposition | Revisit trigger | ADR |
|---|---|---|---|---|
| {{risk title}} | `RSK-xxx` | {{accepted / mitigated-to-residual}} | {{condition that re-opens it}} | {{ADR-xxx}} |

**{{Risk title}}.** {{The risk, why accepted, compensating controls, revisit
trigger.}} ({{ADR-xxx}}; tracked as {{RSK-xxx}})

<!-- Review cadence: {{when re-reviewed}}. Procedure lives in RUNBOOK.md. -->

---

*End of ARCHITECTURE.md — {{PROJECT_NAME}}*
