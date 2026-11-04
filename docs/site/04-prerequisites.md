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
- **Network access to GitHub:** the repository is public, so no login, token or SSH key is needed.

> **Note:** Keel has no npm, pip or runtime dependencies. It is a plain Claude Code skill: a set of Markdown instructions the agent reads and acts on. The one exception is a user interface project where you opt into the front-end skills (impeccable, modern-web-guidance). Keel installs those through their own npx commands when it generates.
