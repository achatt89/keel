# invoices — Architecture

**Status:** Draft · Rules: [ENGINEERING_DESIGN.md §4](./ENGINEERING_DESIGN.md#4-non-negotiables) · Contracts: [LLD.md](./LLD.md). (HLD omitted: one module, nothing to diagram beyond §2.)

## 1. Principles

| ID | Principle |
|---|---|
| P-01 | The ledger is the only owner of state; everything else is pure functions |
| P-02 | Pure core, thin shell: money, VAT, dates and CSV are pure functions of their inputs |
| P-03 | No I/O in Phases 1–2 (the caller writes the CSV text to a file); I/O arrives in Phase 3 behind one module |
| P-04 | Determinism: the clock and ids are never read implicitly in pure functions (issue time is an input) |

## 2. Components and data flow

```
caller script
  └─ createLedger() ─► ledger (closure: customers Map, invoices Map, per-year counters)
        ├─ validate (inputs) ─► money/VAT (pure) ─► numbering ─► store ─► frozen copy to caller
        ├─ summary()   ─► one console line per invoice
        └─ exportCsv({from,to}) ─► Berlin date (Intl) ─► filter ─► sort by number ─► CSV writer ─► string
```

| Component | Responsibility | Spec |
|---|---|---|
| validation | reject bad input with `InvoiceError` before any state change | LLD §3 |
| money/VAT | integer cents, rate table, half-up rounding | LLD §4, ADR-001/002 |
| numbering | per-year counter, allocation after validation | LLD §5, ADR-003 |
| dates | UTC parse/validate, Berlin date, calendar-date validation | LLD §6.1, ADR-004 |
| CSV writer | format, quoting, BOM, CRLF | LLD §6.2, ADR-008 |
| storage (Phase 3) | JSON file save/load, atomic write | ADR-010 (reserved) |

## 3. Trust boundaries

One boundary: **caller → public API**. Everything crossing it is untrusted until validated (SEC-001). The CSV leaves the process as text and is later opened in Excel, a second boundary — see THR-001.

## 4. Controls by threat

Threat register: [THREAT_MODEL.md](./THREAT_MODEL.md).

| Threat class | Control |
|---|---|
| Malformed input (NaN, floats, huge numbers, wrong types) | validation table LLD §3; safe-integer bound check |
| Forged ids / numbers | ledger generates them; no API accepts them except as lookup keys (then `not_found`) |
| Mutation of returned data | frozen copies (ADR-006) |
| Prototype pollution | `Map` storage; reject non-plain input objects |
| Formula injection in CSV | ADR-009 (OD-01) |
| Data loss / number reuse after restart | accepted until Phase 3; RSK-001, OD-07 |

## 5. Accepted residual risks

| Risk | Accepted because | Revisit trigger |
|---|---|---|
| RSK-001 in-memory loss | founder phases storage later | before any real invoice is issued, or Phase 3 start |
| >9999 invoices in a year breaks the 4-digit format | a two-person consultancy cannot approach it; the ledger throws rather than emit a 5-digit number `[ASSUMPTION]` | volume above ~5,000 per year |
