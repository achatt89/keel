<!--
  Keel template — COMPLIANCE.md (Data Protection & Compliance)

  WHAT THIS DOC IS: The data-protection posture — what personal/regulated data the system
  holds, on what lawful basis, for how long, how data-subject rights are honoured, who the
  subprocessors are, and what happens on a breach. The compliance reference.

  WHEN TO INCLUDE: ONLY when the project holds personal or regulated data, or is subject to
  a regime like GDPR / CCPA / HIPAA. A system with no personal data does not need this doc.
  (document-catalog.md)

  DEPENDS ON: ENGINEERING_DESIGN.md (data classification C0–C3); the Security/Compliance
  interview round.

  IDS THIS DOC OWNS: the DATA INVENTORY and the RETENTION SCHEDULE (the canonical homes for
  both). References NFR-DATA / NFR-SEC for the verifiable targets and RUNBOOK breach steps.

  JURISDICTION: keep this template jurisdiction-NEUTRAL. The skill should adapt the lawful-
  basis, rights, and breach-clock language to the project's actual regime(s) — GDPR
  (lawful basis, Art. 15/17/20, 72-hour clock), CCPA (right to know/delete/opt-out), HIPAA
  (PHI, BAAs, breach notification), etc. State which regime(s) apply up top, then map.

  ONE FACT, ONE HOME: retention rules live in the schedule here; NFR-DATA references them.
  Do not restate a retention number in two places.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Compliance & Data Protection
## {{PROJECT_NAME}}

**Version:** {{x.y}}
**Date:** {{YYYY-MM-DD}}
**Author:** {{name}}
**Status:** {{Active}}
**Applicable regime(s):** {{GDPR | CCPA | HIPAA | ...}}
**References:** ENGINEERING_DESIGN.md (data classification), BRD (RSK-xxx, constraints), ARCHITECTURE.md §9, NFR.md (NFR-DATA, NFR-SEC), RUNBOOK.md (breach response)

---

## 1. Posture

<!-- Keel guidance: 3–5 lines. What sensitivity of data this holds and how seriously the
     design treats it; the project's controller/processor role; which regime(s) apply and
     the certification stance (e.g. "GDPR-aware, not certified; SOC 2 a later target"); the
     single guiding rule (e.g. "the {{container/account}} is the compliance unit"). -->

{{One paragraph on the data sensitivity and the stance taken.}}

- **{{Certification stance}}:** {{e.g. GDPR-aware, not certified; rights + minimisation + breach response implemented; SOC 2 / ISO 27001 deferred.}}
- **Roles:** {{PROJECT_NAME}} is the **{{controller}}** for {{account data}} and **{{processor/custodian}}** for {{user-imported content}}.
- **Guiding rule:** the {{compliance unit, e.g. tenant container}} is the unit of consent, export, and erasure.

---

## 2. Data inventory

<!-- Keel guidance: THE canonical inventory — every category of personal/regulated data the
     system touches. Classification uses the project's scheme (C0–C3). Lawful basis is
     regime-specific (Contract / Consent / Legal obligation / Legitimate interest under
     GDPR; adapt for others). Retention here must match the schedule in §6. Add a "Never
     collected/stored" line to make exclusions explicit and auditable. -->

| Data | Class | Where it lives | Lawful basis | Retention |
|------|-------|----------------|--------------|-----------|
| {{Account identity (email, name)}} | {{C0/C1}} | {{Auth provider; app DB}} | {{Contract}} | {{Life of account + N days}} |
| {{User-imported content}} | {{C1}} | {{App DB (isolated)}} | {{Contract (user-initiated)}} | {{Until erasure}} |
| {{Highest-sensitivity data, e.g. preferences/health}} | {{C2/C3 — highest}} | {{Dedicated isolated store}} | {{Explicit consent (§5)}} | {{Until erasure; never in telemetry}} |
| {{Audit log}} | {{C0 (+ tenant-isolated)}} | {{Append-only table}} | {{Legitimate interest (security)}} | {{N months; personal fields nulled on erasure (§4)}} |
| {{Financial/usage ledger}} | {{C0}} | {{Append-only table}} | {{Legal obligation}} | {{Statutory window; personal refs nulled on erasure}} |
| {{Operational telemetry}} | {{C0 only}} | {{Telemetry provider}} | {{Legitimate interest}} | {{N days}} |

**Never collected/stored:** {{passwords/tokens for third-party sources; raw conversation logs; full media; etc. — make the exclusions explicit.}}

---

## 3. Data minimisation & purpose limitation

<!-- Keel guidance: how minimisation is ENFORCED, not aspired to — the mechanical controls
     (schema-limited payloads, allowlists gating telemetry, parsers that discard all but the
     needed fields, zero-data-retention API endpoints). Purpose limitation: state that data
     is used only for its stated purpose and explicitly NOT for training / cross-customer
     analytics, if that is the commitment. -->

{{Minimisation is mechanical: {{list the enforcing controls}}. Purpose limitation: {{data
used solely for {{its stated purpose}}; no training on user data; no cross-{{tenant}}
analytics on the data plane}}.}}

---

## 4. Data-subject rights — implementation

<!-- Keel guidance: one row per right, with HOW it is implemented, WHEN it ships, and HOW it
     is verified. Cover access/portability, erasure, rectification, objection/restriction,
     and information. Adapt the right names to the regime (GDPR Art. 15/17/20/21; CCPA right
     to know/delete/opt-out). For erasure on append-only ledgers, state the recognised
     pattern: retain the row for its statutory window with personal fields NULLED. -->

| Right | Implementation | Built in | Verified by |
|-------|----------------|----------|-------------|
| **Access / portability** | {{Full export on demand in {{machine-readable format}}}} | {{Phase N}} | {{round-trip completeness test (NFR DATA-004)}} |
| **Erasure** | {{Full deletion across all data; append-only ledger rows retained with personal fields nulled; erasure receipt logged}} | {{Phase N}} | {{zero-residual-rows test across every table (NFR DATA-002/003)}} |
| **Rectification** | {{Re-import supersedes; delete + re-add}} | {{Phase N}} | {{determinism tests}} |
| **Objection / restriction** | {{Per-source disable without data loss}} | {{Phase N}} | {{—}} |
| **Information** | {{Privacy notice at signup; consent screen at sensitive import (§5)}} | {{Phase N}} | {{—}} |

SLA: rights requests honoured within {{30 days}}; erasure executes {{immediately on
confirmation}}, with subprocessor propagation per §7.

---

## 5. Consent

<!-- Keel guidance: where explicit consent is required (the highest-class data) and what the
     consent record captures (timestamp, scope, notice version) and where it is stored
     (typically the audit log). Note any future-source review gate. Omit if no processing
     relies on consent as its lawful basis. -->

- **{{Highest-class data}}:** importing {{it}} requires an explicit, recorded consent action describing what is extracted, what is discarded, and how it is used. The consent record (timestamp, scope, notice version) is written to {{the audit log}}.
- **{{Future / ambient sources}}:** {{per-source permission before first collection; denial degrades gracefully; each new source needs a privacy-review gate}}.

---

## 6. Retention schedule

<!-- Keel guidance: the operational summary — one rule per store. This is the canonical home
     for retention; NFR-DATA references it. Drift between this table and code is a defect.
     Must agree with the Retention column in §2. -->

Enforced by {{scheduled jobs + store config}}; drift between this table and code is a defect.

| Store | Rule |
|-------|------|
| {{User content}} | {{Life of {{container}}; erasure on request}} |
| {{Job/import history}} | {{N-month rolling purge}} |
| {{Audit log}} | {{N months; personal fields nulled at erasure}} |
| {{Financial ledger}} | {{Statutory window; personal refs nulled at erasure}} |
| {{Telemetry}} | {{N-day retention}} |
| {{Temp files}} | {{Job lifetime only}} |
| {{Backups}} | {{N-day window; pending erasures re-applied on restore (RUNBOOK.md)}} |

---

## 7. Subprocessors

<!-- Keel guidance: every third party that touches personal data. Name, purpose, exactly
     what data they see, and the control (DPA/BAA + technical limits). Note that any change
     requires a COMPLIANCE.md update and (often) customer notice. Omit rows that do not
     apply; do not invent vendors the interview did not establish. -->

| Subprocessor | Purpose | Data exposed | Control / DPA |
|--------------|---------|--------------|---------------|
| {{Auth provider}} | {{Identity}} | {{Account identity}} | {{DPA; token-only integration; no content shared}} |
| {{Model provider}} | {{Inference}} | {{Content transits per-request}} | {{Zero-data-retention endpoint; deploy gate}} |
| {{Hosting provider}} | {{Compute / storage}} | {{All data at rest}} | {{DPA; encryption; private networking}} |

Subprocessor changes require a COMPLIANCE.md update and {{customer notice}}.

---

## 7a. Data residency & cross-border transfer

<!-- Keel guidance: include whenever users' data is legally tied to a jurisdiction (GDPR/UK-GDPR/
     UAE-KSA PDPL/etc.) but the infra may sit elsewhere. State where each data class is hosted vs.
     where the data subjects are, name any transfer that crosses a border, and the legal basis /
     safeguard for it. If region-pinned or on-prem hosting is a hard requirement, say so — it's an
     architecture constraint (ARCHITECTURE.md), not a config flag. Omit this section if all data,
     users, and infra sit in one jurisdiction. -->

| Data class | Stored region | Data-subject region | Crosses a border? | Legal basis / safeguard |
|------------|---------------|---------------------|-------------------|-------------------------|
| {{C1 content}} | {{region}} | {{region}} | {{yes/no}} | {{SCCs / adequacy / in-region pinning / N-A}} |
| {{recordings/biometrics}} | {{region}} | {{region}} | {{yes/no}} | {{explicit consent + safeguard}} |

- **Residency requirement:** {{region-pinned / on-prem option / none}} — {{driver: PDPL/GDPR/customer demand; see ARCHITECTURE.md}}.

---

## 8. Breach response

<!-- Keel guidance: detection inputs, the playbook pointer (RUNBOOK.md), the notification
     clock, and the blast-radius design statement. The notification clock is REGIME-SPECIFIC
     — adapt it. GDPR: supervisory-authority notification within 72 hours of awareness where
     required, plus affected-individual notice without undue delay where high-risk. HIPAA
     and others differ — set the right clock. -->

- **Detection inputs:** {{isolation-suite failures, auth-anomaly alerts, webhook-forgery alerts, telemetry alerts}}.
- **Procedure:** RUNBOOK.md "{{Security Incident Response}}" — {{worst-case playbook}}.
- **Notification clock:** {{REGIME-SPECIFIC — e.g. GDPR: notify the supervisory authority within 72 hours of awareness where required; notify affected individuals without undue delay where high-risk. Adapt for the applicable regime.}}
- **Blast-radius design:** {{a breach of any single subprocessor or transient store exposes at most {{C0 metadata}} (ARCHITECTURE.md §9).}}

---

## 9. DPIA & review triggers

<!-- Keel guidance: what events require a Data Protection Impact Assessment (or refresh) —
     new high-class data source, new subprocessor receiving C1+ data, isolation-topology
     change, expansion to a new data class or jurisdiction. Tie the periodic review to the
     security review cadence (NFR-GOV). -->

A DPIA (or refresh) is required before: {{launch of any new high-class data feature; any new
C2/C3 source; any new subprocessor receiving C1+ data; isolation-topology changes; expansion
to a new jurisdiction}}. The {{quarterly}} security review (NFR-GOV-001) includes a compliance
checkpoint against this document.

---

*End of COMPLIANCE.md {{vX}} — {{PROJECT_NAME}}*
