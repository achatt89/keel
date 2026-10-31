---
title: "Prerequisites"
lead: "Before installing Keel, make sure the following are available in your environment."
group: "Getting Started"
order: 4
slug: prerequisites
anchor: prerequisites
---

- **Claude Code:** installed and working. Verify with `claude --version` in your terminal.
- **git:** on your PATH. Verify with `git --version`.
- **GitHub access:** for plugin marketplace install, you'll need either `gh auth login` or an SSH key configured for GitHub. This requirement goes away once the repository is public.

> **Note:** Keel itself has no npm, pip, or runtime dependencies — it's a plain Claude Code skill, a set of Markdown instructions the agent reads and acts on. The one exception: if you opt into FE skill integration (impeccable, modern-web-guidance) for a UI project, Keel installs those via their own `npx` CLIs at generation time.
