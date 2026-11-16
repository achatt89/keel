# Keel mode: check

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here.

## Check Mode — `/keel check`

**Trigger:** user says "keel check", "check my docs for drift", "are my docs stale", "do the docs
still match the code", or any equivalent phrasing in a keel project.

**Read-only. No permission gate, no edits, no report file.** Nothing is written to the docs or the repo.

1. **Script first.** Run `node .keel/check.mjs` from the project root (no copy yet: run this
   skill's `references/templates/keel-check.mjs` the same way). It checks, without a model:
   missing keel files, dead relative links and `#heading` anchors, ADR index vs ADR file (missing,
   unindexed, Status stage mismatch, superseded by an ADR that does not exist), a new ADR's header
   (id or status that disagrees with the file), area rules (`.claude/rules/` without `paths:`, or
   citing an ADR/NFR that does not exist), ✅ phases with open
   gates or missing evidence, artefact and deliverable paths, non-✅ phases with no workflow
   script, and runtime dependencies (package.json, requirements.txt, go.mod, Cargo.toml) that no
   record doc names. Exit 0 = clean, 1 = findings.
2. **Clean → reply with its first line and stop.** Do not read any doc.
3. **Findings → read only the cited lines** (file:line), and for each finding say in one line
   whether it is real drift or a false positive, and which mode fixes it: doc-sync on the next
   piece of work (status, links, paths), `/keel upgrade` (keel files, format), `/keel archive`
   (stale detail), or a new ADR / Deferred row (a dependency no record names). An ADR file is
   never edited: a dead link in one is fixed at its target.

Output: the script's summary line, then the findings grouped by kind, each with its verdict and the
fixing mode. No report file.
