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

Alongside the docs, Keel generates one workflow script per `IMPLEMENTATION_PLAN` phase. Running a phase script checks out a dedicated phase branch off `main`, then fans out its divisible tasks as parallel agents, each in its own `git worktree` branched off that phase branch. Every task agent opens with `/goal` — a completion condition covering the implementation, its tests, lint, and an end-to-end `verify` pass (plus a manual in-browser check via `claude-in-chrome` for UI work) — so it won't end its turn early. Task branches merge back into the phase branch, then a **Verify** stage runs every suite once and writes an evidence record (`.keel/evidence/phase-N.json`) that the doc-sync step cites — it never re-runs or re-narrates. Doc sync is delegated to the doc-sync role and checked by the caller (see [Roles & Delegation](./13-roles.md)). Only the phase branch, carrying the doc-sync commit, ever merges to `main`.

What happens if a task's goal isn't being met is a choice you make during the Delivery / Ops interview round: bounded retries then escalate to you (the default), persistent until met, or escalate on the first failure.

> The recommended first action after a Keel session: open your project folder in Claude Code, point it at `CLAUDE.md`, and say "let's start building."
