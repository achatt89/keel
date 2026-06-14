<!--
  Keel template — THREAT_MODEL.md

  WHAT THIS DOC IS: The concentrated security reasoning — assets worth protecting, trust
  boundaries, who attacks them, the enumerated threats with mitigations, and the residual
  risks accepted. It is the analysis; NFR-SEC owns the verifiable controls and
  ARCHITECTURE.md §6 owns the controls-by-category map.

  WHEN TO INCLUDE: Platform/regulated tier, OR any project where a breach is high-impact.
  Skip for low-stakes tools — a system with no sensitive assets does not need this doc.
  (document-catalog.md)

  DEPENDS ON: ARCHITECTURE.md trust boundaries (§5); the Security interview round.

  IDS THIS DOC OWNS: THR-xxx (one per threat, stable forever).

  SIBLING CROSS-REFS: each THR maps to an NFR-SEC-xxx control and an ARCHITECTURE.md §6
  category; accepted residuals mirror BRD RSK-xxx and ARCHITECTURE.md §9.

  ONE FACT, ONE HOME: do not restate control implementation detail here — reference the
  NFR-SEC control by ID. This doc reasons about threats; NFR proves the controls.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Threat Model
## {{PROJECT_NAME}}

**Version:** {{x.y}}
**Date:** {{YYYY-MM-DD}}
**Status:** {{Draft | Active}}
**Method:** {{STRIDE per trust boundary | per-boundary}}
**References:** ARCHITECTURE.md §5 (trust boundaries), §6 (controls), §9 (accepted risks); NFR.md (NFR-SEC, NFR-BUILD); BRD (RSK-xxx)

---

## 1. Assets

<!-- Keel guidance: what is worth attacking. Rank by sensitivity using the project's data
     classification (C0–C3 from ENGINEERING_DESIGN.md) where one exists. The highest-class
     asset drives the depth of the rest of this doc. -->

| Asset | Sensitivity | Why it matters |
|-------|-------------|----------------|
| {{Tenant content / user data}} | {{C2 — highest}} | {{discloses {{personal/regulated information}}; core trust promise}} |
| {{Credentials / tokens / secrets}} | {{C1}} | {{grants impersonation / lateral movement}} |
| {{Operational metadata / telemetry}} | {{C0}} | {{aids reconnaissance; no content}} |

---

## 2. Trust boundaries

<!-- Keel guidance: where data crosses a privilege/control change. For each crossing, name
     what is trusted on each side and what must be validated at the crossing. Reference
     ARCHITECTURE.md §5 rather than redrawing the full diagram. -->

| Boundary | Crosses from → to | What must be validated at the crossing |
|----------|-------------------|----------------------------------------|
| {{Public API edge}} | {{Internet → application}} | {{authn token, request schema, body size, rate limit}} |
| {{Tenant isolation}} | {{Tenant A context → shared datastore}} | {{tenant scoping on every query; no cross-tenant rows}} |
| {{Outbound fetch}} | {{Application → user-supplied URL}} | {{URL validation; private-range block; redirect re-validation}} |
| {{Third-party callback}} | {{Subprocessor → webhook endpoint}} | {{signature, freshness, replay protection}} |

---

## 3. Threat actors

<!-- Keel guidance: who, and what they can do. Keep to actors realistic for this system. -->

| Actor | Capability | Motivation |
|-------|------------|------------|
| {{External unauthenticated attacker}} | {{network access to public endpoints}} | {{data theft, disruption}} |
| {{Authenticated malicious tenant}} | {{a valid account}} | {{cross-tenant data access}} |
| {{Compromised subprocessor / dependency}} | {{trusted callback / code execution in a library}} | {{supply-chain foothold}} |
| {{Insider / over-privileged operator}} | {{admin / DB access}} | {{misuse, accidental exposure}} |

---

## 4. Threats

<!-- Keel guidance: the heart of the doc. One row per threat, THR-xxx. Organise by trust
     boundary OR by STRIDE category (Spoofing/Tampering/Repudiation/Info-disclosure/DoS/
     Elevation) — pick one and be consistent. Likelihood and Impact: Low/Med/High. Each
     threat MUST have a mitigation that references a real NFR-SEC control by ID (the
     mitigation lives there; this row points to it). Residual = what remains after the
     mitigation (often "see RES-xxx" or "negligible"). -->

| THR | Boundary / Category | Threat | Likelihood | Impact | Mitigation | Residual |
|-----|---------------------|--------|------------|--------|------------|----------|
| THR-001 | {{Tenant isolation / Info disclosure}} | {{Tenant A reads Tenant B's data via a missing scope}} | {{Med}} | {{High}} | {{SEC-003 query scoping + isolation suite in CI}} | {{Negligible while suite green}} |
| THR-002 | {{API edge / Spoofing}} | {{Forged or replayed auth token}} | {{Med}} | {{High}} | {{SEC-004 full token validation}} | {{Negligible}} |
| THR-003 | {{Outbound fetch / SSRF}} | {{User URL targets internal metadata service}} | {{Med}} | {{High}} | {{SEC-012 URL validation + redirect re-validation}} | {{Negligible}} |
| THR-004 | {{LLM/SQL/shell sink / Tampering}} | {{Injected instructions hijack {{the model / query}}}} | {{High}} | {{Med}} | {{SEC-009 guarded interpolation + injection test suite}} | {{See RES-xxx — model-level jailbreak residual}} |
| THR-005 | {{Third-party callback / Tampering}} | {{Forged webhook drives a privileged action}} | {{Low}} | {{High}} | {{SEC-013 timing-safe HMAC + replay + freshness}} | {{Negligible}} |
| THR-006 | {{Audit trail / Repudiation}} | {{Actor denies a sensitive action; logs tampered}} | {{Low}} | {{Med}} | {{SEC-006 append-only immutable audit log}} | {{Negligible}} |
| THR-007 | {{Availability / DoS}} | {{Request flood exhausts {{resource}}}} | {{Med}} | {{Med}} | {{SEC-010 per-{{tenant}} rate limiting}} | {{Bounded by limits}} |
| THR-008 | {{Telemetry / Info disclosure}} | {{Sensitive content leaks into logs/spans}} | {{Med}} | {{Med}} | {{observability data-hygiene allowlist (NFR-OBS / SEC)}} | {{See RES-xxx — metadata-only acceptance}} |

---

## 5. Residual & accepted risks

<!-- Keel guidance: threats whose residual risk is deliberately accepted, not closed. Each
     mirrors NFR-RESIDUAL RES-xxx and BRD RSK-xxx — state the boundary of acceptance and
     the trigger that reopens it. Do not duplicate the rationale; reference ARCHITECTURE §9.
     Omit this section if nothing is accepted. -->

| Ref | Accepted risk | Acceptance boundary | Revisit trigger |
|-----|---------------|---------------------|-----------------|
| RES-001 | {{e.g. model-level jailbreak past app-layer guards}} | {{App-layer demarcation minimises but cannot eliminate; deferred to provider}} | {{New provider controls; recurring exploit (ARCHITECTURE.md §9)}} |
| RES-002 | {{e.g. telemetry breach exposes C0 metadata only}} | {{No content ever exported; metadata-only by allowlist}} | {{Any content field added to telemetry}} |

---

*End of Threat Model {{vX}} — {{PROJECT_NAME}}*
