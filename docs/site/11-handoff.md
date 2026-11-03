---
title: "Handoff"
lead: "After generation (and optional threat-model), Keel delivers a structured handoff so you know exactly where to start building."
group: "How It Works"
order: 11
slug: handoff
anchor: handoff
---

## What the handoff covers

- **What was generated:** a list of every document created, with a one-line summary of each
- **Recommended reading order:** the sequence in which a new collaborator (human or AI) should read the docs to build context efficiently
- **Open decisions:** all `[NEEDS DECISION]` markers surfaced from across the doc set, so nothing is forgotten
- **First build step:** a concrete starting point, typically "open this folder in Claude Code and start at `IMPLEMENTATION_PLAN.md` Phase 0"

## How building proceeds

Alongside the docs, Keel generates one workflow script per `IMPLEMENTATION_PLAN` phase. Running a phase script checks out a dedicated phase branch off `main`, then fans out its divisible tasks as parallel agents, each in its own `git worktree` branched off that phase branch. Every task agent starts with a finish line it has to reach: the code, its tests, the linter and one end-to-end check, plus a look in a real browser for user interface work. It cannot stop before that. Task branches merge back into the phase branch, then a **Verify** stage runs every suite once and writes an evidence record (`.keel/evidence/phase-N.json`) that the doc-sync step cites. Doc sync never re-runs the suites or re-narrates them. Doc sync is delegated to the doc-sync role and checked by the caller (see [Roles and Delegation](./13-roles.md)). Only the phase branch, carrying the doc-sync commit, ever merges to `main`.

What happens if a task's goal is not being met is a choice you make during the Delivery / Ops interview round: bounded retries then escalate to you (the default), persistent until met, or escalate on the first failure.

> The recommended first action after a Keel session: open your project folder in Claude Code, point it at `CLAUDE.md`, and say "let's start building."
