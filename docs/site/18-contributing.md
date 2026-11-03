---
title: "Contributing"
lead: "Keel is open source. Contributions (whether new templates, interview persona improvements, or bug fixes) are welcome."
group: "Project"
order: 18
slug: contributing
anchor: contributing
---

## Plugin structure

```text
plugins/keel/
├── .claude-plugin/
│   └── plugin.json          # plugin manifest (name, version, author)
└── skills/keel/
    ├── SKILL.md              # the instructions the agent follows
    └── references/
        ├── personas.md        # interview persona definitions
        ├── catalog.md         # document catalog and selection rules
        ├── conventions.md     # ID schemes, cross-reference syntax
        └── templates/          # one Markdown template per document type
```

## Adding a document template

1. Create a Markdown file in `skills/keel/references/templates/`.
2. Follow the conventions in `conventions.md`: stable IDs, status markers, and cross-reference syntax.
3. Register the document in `catalog.md` with a clear description of when it should be generated.
4. If the document introduces a new persona question, add it to the relevant phase in `personas.md`.

## Pull requests

- Branch off `main`.
- Keep changes focused: one concern per PR.
- Update `CHANGELOG.md` with a brief entry under the appropriate version.

Questions or ideas? Open an issue on [GitHub](https://github.com/achatt89/keel/issues) or reach out via [The Logic Atelier](https://thelogicatelier.com).
