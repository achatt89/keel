<!--
  Keel template — almanac/README.md (topology-stable knowledge base index)
  WHAT: The index for the almanac — a numbered knowledge base decoupled from sprint
        cadence. It reorients readers AWAY from phase/timeline structure ("if you need
        X, read file Y"), carries the product's guiding principles, and stamps a version.
  INCLUDE WHEN: ONLY when the project has durable, reusable knowledge worth a stable home
        — a product/positioning/GTM dimension, a methodology the product embodies,
        LLM-reference data, or multiple audiences needing one source of truth. Most
        engineering-only tools do NOT need an almanac; when in doubt, omit and offer later.
  DEPENDS ON: Business-analyst + product + design interview rounds.
  OWNS: A numbered file scheme (01-… … NN-…). Generate only the numbered files the
        project warrants — see references/almanac-guide.md.
  Delete all <!-- Keel guidance --> comments (and this block) when filling this in.
-->

# {{PROJECT_NAME}} — Almanac

> **Purpose:** Single source of truth for product, strategy, content, and any AI-reference
> data. The almanac captures the product's *topology* (what it is, how we think about the
> problem, how we go to market) — knowledge that changes only when understanding shifts,
> not when a sprint ends. Timeline/status lives in `CLAUDE.md` and the implementation plan.

**Tagline:** {{TAGLINE}}

---

## How to use this almanac

<!-- Keel guidance: entry points BY AUDIENCE, not by phase — the whole point of the
     almanac is to route on "what do I need to know," not "what sprint are we in." Keep
     the audiences the project actually has; drop "copywriter" if there's no marketing
     surface, "AI/prompt work" if there's no LLM-reference data. -->

Start with the file relevant to your task; each links to siblings where context is shared.

- **New to the product?** Start with [`01-overview-positioning.md`](01-overview-positioning.md)
- **Building a feature?** [`07-technical-overview.md`](07-technical-overview.md) + [`09-epics-user-stories.md`](09-epics-user-stories.md)
- **Working on AI / prompt enrichment?** [`12-{{REFERENCE_DATA}}.md`](12-{{REFERENCE_DATA}}.md) — reference data feeds prompts from here, not from code.
- **Writing website or app copy?** [`10-website-copy.md`](10-website-copy.md) — copy lives here as data, referenced by the UI.

---

## File map

<!-- Keel guidance: a flat, NUMBERED scheme grouped by knowledge domain (not build
     phase). Reuse the numbering from almanac-guide.md. Generate ONLY the files the
     project warrants — a dev tool might use only 01/03/07/08; a B2B SaaS with a
     methodology and a marketing site might use 01–12. Delete rows you don't generate. -->

```
almanac/
├── README.md                      ← You are here. Index + entry points + principles.
├── 01-overview-positioning.md     ← Problem, positioning, target users, what it is / isn't
├── 02-user-journey.md             ← End-to-end journey(s), phases, capability→journey map
├── 03-core-capabilities.md        ← Each core capability in depth
├── 04-{{DOMAIN_FRAMEWORK}}.md     ← The methodology/framework the product embodies (if any)
├── 05-{{DOMAIN_INTELLIGENCE}}.md  ← Domain/stakeholder knowledge the product reasons about
├── 06-pricing-market-gtm.md       ← Pricing, competition, market, go-to-market
├── 07-technical-overview.md       ← Topology-level architecture narrative (not code-level)
├── 08-scope.md                    ← MVP in/out of scope, deliberate deferrals
├── 09-epics-user-stories.md       ← Epics → user stories → acceptance, linked to features
├── 10-website-copy.md             ← Canonical marketing/product copy (copy as data)
├── 11-faq.md                      ← Comprehensive FAQ
└── 12-{{REFERENCE_DATA}}.md       ← LLM-reference data: question banks, rubrics, taxonomies
```

---

## Quick reference

<!-- Keel guidance: a lookup table mirroring the file map — topic → file. Keep only rows
     for files you actually generate. -->

| Topic | File |
|---|---|
| What it is and is not | [01-overview-positioning.md](01-overview-positioning.md) |
| The user journey | [02-user-journey.md](02-user-journey.md) |
| Capabilities in depth | [03-core-capabilities.md](03-core-capabilities.md) |
| {{DOMAIN_FRAMEWORK_LABEL}} | [04-{{DOMAIN_FRAMEWORK}}.md](04-{{DOMAIN_FRAMEWORK}}.md) |
| Pricing & GTM | [06-pricing-market-gtm.md](06-pricing-market-gtm.md) |
| Technical overview | [07-technical-overview.md](07-technical-overview.md) |
| Scope & deferrals | [08-scope.md](08-scope.md) |
| Website copy | [10-website-copy.md](10-website-copy.md) |
| {{REFERENCE_DATA_LABEL}} | [12-{{REFERENCE_DATA}}.md](12-{{REFERENCE_DATA}}.md) |

---

## Guiding principles

<!-- Keel guidance: 4–6 IMMUTABLE truths about the product — its constitution. Every
     contributor holds these regardless of role. Draw them from the founder interview:
     the non-negotiable product values (e.g. "outputs must be traceable to a source,"
     "structured input beats free-form prompting," "no silent data loss"). These rarely
     change; if one changes weekly it belongs in CLAUDE.md, not here. -->

1. {{PRINCIPLE_1}}
2. {{PRINCIPLE_2}}
3. {{PRINCIPLE_3}}
4. {{PRINCIPLE_4}}
5. {{PRINCIPLE_5}}

---

## Status

| Version | Date | Notes |
|---|---|---|
| {{ALMANAC_VERSION}} | {{DATE}} | {{ALMANAC_NOTES}} |
