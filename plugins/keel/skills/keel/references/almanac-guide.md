# The almanac — a topology-stable knowledge base

The `almanac/` is an optional, numbered knowledge base that lives *alongside* the formal docs. Its
defining property: it is **decoupled from sprint cadence**. Where `CLAUDE.md` and
`IMPLEMENTATION_PLAN.md` track the *timeline* of the build (what's done, what's next), the almanac
captures the *topology* of the product (what it is, how we think about the problem, how we go to
market) — knowledge that doesn't change when a sprint ends, only when the product's understanding
genuinely shifts.

## When to include an almanac

Include it **only** when the project has durable, reusable knowledge worth a stable home — typically
when one or more of these is true:

- There's a **product/positioning/GTM** dimension (real users, marketing, pricing, competition).
- There's a **methodology or domain framework** the product embodies and that the team must share.
- There's **LLM-reference data** — question banks, rubrics, frameworks, taxonomies — that gets fed
  into prompts/agents and should live in one referenceable place, not embedded in code.
- Multiple **audiences** (engineers, product, design, marketing, AI) need a shared source of truth.

Do **not** include it for engineering-only tools, libraries, or internal scripts where the formal
docs already cover everything. Most prototypes don't need one. When in doubt, leave it out and
offer it as a later add.

## Why it's separate from the formal docs

| Formal docs (`docs/`) | Almanac (`almanac/`) |
|---|---|
| Timeline + contract: requirements, architecture, plan | Topology: positioning, methodology, GTM, reference data |
| Update cadence: per sprint / per decision | Update cadence: when product *understanding* changes |
| Audience: primarily builders | Audience: builders **and** product/design/marketing/AI |
| Goes stale if not maintained | Ages gracefully; stable institutional memory |

The split solves the "documentation rots when it mirrors codebase state" problem: durable knowledge
isn't trapped in a sprint-scoped file.

## Structure

A flat, **numbered** directory. Numbers group by knowledge domain (not build phase), so a reader
navigates by "what do I need to know," not "what phase are we in." Start with a `README.md` that is
an index + entry-points-by-audience + guiding principles, then numbered files. Adapt the set to the
project; a representative scheme:

```
almanac/
├── README.md                    # index, entry points by audience, guiding principles
├── 01-overview-positioning.md   # problem, positioning, target users, what it is / isn't
├── 02-user-journey.md           # end-to-end journey(s), phases, capability→journey map
├── 03-core-capabilities.md      # each core capability in depth
├── 04-<domain-framework>.md     # the methodology/framework the product embodies (if any)
├── 05-<domain-intelligence>.md  # domain/stakeholder knowledge the product reasons about
├── 06-pricing-market-gtm.md     # pricing, competition, market, go-to-market
├── 07-technical-overview.md     # topology-level architecture narrative (not code-level)
├── 08-scope.md                  # MVP in/out of scope, deliberate deferrals
├── 09-epics-user-stories.md     # epics → user stories → acceptance, linked to features
├── 10-website-copy.md           # canonical marketing/product copy (copy as data, not strings)
├── 11-faq.md                    # comprehensive FAQ
└── 12+-<reference-data>.md      # LLM-reference data: question banks, rubrics, taxonomies
```

Only generate the files the project warrants. A B2B SaaS with a methodology and a marketing site
might use 01–11 plus reference-data files; a developer tool might use only 01, 03, 07, 08.

## README & guiding principles

The almanac `README.md` should:

- Reorient the reader **away from phase/sprint structure**: "if you need X, read file Y" — entry
  points by audience (new teammate, feature builder, AI/prompt work, copywriter).
- Carry a short **guiding principles** list: the 4–6 immutable truths about the product that every
  contributor must hold (e.g. "outputs must always be traceable to a source," "structured input
  beats free-form prompting," "no silent data loss"). These are the product's constitution.
- Include a version/date stamp.

## House rules for almanac files

- Each file: ~100–250 lines, hierarchical headings, cross-links to sibling files ("Deep dive:
  `05-…` §2").
- **Copy as data:** marketing/product copy lives here (and is referenced by the UI), not hardcoded
  in components — so there's one place to change a headline.
- **Reference data as a module:** rubrics/question-banks/frameworks live here so prompts can say
  "use the framework in `almanac/12-…`" instead of embedding it.
- Stable, not sprint-scoped. If a fact changes every week, it belongs in `CLAUDE.md`/the plan, not
  the almanac.
