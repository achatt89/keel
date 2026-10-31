---
title: "Plugin Install"
lead: "Method A, recommended for most users. The plugin marketplace handles installation, updates, and uninstallation."
group: "Getting Started"
order: 5
slug: plugin-install
anchor: plugin-install
---

## Install

```
/plugin marketplace add achatt89/keel
/plugin install keel@thelogicatelier
```

Restart Claude Code after running these commands. Verify the install with `/plugin`.

## Update

```
/plugin marketplace update thelogicatelier
/plugin install keel@thelogicatelier
```

`marketplace update` fetches the latest manifest from GitHub and refreshes the local cache. `plugin install` alone reads from that cache; running it without the update step first will reinstall the version Claude Code already knows about, not the latest one.

Then restart Claude Code and run `/keel upgrade` in each project keel has documented, so its docs and workflow scripts pick up the new version.

## Uninstall

```
/plugin uninstall keel@thelogicatelier
```
