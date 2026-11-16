---
paths:
  - "{{src/payments/**}}"
---
<!--
  Keel template — .claude/rules/<area>.md (path-scoped area rules)
  WHAT: The rules for one area of the code. Claude Code loads this file only when a file matching
        `paths:` is read or edited, so it costs nothing in other sessions. Agents without path
        loading read the file whose `paths:` match the code they touch (AGENTS.md says so).
  BUILT FROM: the `paths:` header of new ADRs, and ADRs/NFRs whose text names a code path. One file
        per area (a module, a layer, a boundary); an ADR or NFR may appear in several files.
  RULE SHAPE: one or two lines per rule: what to do or never do here, then the ID that holds the
        reason. NEVER copy record text: the ADR or NFR is the home (conventions.md "Placement
        rule"); this file is a pointer that loads at the right moment.
  OWNS: Nothing. When this file and the ADR/NFR disagree, the record wins; fix the line here.
        `/keel check` flags a rules file without `paths:` or one citing an ID that does not exist.
  Delete this comment and the {{…}} placeholders when filling it in; the frontmatter stays first.
-->

# {{Area}} rules

- {{Money moves only through `{{PAYMENTS_MODULE}}`}}: ADR-{{NNN}} (`docs/adr/ADR-{{NNN}}-{{slug}}.md`).
- {{p95 under {{target}} on this path; the perf suite gates it}}: NFR-{{PERF}}-{{001}} (`docs/NFR.md`).
