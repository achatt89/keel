# keel 2.6.0 — 2026-11-16

Keel still writes every document it wrote before. What changes is the part an agent reads on every run: a new project now loads about 8.7 KB at session start instead of 16.1 KB, and the Keel skill itself is read in pieces instead of 100 KB at a time. Nothing was cut from a record document, and no document type was removed.

**Install:**

```
/plugin marketplace add achatt89/keel
/plugin install keel@thelogicatelier
```

**Update:**

```
/plugin marketplace update thelogicatelier
/plugin install keel@thelogicatelier
```

Restart Claude Code after installing or updating, then run /keel upgrade in an existing keel project.

Keel still writes every document it wrote before. What changes is the part an agent reads on
every run: a new project now loads about 8.7 KB at session start instead of 16.1 KB, and the Keel
skill itself is read in pieces instead of 100 KB at a time. Nothing was cut from a record
document, and no document type was removed.

Why only the working documents: *execution* documents (AGENTS.md, CLAUDE.md, COMMANDS, the
implementation plan, runbook, deployment, the indexes, hooks and subagent files) are loaded and
acted on in every session, so each extra line costs on every run. *Record* documents (BRD, PRD,
engineering design, architecture, HLD, LLD, decision records, NFR, design, compliance, threat
model and the rest) are opened for one question, and their value is being complete; they stay
full and are only checked for drift. Every line that left an execution file now lives in the one
document or script that already held it, word for word.

These changes were measured first. The evaluation in `evals/` ran the same tasks with no
documents, a minimal AGENTS.md and the full Keel set, then again with 2.6.0
(`evals/results/v0-baseline.md`, `evals/results/regression-2.6.0.md`). With the 2.6.0
documents, agents still finished every task (9 of 9 runs, as before), at about 14% lower
cost per run.

### Changed
- **A leaner keystone.** AGENTS.md workflow steps are one line each; the rules live in the
  implementation plan's "Standing rules", the mechanics and delegation in
  `.claude/workflows/README.md`. CLAUDE.md points to DESIGN.md §12 for the UI command map and
  names the review roles in one line. A written placement rule gives each kind of instruction one
  home.
- **Doc sync is proportional.** Work that changes only status lines is synced in one pass by the
  agent that did it. Work that changes a decision, requirement, command or other record document
  still goes to the doc-sync role, with review and at most three rounds.
- **Plain subagent descriptions.** The design, security and doc-sync subagents state when to use
  them, without "MUST BE USED PROACTIVELY".
- **Verify runs a real check, and a check counts only once it has been seen to fail.** Every met
  gate above `code-read` records how its check failed on broken code (`failSeen`), or it is
  `partial`. `node .keel/doc-size.mjs --evidence` rejects a Verify record that claims `prod-live`,
  has an unproven met gate or lists no gates.
- **A slimmer Keel skill.** SKILL.md is a short router (11.5 KB, from 100 KB) and each mode loads
  its own file from `references/modes/`, moved word for word. `/keel change` reads about 14 KB
  instead of 100 KB. The skill description is under 1,024 characters, with its trigger phrases
  first, so every mode is visible in the skill listing.

### Added
- **Stops and an end-of-run report.** AGENTS.md has one "stop and ask" line, filled from the
  project's own decision, NFR, compliance and threat-model rows, and asks every run to end with
  four lines: blocked on me, changed, found, could not confirm.
- **Area rules that load by path.** `.claude/rules/<area>.md` files with `paths:` frontmatter
  load only when matching code is touched. Each line is a rule plus the decision or NFR ID that
  holds the reason, never a copy of it.
- **A short header on new decision records:** `id`, `status`, `paths` and `check`. Who approved a
  decision stays in the record's own table, so it is not written twice. Decision records written
  before 2.6 are never rewritten and never given a header.
- **`/keel check`, a read-only drift check.** `.keel/check.mjs` compares the documents with the
  repository with no model call: missing keel files, dead links and anchors, the decision index
  against the decision files, header and rules-file mismatches, finished phases with open gates or
  missing evidence, and dependencies no design document names. Claude reads the cited lines only
  when there are findings. Nothing is written; it exits 1 on findings, so it can run in CI.
- **A gates hook.** The `keel-gates` Stop hook runs the size and link check when Claude stops and
  blocks once on a broken split link. It cannot loop. The modern-web-guidance reminder now fires
  on UI files only, once per session.
- **Team answers (opt-in).** A project owner can hand interview rounds to teammates as packet
  files in git: `/keel answer <packet>` answers one round, `/keel merge` lists gaps and
  contradictions for the named decider. Every answer is marked human or Claude, and a Claude
  answer never settles a dispute. The single-person interview is unchanged and stays the default.

### Fixed
- **Splitting no longer leaves a dead table of contents.** A contents list left in one part
  pointed at headings that had moved to other parts. `--split` now points those links at the part
  that holds each heading; `node .keel/doc-size.mjs --relink <doc>` repairs documents split
  before.

Run `/keel upgrade` to adopt these. Each change is offered on its own and applied only with your
approval; a cut from AGENTS.md or CLAUDE.md is offered only after the upgrade shows that its home
already holds the text. Existing decision records and evidence files are never rewritten.

---

Tag: [keel--v2.6.0](https://github.com/achatt89/keel/tree/keel--v2.6.0) · [compare with 2.5.6](https://github.com/achatt89/keel/compare/keel--v2.5.6...keel--v2.6.0) · full history: [CHANGELOG.md](CHANGELOG.md) · machine-readable: [release.json](release.json)
<!-- generated by scripts/release.mjs from CHANGELOG.md — do not edit -->
