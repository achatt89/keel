# Keel 🛳️

> Lay the keel of your next project. Keel is a [Claude Code](https://claude.com/claude-code) skill
> that interviews you about a greenfield idea, then generates a tailored, cross-referenced suite of
> foundational documents you can build the whole product from.

In shipbuilding, the **keel** is the first structural member laid down — every other part of the
vessel attaches to it. These documents are that keel for a software project: the load-bearing spec
that you (working with Claude Code) then construct the actual product from.

Keel doesn't stamp out the same fifteen files every time. It **brainstorms with you** through a
multi-persona interview, figures out what your project actually needs, and generates only those
documents — wired together with traceable IDs and cross-references.

---

## What it does

1. **Interviews you.** Keel adopts a rotating panel of expert personas — Business Analyst, Product
   Manager, Architect, Security/Compliance, Designer, Delivery/Ops — and asks targeted questions,
   adapting every follow-up to your answers. It challenges weak assumptions instead of just
   transcribing them.
2. **Proposes a tailored doc set.** Based on the interview, it recommends exactly which documents
   your project warrants (a weekend prototype and a multi-tenant regulated platform get very
   different sets), and tells you what it's deliberately leaving out and why.
3. **Generates build-ready docs.** It writes the agreed documents in dependency order, with stable
   requirement IDs, ADRs, cross-references, and a light `CLAUDE.md` index — optimized to hand
   straight to Claude Code as the source of truth for the build.

## The document suite

Keel selects adaptively from this catalog (it won't generate all of them for a small project):

| Document | What it answers |
|---|---|
| `CLAUDE.md` | The keystone index — invariants, document map, working agreements, current status |
| `BRD.md` | Business requirements — problem, objectives, constraints, risks |
| `PRD.md` | Product requirements — personas, journeys, features, roadmap |
| `ENGINEERING_DESIGN.md` | Design pillars, data classification, non-negotiables |
| `ARCHITECTURE.md` | Components, data flows, trust boundaries, controls, accepted risks |
| `HLD.md` / `LLD.md` | High- and low-level design — flows, module map, interfaces, types |
| `ADR.md` | Architecture Decision Records — every significant bet, with revisit triggers |
| `NFR.md` | Non-functional requirements — perf, security, cost, each with a verification |
| `DESIGN.md` | UX/UI design system — tokens, components, accessibility (if there's a UI) |
| `COMPLIANCE.md` / `THREAT_MODEL.md` | Data protection & threats (if you hold sensitive data) |
| `IMPLEMENTATION_PLAN.md` | Phased build plan with concrete exit gates |
| `COMMANDS.md` / `RUNBOOK.md` | How to run it; how to operate and recover it |
| `almanac/` | An optional topology-stable knowledge base (positioning, methodology, GTM, AI data) |

## How to use it

Once installed, just describe a new project to Claude Code:

```
I want to build <your idea>. Let's lay the foundations.
```

…or invoke it directly:

```
/keel
```

Keel takes it from there: intake → interview → proposed doc set → generation → handoff. Set aside a
focused session — the interview is where the value is created.

---

## Installation

### Recommended: as a Claude Code plugin

This repo is also a Claude Code **plugin marketplace**, so you can install it the first-class way:

```
/plugin marketplace add achatt89/keel
/plugin install keel@keel
```

Then restart Claude Code (or run `/plugin` to confirm it's enabled). That's it.

To update later: `/plugin marketplace update keel` then reinstall if prompted.

### Alternative: as a personal skill

Prefer a plain skill install? Clone the repo and symlink (or copy) the skill into your personal
skills directory:

```bash
git clone https://github.com/achatt89/keel.git ~/code/keel
ln -s ~/code/keel/plugins/keel/skills/keel ~/.claude/skills/keel
```

Restart Claude Code. The skill activates automatically when you talk about starting a new project,
or on `/keel`.

---

## How it's built

```
keel/
├── .claude-plugin/marketplace.json     # makes this repo an installable marketplace
└── plugins/keel/
    ├── .claude-plugin/plugin.json      # the plugin manifest
    └── skills/keel/
        ├── SKILL.md                    # the orchestrator: workflow + principles
        └── references/
            ├── interview-personas.md   # the persona panel + question banks
            ├── document-catalog.md     # adaptive doc-selection logic
            ├── conventions.md          # house style, ID schemes, cross-ref syntax
            ├── almanac-guide.md        # when & how to build an almanac
            └── templates/              # structural skeletons for every document
```

The templates are reverse-engineered from two real, hand-written project documentation sets, then
stripped to reusable, placeholder-driven scaffolds.

## Design principles

- **Interview before you write.** Doc quality is capped by interview quality.
- **Adaptive scope.** Match the paperwork to the project. No NFR suite for a static site.
- **One fact, one home.** Everything is referenced, never copy-pasted; IDs make it traceable.
- **`CLAUDE.md` stays light.** It's an index, not a dumping ground.
- **Reference material, not narrative.** Terse, scannable, table-first.

## License

MIT — see [LICENSE](./LICENSE).
