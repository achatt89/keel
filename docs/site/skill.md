Keel interviews you about a new project, then writes the documents you build it from: only the ones
your project needs, each fact in one place. Start it by describing your idea to Claude Code, or by
typing /keel.

Once a project has those documents, six more modes keep them current.

- `/keel phase new <slug>` scopes the next gated piece of work: a plan block with exit gates,
  reserved decision-record numbers and a workflow script.
- `/keel change <slug>` logs a hotfix-sized change on its own branch, with no phase around it.
- `/keel closeout` turns the open deferred items into a phase of their own, so postponed work gets
  scheduled instead of forgotten.
- `/keel upgrade` audits the documents against the current keel standard, reports what has drifted,
  and applies only the fixes you approve, including migration from an older format.
- `/keel archive` moves finished or superseded detail into archives, and splits any document still
  over its size budget. Nothing is deleted, and every move leaves a link behind.
- `/keel version` reports the installed version, the version that last touched this project's
  documents, each document's size against its budget, and whether a newer keel is published.

Upgrade and archive show you the plan first and change nothing until you approve it.
