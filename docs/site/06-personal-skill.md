---
title: "Personal Skill Install"
lead: "Method B: install directly from the repository. A symlink keeps the skill updated when you pull."
group: "Getting Started"
order: 6
slug: personal-skill
anchor: personal-skill
---

## User-global install (symlink)

```bash
git clone https://github.com/achatt89/keel.git ~/code/keel
mkdir -p ~/.claude/skills
ln -s ~/code/keel/plugins/keel/skills/keel ~/.claude/skills/keel
```

The symlink approach means a `git pull` inside `~/code/keel` automatically updates the skill, no reinstall needed. Restart Claude Code after cloning.

## Update

```bash
git -C ~/code/keel pull
```

Then restart Claude Code.

## Copy instead of symlink

```bash
cp -R ~/code/keel/plugins/keel/skills/keel ~/.claude/skills/keel
```

You need to copy it again to pick up updates.

## Project-scoped install (team use)

To make Keel available only within a specific project (useful for teams where not everyone has it installed globally): symlink or copy into the project's own skills directory:

```bash
mkdir -p .claude/skills
ln -s ~/code/keel/plugins/keel/skills/keel .claude/skills/keel
```

Commit the `.claude/skills/keel` directory (not the symlink) if you want the skill to travel with the repo.
