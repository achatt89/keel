# Keel transcript — invoices

Non-interactive run, 2026-11-16: no questions could be asked. The founder supplied a description and a full set of interview answers up front; Keel took its recommended default wherever a question was unanswered and marked it `[ASSUMPTION]`. The document-set proposal was pre-approved. Rounds below are labelled by persona hat; entries are lightly cleaned, not summarised.

## Round 0 — Intake & framing

**Founder's description:** Build `invoices`, the invoicing core for a small two-person consultancy in Berlin. Node.js 20+, standard library only, a JavaScript module (no UI, no HTTP), in memory for now. `src/invoices.js` exports `createLedger()` and `InvoiceError` (with a `code`). The ledger holds customers (name, ISO country code) and invoices (customer, line items with quantity and unit price, issue time as a UTC timestamp). It computes net, VAT and gross per invoice, numbers invoices gaplessly per year (`INV-2026-0001`), and can void an invoice (the invoice and its number stay). A console summary prints one line per invoice. Phases: 1 core, 2 CSV export for the accountant, 3 file storage.

**Keel reflection:** a legal-document ledger library for two partners and their accountant; correctness to the cent and gapless numbering are the point.
**Ambition tier:** Product / MVP (founder answer: real users, maintained for years, invoices are legal documents).

**Observation (not an answer):** the brief says the Phase 1 code is "already built: the code exists in the repo". The repo Keel was run in has no commits and no files. Recorded as OD-04 and BRD RSK-003; Phase 1 is planned as "adopt and verify", and nothing about it is marked verified.

## Round 1 — Business Analyst

| Topic | Founder answer |
|---|---|
| Users | the two partners issue invoices; the external accountant (Steuerberater) imports the CSV into German Excel and DATEV monthly |
| Problem | invoices made by hand in a word processor; numbers have gaps; VAT miscalculated |
| Success | every invoice correct to the cent, gapless numbering, accountant imports the export without editing |
| Data | customer names and amounts; no personal data beyond business names; invoices kept 10 years (storage phase's concern) |
| Compliance | German invoicing rules (gapless numbers, VAT shown); GoBD retention is phase 3 |

Keel challenges (surfaced as open decisions, not answered by the founder): cross-border VAT treatment of FR/NL/AT customers (OD-05); 10-year retention may exceed the current legal period for invoices (OD-06); the module holds none of the content a legal invoice needs (OD-09).

## Round 2 — Product Manager

| Topic | Founder answer |
|---|---|
| Phase 1 | customers (ids `C0001`…), invoices with lines, VAT by customer country (DE 19 %, FR 20 %, NL 21 %, AT 20 %, others 0 %) rounded half up once per invoice on the net total, numbers `INV-<year>-<4 digits>` gapless per year, void keeps the invoice; errors `InvoiceError` codes `invalid_input`, `invalid_date`, `not_found`, `already_void` |
| Phase 2 | `exportCsv({ from, to })`, all confirmed with the accountant: `;` separator; decimal comma, two decimals, no thousands separator, no currency sign; UTF-8 with BOM; CRLF including after the last row; header `invoice;date;customer;country;net;vat;gross;status`; Europe/Berlin dates for the column and the filter, inclusive range (`2026-03-31T23:30:00Z` → `2026-04-01`); void invoices stay with status `void` and original amounts; rows in invoice-number order; quoting only for `;` `"` line break, inner quotes doubled; `invalid_date` for a bad `from`/`to`, `invalid_range` for `from` > `to`, format checked first; empty range = BOM + header + CRLF |
| Phase 3 | save/load ledger as JSON file; later; out of scope now |
| Interface | JavaScript module API; no UI, no HTTP, no CLI |

## Round 3 — Architect / Eng Lead

| Topic | Founder answer / Keel default |
|---|---|
| Stack | Node.js 20+, standard library only, `node:test`, ES modules |
| Money representation | not stated → `[ASSUMPTION]` integer cents (ADR-001, Proposed) |
| Quantity type, line rounding | not stated → OD-03; default integers only |
| Time zone mechanism | not stated → `Intl` with `Europe/Berlin` (ADR-004, Proposed) |
| Numbering year basis | not stated → OD-02; default Berlin year |
| API names beyond `createLedger`, `InvoiceError`, `exportCsv` | not stated → `[ASSUMPTION]` names in LLD §2, reconcile with built code |
| HLD | omitted: one module, folded into ARCHITECTURE |

## Round 4 — Security / Compliance

Founder: validate every input; never trust caller-supplied ids. Deployment: none. Keel's additions (adversarial pass on the docs): CSV formula injection (THR-001/OD-01); frozen copies and closure state (ADR-006); `Map` storage against prototype pollution; in-memory loss reusing numbers (THR-004/OD-07); name rules (OD-08). Security-audit skill offer: **declined**.

## Round 5 — Designer

Not applicable: no UI. impeccable and modern-web-guidance: **declined**. No DESIGN.md, PRODUCT.md or skill hooks.

## Round 6 — Delivery / Ops and ways of working

No answers given beyond: one developer building with Claude Code; no deployment. Defaults taken `[ASSUMPTION]`: git repo with branch-per-phase off `main`, worktree-parallel tasks, doc-sync after every unit of work, bounded-retries exit strategy, default byte budgets (keystone 12 KB, plan 64 KB, ADR index 16 KB, others 32 KB), no CI. DEPLOYMENT.md, FEEDBACK_ROUNDS.md omitted. Update-check hook: **declined**. Almanac: **no**.

## Proposed document set (pre-approved)

| Included | Omitted (trigger to add) |
|---|---|
| AGENTS, CLAUDE, BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, LLD, `docs/adr/`, NFR, COMPLIANCE, THREAT_MODEL, IMPLEMENTATION_PLAN, COMMANDS, RUNBOOK, CHANGELOG, transcript, docs/README | HLD (more than one component), DESIGN/PRODUCT (any UI), DEPLOYMENT (any hosted component), FEEDBACK_ROUNDS (client/pilot feedback), COST_ANALYSIS (metered cost), SPIKE/AUDIT (on demand), almanac (GTM/knowledge dimension) |
