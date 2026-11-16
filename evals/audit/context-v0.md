# Keel context and prompt audit v0 (N3)

_16 Nov 2026 · base `main` 48d2f3f (keel 2.5.5) · report only, nothing in Keel changed · numbers from `node evals/audit/measure.mjs`_

**Result.** A fresh Keel 2.5.5 project puts about **16.1 KB (~4,000 tokens)** into every Claude Code session. Real 2.x projects on disk sit at **12.2–20.3 KB**. The proposed execution-tier cuts below take a fresh project to about **9.3 KB (~2,300 tokens), −42%**, and every byte removed already exists word for word in a record document or a script. The largest single cost is not the project: it is **Keel's own SKILL.md, 94 KB (~23,500 tokens) read in full on every `/keel` run**, including a 2 KB hotfix (`/keel change`). Ritual wording in the templates is light: 37 flagged lines in generated execution text, mostly emphatic capitals in subagent descriptions and blanket "before any / after every" triggers; no "think carefully", scratchpad or verify-twice rules.

**How to read the numbers.** Bytes are exact. Tokens are an estimate (bytes ÷ 4); no tokenizer was used. "Always-loaded" means what Claude Code reads at session start for the project: `CLAUDE.md` plus its `@` imports, `.claude/rules/*.md` without a `paths:` filter, and the frontmatter of project subagents and skills (their listing). Hook output is counted per event, not at start. User-level files (`~/.claude/CLAUDE.md`, plugins) are out of scope.

## 1. Always-loaded bytes, fresh project

A fresh project is the templates with the Keel guidance comments removed, as SKILL.md tells the generator to do. Placeholders (`{{…}}`) stay, so real fill-ins move the number by a few hundred bytes either way.

| File | Tier | Bytes | ~tokens |
|---|---|---:|---:|
| CLAUDE.md | execution | 4,148 | 1,037 |
| AGENTS.md (via `@AGENTS.md`) | execution | 10,765 | 2,691 |
| `.claude/agents/design.md` frontmatter | execution | 342 | 86 |
| `.claude/agents/security.md` frontmatter | execution | 386 | 97 |
| `.claude/agents/doc-sync.md` frontmatter | execution | 468 | 117 |
| `.claude/rules/` | — | 0 (Keel writes none yet) | 0 |
| **Total at session start** | **all execution** | **16,109** | **~4,030** |

Every always-loaded byte is execution tier. No record document is loaded at start, so the tier rule (record stays full) costs nothing at session start.

**Hooks** (per event, not at start):
- `modern-web-guidance-hook.mjs`, PostToolUse on Write/Edit/MultiEdit: about **305 B per matching edit**. Its pattern matches `.js .mjs .ts` too, so it fires on backend code, tests and config, not only UI.
- `keel-update-check.mjs`, SessionStart (opt-in): writes `systemMessage`, shown to the person, not the model; 0 B of model context when there is nothing to report.
- impeccable's own hook: installed by impeccable, not Keel; not measured.

### Where the 15 KB of AGENTS.md + CLAUDE.md goes (comments stripped)

| Section | Bytes | Duplicated in |
|---|---:|---|
| AGENTS "Git & working workflow" (steps 0–9) | 4,611 | IMPLEMENTATION_PLAN "Standing rules" (same rules), `workflows/README.md` and the phase script (the mechanics) |
| CLAUDE "Active skills" (impeccable table, modern-web-guidance) | 2,458 | DESIGN.md §12.1 and §12.2, in full |
| AGENTS "Document map" | 2,083 | `docs/README.md` |
| CLAUDE "Review subagents" table | 1,099 | AGENTS steps 5 and 9, plus the subagent descriptions already in the listing |
| AGENTS "Hard invariants" | 975 | not duplicated (the table points to the full list) |
| AGENTS "Pre-PR checklist" | 944 | derived from the invariants and steps 3, 5, 7, 9 |
| AGENTS "Delegation" | 872 | the Report block in each `.claude/agents/<role>.md` |
| AGENTS "Working agreements" | 648 | partly IMPLEMENTATION_PLAN "Standing rules" |
| CLAUDE "Workflow tooling" | 480 | — |
| AGENTS "Current status" | 317 | — |
| Titles and intro lines | ~460 | — |

## 2. Real projects on disk (read only)

| Project | keel | Always-loaded | ~tokens | Subagent/skill bodies (on demand) | Execution docs | Record docs | Hooks |
|---|---|---:|---:|---:|---:|---:|---:|
| cortextOS | 2.5.4 | 20,346 | 5,087 | 21.0 KB | 240 KB (7) | 2,386 KB (190) | 4 |
| dossier | 2.5.4 | 16,695 | 4,174 | 25.5 KB | 67 KB (6) | 1,356 KB (155) | 3 |
| mapsake | 2.5.4 | 14,742 | 3,686 | — | 108 KB (8) | 952 KB (177) | 0 |
| ospraye | 2.0.0 | 16,398 | 4,100 | 31.3 KB | 170 KB (8) | 1,749 KB (99) | 2 |
| pumpfun-scanner | 2.0.0 | 12,181 | 3,045 | — | 157 KB (8) | 544 KB (38) | 0 |
| mysha | 1.3.0 | 13,474 | 3,369 | — | 141 KB (7) | 902 KB (12) | 2 |
| interview-strategist | 1.3.0 | **90,500** | **22,625** | 173 KB | 357 KB (4) | 558 KB (13) | 2 |

- Doc columns count every `.md` under `docs/` (minus `archive/` folders) plus AGENTS/CLAUDE.md, tiered by file name. Record counts include non-Keel docs such as research notes, so they overstate Keel's share.
- **2.x projects hold AGENTS.md near the 12 KB budget** (10.5–12.3 KB). The budget works; the rest of the load is CLAUDE.md (0.8–4.6 KB) and listings.
- **cortextOS is the largest 2.x load** (20.3 KB): AGENTS.md 12.3 KB, CLAUDE.md 4.6 KB, and 2.3 KB of project-local skill listings (impeccable, modern-web-guidance).
- **interview-strategist (1.3.0) loads 90.5 KB** every session: an 85 KB CLAUDE.md. `/keel upgrade` already has the 1.x → 2.0 format migration; this project has not run it.
- **dossier registers the modern-web-guidance hook twice** (`settings.json` and `settings.local.json`), so each matching edit adds the reminder twice (~610 B).

## 3. The Keel skill itself

| What | Bytes | ~tokens | When it loads |
|---|---:|---:|---|
| SKILL.md frontmatter (name + description) | 2,242 | ~560 | Every session of every project where the plugin is installed (skill listing) |
| SKILL.md body | 94,137 | ~23,500 | In full on every `/keel …` run, whatever the mode |
| references (6 guides) | 115,664 | ~28,900 | On demand, per mode |
| references/templates (43 files) | 355,337 | ~88,800 | On demand, while generating |

SKILL.md by section: The workflow (interview + generation) 34.5 KB · Upgrade mode 29.8 KB · Archive mode 7.5 KB · Version mode 4.9 KB · Phase mode 3.9 KB · Operating principles 2.9 KB · Change mode 2.0 KB · Closeout mode 1.7 KB · rest 6.9 KB.

- **`/keel change` reads 94 KB to use a 2 KB section**, and `/keel phase new` 94 KB for 3.9 KB.
- **The description is 2,145 characters.** This session's own skill listing shows it cut off mid-sentence ("…(triggers: … "), so the closeout, upgrade and archive trigger phrases at its end are not seen by the model that decides whether to call Keel.

## 4. Ritual wording in the templates

The scanner flags seven kinds of wording: think-prompts ("think carefully", "step by step"), effort exhortations ("without fail", "non-negotiable"), shouting capitals (MUST, NEVER, ALWAYS, EXACTLY…), verify-twice and re-read rules, scratchpads, reminders ("make sure", "remember to"), and blanket triggers ("before any", "after every"). It is a regex, so the list below was checked by hand line by line. It cannot find a ritual phrased in plain words; §4.4 covers the ones found by reading.

**Totals (70 flagged lines in 43 template files):**
- **Generated execution text: 37.** Fixes are in §4.1.
- **Keel guidance comments: 19.** These are deleted at generation, so they cost an agent nothing. No change.
- **Record-tier text: 13.** Out of scope for cuts by the tier rule.
- **Hook script header: 1.** A code comment the model never sees.

There are **no** think-carefully, scratchpad or verify-twice rules in generated text. Six "step-by-step" hits sit in record-tier guidance comments and are instructions to the document author, not to the agent.

### 4.1 Execution tier, generated text: line, problem, proposed fix

| File:line | Wording | Problem | Proposed fix |
|---|---|---|---|
| agents/design.md:3 | "MUST BE USED PROACTIVELY, without being asked" | Capitals in a description that sits in every session's listing; current Claude models over-trigger on emphatic instructions | "Use before building a new screen or flow, and after UI edits…" (trigger conditions, no capitals). **Test in N2 first**: under-delegation is the risk |
| agents/security.md:3 | same | same | "Use when a task that changed code finishes, before it is reported done…" Same N2 test |
| agents/doc-sync.md:3 | same, plus "after any piece of work" | same | "Use after a piece of work, before the commit that completes it…" Same N2 test |
| agents/design.md:14 | "before any new UI pattern" | Repeats the hook reminder | Keep (the subagent body loads only on delegation) |
| AGENTS.md:77 | "before any feature work" | Fine: a one-time step | Keep |
| AGENTS.md:81 | "inside a Claude Code session… fans out…" | Script mechanics in the keystone | Move the sentence to `workflows/README.md` (already there); AGENTS step 2 keeps the command |
| AGENTS.md:84 | Step 5, 900 B: the doc-sync loop in prose | The script runs this loop; the keystone repeats it | Cut to one line: "Delegate doc sync before the completing commit (`doc-sync.js`; ≤3 rounds, then deferred items)." The detail stays in IMPLEMENTATION_PLAN Standing rules |
| AGENTS.md:86 | "Decisions captured without fail" | Exhortation; the rule is the ADR, not the emphasis | "Decisions → `docs/adr/` before merge." The detail stays in Standing rules |
| CLAUDE.md:28, 30 | Review table "after any task…" | Duplicates AGENTS steps 5 and 9 and the agent descriptions | Replace the table with one line: "Review roles: `.claude/agents/` (security, design, doc-sync); rules in AGENTS steps 5 and 9." |
| CLAUDE.md:44, 74, 77 | "fires after every UI/FE file edit", "before any new UI pattern" | Tells the agent what the hook already does; DESIGN §12 holds the full text | Replace "Active skills" with: "UI work: design subagent; hooks fire on edit; commands in DESIGN.md §12." |
| COMMANDS.md:30 | "fill in the REQUIRED vars" | Capitals used as a label, harmless | Keep, or "required" in lower case |
| COMMANDS.md:46 | "MUST be different roles" (foot-gun example) | Placeholder example text | Keep the foot-gun; lower case "must" in the example |
| COMMANDS.md:135 | "ALWAYS before new app code" | An ordering rule that only matters at deploy | Keep the order; enforce it in the deploy script, not with capitals |
| IMPLEMENTATION_PLAN.md:62, 65, 227 | "Every phase…", "After every unit of work…", "Mandatory pre-merge" | Correct rules, but stated in three places (here, AGENTS, workflows/README) | Keep here (this is the home); cut the copies from AGENTS |
| IMPLEMENTATION_PLAN.md:66 | "without fail" | Exhortation | Drop "without fail" |
| RUNBOOK.md:185 | "Before every major feature launch" | A real schedule | Keep |
| workflows/README.md:19, 64 | "before any manual merge", "Every task agent opens with `/goal`" | Accurate descriptions | Keep |
| workflows/change-template.js:74 | "search before any new pattern" | Repeats the hook | Keep (task prompt, loaded only in the script) |
| workflows/change-template.js:107, phase-template.js:216 | "NEVER 'prod-live'" | A rule a checker could enforce | Keep the words, and have `doc-size.mjs` or Verify reject `prod-live` in evidence files written by Verify. Then the capitals can go |
| workflows/doc-sync.js:37 | "Mandatory doc sync — MUST run" | Capitals in a header comment of a script that only runs when invoked | Lower case; no behaviour change |
| workflows/doc-sync.js:124, phase-template.js:225 | "EXACTLY this block/shape" | A parsed format; the emphasis is doing real work | Keep, or validate the JSON and drop the capitals |
| workflows/doc-sync.js:271 | "NEVER touch: the 🔄 / ⬜ phases…" | A guard on archiving | Keep (`doc-size.mjs` enforces part of it already) |
| workflows/doc-sync.js:293 | "every time" | Descriptive | Keep |
| workflows/phase-template.js:30, 31, 35, 74, 119 | "every task", "before any task runs", "before any new UI pattern" | Code comments and task prompts, accurate | Keep |
| workflows/phase-template.js:256 | "MANDATORY — do not skip" | Code comment on a stage the script always runs | Drop the comment's capitals; the script cannot skip it anyway |

### 4.2 Guidance comments (deleted at generation): no change

AGENTS.md:11, 105 · ARCHITECTURE.md:11, 191 · BRD.md:10 · CLAUDE.md:39 · COMMANDS.md:43, 187 · CONNECTOR_SPEC.md:107, 202 · DEPLOYMENT.md:83 · ENGINEERING_DESIGN.md:52 · HLD.md:6, 91, 115 · PRD.md:129 · THREAT_MODEL.md:84 · adr/README.md:43 · almanac/README.md:92

### 4.3 Record tier, generated text: no cut, by the tier rule

CONNECTOR_SPEC.md:112, 116, 137, 187 (contract "MUST", RFC style, correct) · LLD.md:133, 166, 243 (integration rules) · DESIGN.md:278, 305, 328 (skill lifecycle; this is the home of the text cut from CLAUDE.md) · ARCHIVE_REPORT.md:76 · SPIKE.md:66 · UPGRADE_REPORT.md:135 · modern-web-guidance-hook.mjs:3 (code comment).

### 4.4 Rituals found by reading, not by the regex

| Where | Ritual | Proposed fix (execution tier) |
|---|---|---|
| AGENTS template, "read the relevant one *before* touching code" | A blanket read-first instruction on every task | Point to the exact doc per area through path-scoped `.claude/rules/` (roadmap D3); the keystone line becomes "Area rules load by path." |
| AGENTS "Pre-PR checklist" (944 B) | A ten-box checklist the agent reads every session and ticks by hand | Keep the invariant boxes. Move the standing gates (size check, doc-sync commit present) into a pre-commit or Stop hook that runs `node .keel/doc-size.mjs` |
| modern-web-guidance hook | The same ~305 B reminder after every `.js/.ts/.mjs` edit, backend included | Match UI paths only (or `.html/.css/.tsx/.jsx/.vue/.svelte/.astro`), and remind once per session (marker under `.keel/`). Upgrade detects duplicate registration (dossier) |
| CLAUDE "Review subagents" plus AGENTS steps 5 and 9 plus agent descriptions | The same "review before done" rule in four places | One home: the AGENTS step. The rest point to it |

Keel's own SKILL.md (not a template) has 13 hits. Three "non-negotiable" hits (SKILL.md:468, 517, 1223) are a product term, not exhortation. The rest are minor ("re-read principle 2" at :617, "These rules are non-negotiable" at :999 and :1334). They are an input for the slim-skill change (D1), not for this report.

## 5. Proposed execution-tier cuts

Every cut moves text to a place that already holds it, or turns a rule into a check. No document type is removed; no record document changes.

| # | Cut | From → to | Saves (fresh) |
|---|---|---|---:|
| C1 | CLAUDE "Active skills" → a one-line pointer | CLAUDE.md → DESIGN.md §12 (already full) | ~2,100 B |
| C2 | AGENTS workflow steps 0–9 → one line each | AGENTS.md → IMPLEMENTATION_PLAN "Standing rules" + `workflows/README.md` (already hold the detail) | ~2,800 B |
| C3 | CLAUDE "Review subagents" table → one line | CLAUDE.md → AGENTS steps 5 and 9 + `.claude/agents/` | ~800 B |
| C4 | AGENTS "Delegation" → one line | AGENTS.md → `workflows/README.md` + each agent's Report block | ~700 B |
| C5 | Pre-PR standing gates → hook | AGENTS.md → a pre-commit or Stop hook running `doc-size.mjs` | ~450 B |
| C6 | Agent descriptions: trigger conditions, no capitals | `.claude/agents/*.md` frontmatter | ~150 B, plus less over-triggering (**N2 must test this**) |
| C7 | modern-web-guidance hook: UI paths, once per session | `.claude/hooks/` | ~305 B × backend edits per session |
| | **Fresh project total** | 16.1 KB → ~9.3 KB | **~6.85 KB (−42%)** |

Outside the project, for D1 (slim skill): split SKILL.md into a router (≤15 KB) plus `references/modes/<mode>.md` loaded per mode. `/keel change` would read ~17 KB instead of 94 KB. Cut the description to ≤1,024 characters with the trigger phrases first.

**Upgrade path (each cut, when built):** `/keel upgrade` proposes it as a diff and applies only on approval:
- **C1–C4:** shows the section and its existing home, checks the home holds the text, then offers the one-line pointer.
- **C5, C7:** offers the hook and flags duplicate registrations.
- **C6:** offers the new descriptions.
- **Older projects:** a 1.x project such as interview-strategist gets the existing 2.0 format migration first.

**Gate.** Per the spawn plan, none of these cuts should merge before the N2 baseline is on main. C6 and C2 change agent behaviour and need an N2 run to compare against.

## 6. Limits

- Fresh-project numbers come from templates, not from a real `/keel` interview run; placeholders and optional sections (Active skills applies to UI projects only) shift them.
- Tokens are bytes ÷ 4, not a tokenizer count. A count_tokens run would firm them up.
- Whether Claude Code strips HTML comments from CLAUDE.md before loading was not checked; it does not matter here because generated files have none (raw = stripped in all seven projects).
- Skill and subagent listing bytes use the whole frontmatter, a slight overcount of what the listing shows.
- The ritual scan is a regex plus one reading. Ritual wording phrased without its trigger words can be missed.
- Real-project hooks were read from settings files. Hook output was not run.

## Reproduce

```
node evals/audit/measure.mjs --self-test
node evals/audit/measure.mjs fresh
node evals/audit/measure.mjs project ~/code/<project> …
node evals/audit/measure.mjs skill
node evals/audit/measure.mjs ritual [files…]   # default: all templates
```
