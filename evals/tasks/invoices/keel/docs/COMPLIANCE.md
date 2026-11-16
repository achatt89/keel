# invoices — Compliance

**Status:** Draft. This is an engineering reading of German invoicing rules, **not legal advice**; every row marked legal needs the Steuerberater (open questions in [adr/README.md](./adr/README.md)).

## 1. Data classes

Business names and amounts only (C1, [ENGINEERING_DESIGN.md §3](./ENGINEERING_DESIGN.md#3-data-classification)). Caveat: a sole trader's business name may be a personal name, so GDPR can apply to stored customer names; no lawful-basis analysis exists yet `[NEEDS DECISION]` (low risk; revisit at Phase 3 when data is written to disk).

## 2. German invoicing rules mapped to this module

| Rule | Module behaviour | Status |
|---|---|---|
| Unique, sequential invoice numbers (CMP-001) | NUM-001/002, ADR-003, NFR-COR-004 | designed; unverified (no code in repo) |
| VAT shown separately (CMP-001) | invoice carries `net`, `vatRatePercent`, `vat`, `gross` | designed |
| Issued invoices unchangeable; corrections by cancellation (GoBD) | no edit/delete API; void keeps invoice and number (N-04) | designed |
| Mandatory invoice content (§14 UStG: seller/customer name and address, tax number or VAT ID, issue date, delivery/service date, description, net, rate, tax amount) | **not held by this module** (customer = name + country only) — OD-09 | gap, OD-09 |
| Correct VAT treatment for EU customers (reverse charge / OSS) | founder's table: DE 19, FR 20, NL 21, AT 20, others 0 — OD-05 | open, legal |
| E-invoicing (structured XRechnung/ZUGFeRD) is being phased in for German B2B | out of scope (BRD §5) | watch; verify timeline with the Steuerberater; revisit before it applies to the consultancy |

## 3. Retention (Phase 3 concern)

Founder requirement: keep invoices 10 years (STO-002). My understanding is that the retention period for invoices as accounting vouchers was shortened to 8 years from 2025 while books and annual accounts stay at 10, so 10 years may be longer than required: OD-06 (legal). Until decided, 10 years stands (the safe side). Nothing is retained today: the ledger is in memory (RSK-001). GoBD-compliant storage (readability, unchangeability, traceability) is scoped with Phase 3 / ADR-010.

## 4. Evidence

No compliance claim above is verified. Verification arrives with the Phase 1 and 3 gates in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
