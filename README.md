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

## Documentation

Full documentation is available at **[achatt89.github.io/keel](https://achatt89.github.io/keel/)** — installation guides, how it works, the document catalog, and contributing notes.

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
   straight to Claude Code as the source of truth for the build. The `CLAUDE.md` it produces bakes
   in your **ways of working** — git-from-commit-one, branch-per-feature, parallel agents in
   isolated `git worktree`s, and documentation kept in lockstep with code after every chunk/phase.
4. **Threat-models and hardens the docs.** Optionally, Keel runs an adversarial threat-modelling
   pass over the documents it just wrote and **fixes the weaknesses directly in them** — adding
   controls, security NFRs, ADRs, and exit gates so the spec itself is hardened, not just annotated
   with a risk to fix later.

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

## Installation & setup

### Prerequisites

- **[Claude Code](https://claude.com/claude-code)** installed and working (run `claude --version`).
  Plugin install requires a build with the `/plugin` command (run `/plugin` once to confirm it's
  available; if it isn't, update Claude Code or use the personal-skill method below).
- **git** on your `PATH` (`git --version`).
- For installing from this **private** repo: a GitHub account with access to it, authenticated
  either via the [`gh` CLI](https://cli.github.com/) (`gh auth login`) or an SSH key / credential
  helper that can clone `achatt89/keel`. *(Once the repo is made public, no auth is needed.)*

### Method A — as a Claude Code plugin (recommended)

This repo doubles as a Claude Code **plugin marketplace**, so you can install it the first-class
way. In a Claude Code session:

```
/plugin marketplace add achatt89/keel
/plugin install keel@thelogicatelier
```

- `marketplace add` registers this repo as a source (`achatt89/keel` resolves to GitHub; you can
  also pass a full `https://github.com/achatt89/keel.git` URL or a local path). The catalog
  registers under its manifest name, **`thelogicatelier`**.
- `install keel@thelogicatelier` installs the `keel` plugin from the `thelogicatelier` marketplace
  — the syntax is `<plugin>@<marketplace>`.

Restart Claude Code (or reload the window) so the skill registers. Verify with **Verify the
install** below.

**Update later:**

```
/plugin marketplace update thelogicatelier
/plugin install keel@thelogicatelier
```

**Uninstall:** `/plugin uninstall keel@thelogicatelier` (and optionally `/plugin marketplace remove
thelogicatelier`).

### Method B — as a personal skill

Prefer a plain skill install (no plugin system)? Clone the repo and symlink the skill into your
personal skills directory:

```bash
git clone https://github.com/achatt89/keel.git ~/code/keel
mkdir -p ~/.claude/skills
ln -s ~/code/keel/plugins/keel/skills/keel ~/.claude/skills/keel
```

A symlink means `git pull` in `~/code/keel` keeps the installed skill up to date. Prefer a copy
instead of a symlink? Swap the last line for:

```bash
cp -R ~/code/keel/plugins/keel/skills/keel ~/.claude/skills/keel
```

Restart Claude Code so it picks up the new skill.

**Project-scoped install** (only inside one repo, e.g. to share with a team via version control):
symlink/copy into that repo's `.claude/skills/keel` instead of `~/.claude/skills/keel`.

**Uninstall:** `rm ~/.claude/skills/keel` (removes the symlink/copy; the cloned repo is untouched).

### Verify the install

- Plugin method: run `/plugin` and confirm **keel** is listed and enabled.
- Either method: type `/keel` — the skill should be offered. Or simply tell Claude Code
  *"I want to start a new project, let's lay the foundations"* and Keel should activate.

### First run

There's no configuration step — Keel is prompt-driven. When you run it:

1. Open the **target project folder** in Claude Code (Keel writes the generated docs into your
   working directory; it will confirm where if it's ambiguous).
2. Start the session and describe your idea. Keel runs: intake → multi-persona interview →
   proposed doc set → generation → optional threat-model & harden → handoff.
3. Set aside a focused block of time — the interview is where the value is created.

If you want Keel to also initialize git in the folder and follow the branch-per-feature /
worktree workflow it documents, just say yes when it asks during the ways-of-working round.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `/plugin marketplace add` fails to fetch | Confirm repo access: `gh repo view achatt89/keel`. Authenticate with `gh auth login`, or use the SSH URL, or use **Method B**. |
| `/plugin` command not found | Your Claude Code build predates plugins — update it, or use **Method B**. |
| `/keel` not recognized after install | Restart Claude Code / reload the window so skills re-register. For Method B, check the symlink resolves: `ls -l ~/.claude/skills/keel`. |
| Skill loads but can't find its references/templates | Don't move files out of the skill folder — keep `references/` next to `SKILL.md`. Reinstall if the tree was altered. |

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
