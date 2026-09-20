<!--
  Keel template — COST_ANALYSIS.md (measured unit economics)
  WHAT: A cost model built from REAL telemetry — per-unit costs measured in the running
        system, a formula that composes them, the caveats the data itself surfaced, and a
        methodology section precise enough that someone else can redo (or refute) it.
  INCLUDE WHEN: the product has a metered variable cost — LLM/AI calls, voice minutes,
        per-message providers, compute that scales with tenants — and a business objective
        or NFR-COST target depends on knowing the number. Not for fixed hosting bills
        (those are a line in ARCHITECTURE's cost section).
  DEPENDS ON: the telemetry that records usage (LLD/ARCHITECTURE name it); NFR.md
        NFR-COST-xxx targets; BRD.md BO-xx / CON-xxx cost ceilings.
  OWNS: the measured figures and the formula. NFR owns the TARGET; this doc owns the
        MEASUREMENT. When they disagree, this doc says so in §4 and the NFR gets a
        [NEEDS DECISION].
  KEY RULE: measured, not estimated. Every number cites the query/log/dashboard and the
        window it came from. An estimate is allowed only when labelled `[ESTIMATE]` with
        its basis.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — Cost Analysis

**Date:** {{YYYY-MM-DD}} · **Window measured:** {{YYYY-MM-DD → YYYY-MM-DD}} · **Data source:** {{table / dashboard / provider invoice}}
**Targets this checks:** {{NFR-COST-001}}, {{BO-0x}}, {{CON-00x}}

---

## 1. Summary

<!-- Keel guidance: three lines max. The unit, the measured cost per unit, and whether the
     target holds. -->

| Unit of work | Measured cost | Target (NFR) | Holds? |
|---|---|---|---|
| {{one published job → full candidate scan}} | {{$0.42}} | {{≤ $0.50}} ({{NFR-COST-001}}) | ✅ / ⚠️ |
| {{one AI interview}} | {{$1.10}} | {{≤ $1.00}} | ⚠️ over by {{10%}} |

---

## 2. Measured unit costs

<!-- Keel guidance: one row per cost driver, from real usage telemetry. Columns: what,
     measured quantity per unit, unit price (provider, dated), cost per unit, n (sample size),
     source query. Small n is fine if stated. -->

| Driver | Quantity per unit (median · p95) | Unit price ({{provider}}, {{YYYY-MM-DD}}) | Cost per unit (median · p95) | n | Source |
|---|---|---|---|---|---|
| {{LLM input tokens — screen.score}} | {{3,100 · 5,800}} | {{$3 / 1M}} | {{$0.009 · $0.017}} | {{412}} | `{{SELECT … FROM llm_usage WHERE task='screen.score'}}` |
| {{LLM output tokens — screen.score}} | {{620 · 1,100}} | {{$15 / 1M}} | {{$0.009 · $0.017}} | {{412}} | same |
| {{embedding calls}} | {{1 · 1}} | {{$0.02 / 1M tok}} | {{$0.0002}} | {{412}} | `{{…}}` |
| {{voice minutes}} | {{7.2 · 11.5}} | {{$0.09 / min}} | {{$0.65 · $1.04}} | {{38}} | {{provider dashboard export}} |

---

## 3. Formula

<!-- Keel guidance: compose §2 into the cost of the business unit named in §1. Show the
     arithmetic; a reader must be able to plug in new prices. -->

```
cost(publish one JD) = scan_cost + Σ per-candidate stage costs
  scan_cost        = candidates_scanned × (embed + rerank)          = {{N}} × ({{…}} + {{…}})
  per-candidate    = screen.score + (P(shortlist) × interview)     = {{…}} + ({{0.18}} × {{$1.10}})
  → median {{$0.42}} · p95 {{$0.71}} at {{N}} candidates per JD
```

Sensitivity: {{the term that dominates — e.g. "interview minutes are 70% of p95; a 2-minute cap changes p95 by $0.18".}}

---

## 4. Caveats the data surfaced

<!-- Keel guidance: the honest part. Things the measurement itself revealed that make the
     clean number less clean: skewed samples, a bug inflating usage, a provider price change
     mid-window, a stage not yet metered. Each one says what would change the number and by
     roughly how much. -->

- {{Sample skew — 60% of measured JDs came from one test tenant with unusually long descriptions; p95 likely overstated.}}
- {{Unmetered stage — `jd.structure` is stubbed; adds an estimated `[ESTIMATE: $0.02 based on token count of the prompt]` when real.}}
- {{Retry inflation — 11% of screen.score calls were retries after a parsing bug fixed in CHG-0xx; excluding them lowers median by ~$0.03.}}
- {{Target mismatch — NFR-COST-002 assumed $1.00 / interview; measured p95 is $1.04 → `[NEEDS DECISION]` raised in NFR.md.}}

---

## 5. Methodology — so a future reader can redo or challenge this

<!-- Keel guidance: exact queries, exact window, exact price source, how p95 was computed,
     what was excluded and why. This section is what makes the analysis a fact rather than
     an opinion. -->

1. **Window:** {{YYYY-MM-DD 00:00 → YYYY-MM-DD 23:59 UTC}}, production, all tenants except {{test tenant ids}}.
2. **Usage query:** `{{full SQL / log query, verbatim}}`
3. **Prices:** {{provider pricing page URL}}, captured {{YYYY-MM-DD}}; {{no volume discount applied}}.
4. **Statistics:** median and p95 over per-unit totals (not per-call), computed with `{{percentile_cont(0.95)}}`.
5. **Exclusions:** {{retries flagged by `attempt > 1`; runs with `status = 'failed'`}}.
6. **Reproduce:** `{{scripts/cost-analysis.sql}}` / `{{npm run cost:report -- --from … --to …}}`.

---

## 6. Revisit trigger

<!-- Keel guidance: an observable condition, not a date. Usually: a price change, a model
     change, a new stage entering the pipeline, or volume crossing a tier. -->

Redo this analysis when {{the provider changes list price}}, when {{a model/tier routing change lands (ADR-0xx)}}, when {{a new metered stage ships}}, or when monthly volume exceeds {{N}} units (volume pricing tier). Next scheduled check: {{after Phase N}}.

---

*End of COST_ANALYSIS.md — {{PROJECT_NAME}}*
