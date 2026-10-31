---
title: "Threat Modeling"
lead: "After generating the doc suite, Keel offers an opt-in threat-modeling pass that hardens the spec before any code is written."
group: "How It Works"
order: 10
slug: threat-modeling
anchor: threat-modeling
---

## What it models

The threat-modeling pass works adversarially across seven dimensions:

- **Data exposure:** what data could leak and to whom
- **Tenant isolation:** whether multi-tenant boundaries are enforced at every layer
- **Untrusted input:** all attack surfaces that accept external data
- **Secrets and auth:** key management, token lifetimes, privilege escalation paths
- **Abuse and DoS:** rate limiting, resource exhaustion, quota enforcement
- **Privacy and regulatory:** PII handling, consent flows, retention limits
- **Availability:** single points of failure, disaster recovery, RTO/RPO

## How it mitigates

Weaknesses identified during the threat-modeling pass are fixed directly in the design documents, not just annotated in a separate risk register. The architecture document and engineering design are updated in place, and each threat is recorded in `THREAT_MODEL.md` with a pointer to where it was mitigated.
