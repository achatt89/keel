# invoices — Threat Model

**Status:** Draft (document-level pass, 2026-11-16) · Scope: the module and its CSV output. Controls live in [ARCHITECTURE.md §4](./ARCHITECTURE.md#4-controls-by-threat), [LLD.md §3](./LLD.md#3-validation-sec-001-n-05--all-before-any-state-change), [NFR.md §2](./NFR.md#2-security--robustness). This file records; it does not replace the mitigation.

## 1. Assets and actors

| Asset | Why it matters |
|---|---|
| Invoice records and numbers | legal documents; gapless sequence |
| CSV export | goes to the tax adviser; opened in Excel |
| Actors | partner scripts (trusted but fallible), accountant's Excel (consumer), a bad customer name (data from outside), a future file on disk (Phase 3) |

## 2. Threats

| ID | Threat | L / I | Mitigated in | Residual |
|---|---|---|---|---|
| THR-001 | CSV/formula injection: a name like `=HYPERLINK(...)` executes in Excel when the accountant opens the export | Med / High | [ADR-009](./adr/ADR-009-csv-formula-injection-policy.md), NFR-SEC-006, OD-01 | open until OD-01 |
| THR-002 | Caller supplies/forges an id or number to overwrite or duplicate a record | Low / High | [ADR-006](./adr/ADR-006-ledger-isolation-no-caller-ids.md), NFR-SEC-004 | none |
| THR-003 | Caller mutates a returned object, altering an issued invoice | Med / High | ADR-006 (frozen copies), NFR-SEC-003 | none |
| THR-004 | Process restart empties the ledger; numbers restart at `0001` (duplicate legal numbers) | High / Critical | OD-07 (no real use before Phase 3); Phase 3 | accepted until Phase 3 (RSK-001) |
| THR-005 | Malformed numerics (NaN, Infinity, floats, unsafe integers, negatives) corrupt totals | Med / High | LLD §3 bounds, NFR-SEC-001 | none |
| THR-006 | Prototype pollution via `__proto__`/`constructor` keys in inputs or as map keys | Low / Med | `Map` storage, plain-object check (ENGINEERING_DESIGN N-11), NFR-SEC-001 | none |
| THR-007 | BOM lost or doubled when the caller writes the file, so Excel shows broken umlauts | Med / Med | documented in LLD §6.2, [COMMANDS.md](./COMMANDS.md) write snippet | caller-side |
| THR-008 | (Phase 3) tampering with or corrupting the JSON file; partial write loses the ledger | Low / High | ADR-010 (reserved): atomic write, integrity check on load | design pending |
| THR-009 | Control characters / line breaks in names break the console summary (log injection) or CSV rows | Low / Med | OD-08, quoting per ADR-008 | open until OD-08 |
| THR-010 | Supply chain: any dependency added later | Low / High | ADR-007, NFR-SEC-005 | none |

Out of scope: a malicious host process (A-02), network attacks (no network).
