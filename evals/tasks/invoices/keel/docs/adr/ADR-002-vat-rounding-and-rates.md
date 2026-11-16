# ADR-002 — VAT — half-up once per invoice on the net total

| | |
|---|---|
| **Status** | Accepted 2026-11-16 · build unverified (OD-04) |
| **Deciders** | founder · engineering |
| **Bounded by** | VAT-001, VAT-002, OD-05 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Founder rule: rates DE 19, FR 20, NL 21, AT 20, others 0, rounded half up once per invoice on the net total. Rounding per line would drift from the invoice total.

## Decision

| | |
|---|---|
| **Decision** | In the context of computing VAT, facing per-line vs per-invoice rounding, we chose **`floor((net × rate + 50) / 100)` once on the net total, rate stored on the invoice** to achieve one reproducible amount, accepting that the rate table lives in code. |
| **Revisit trigger** | the legal treatment of cross-border sales changes the rate rule (OD-05) or a rate changes |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Round per line | common in shops | sum of rounded lines ≠ rounded total; not the founder's rule | ✗ |
| **Once on the net total** | matches founder rule and German practice for net-total invoices | none material | ✓ |
| Configurable rate table | flexible | speculative; more to validate | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Worked examples in LLD §4.3 are exact oracles |
| Harder | Rate change = code change + CHANGELOG |
| Off the table | Per-line VAT display that sums differently |
| Build deviation | pending — filled once, at Built |
