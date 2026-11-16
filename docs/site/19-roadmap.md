---
title: "Roadmap"
lead: "What Keel will do next, in order. No dates: each step starts when the one it depends on is done."
group: "Project"
order: 19
slug: roadmap
anchor: roadmap
---

## The direction

Keel started as a way to write a full set of project documents. The documents are not the goal. The goal is that the coding agents working on your project make the right decisions, stop when they should, and prove their work.

Keel still writes the full documentation set for every project: business case, product requirements, architecture, design, decision records, threat model, plan, runbook and every other document type. A type that does not apply yet is a short stub that says why and when to write it. That does not change, and the roadmap never drops a document type. What changes is the documents agents work from day to day: they get shorter and easier for an agent to use, and their rules move into places that enforce them. The documents that hold the business and design thinking stay full. The section "Two kinds of document" below lists which is which.

So the roadmap makes the working documents short, adds the rules that steer your agents, keeps the record complete, and then checks that it works. Four ideas run through every step:

- **Measure first.** Long instruction files can make agents slower and less accurate, not better. Keel will test its own output on real tasks before adding more, and publish the result whatever it shows. The measurement can make a working document shorter; it cannot shorten a record document or remove any document.
- **Put each rule where it works.** A fact goes in the main instructions file. A procedure becomes a skill. A "never do this" becomes a hook or a permission setting that actually stops the action. A rule for one part of the code loads only when that part is touched.
- **The full set stays.** Every project still gets every document type, in full or as a stub saying why it does not apply yet. A working document can get shorter or move its rules into a hook or a setting; a record document is never shortened. No document is dropped. Removing a document type would need the written approval of Keel's maintainer first.
- **Existing projects come along.** Every change reaches projects Keel already documented through `/keel upgrade`. The section "How existing projects adopt this" below says how.

## Two kinds of document

**Working documents** are what agents act from: AGENTS.md, CLAUDE.md, COMMANDS, the implementation plan, the runbook, deployment state, PRODUCT, and the indexes of the docs folder and of the decision records. Agents read some of these on every run, so every extra line costs on every run. These get shorter: facts, pointers and steps, with the reasoning kept in the record document they link to.

**Record documents** hold the business and design substance: business case (BRD), product requirements (PRD), engineering design, architecture, high-level and low-level design (HLD, LLD), decision records, non-functional requirements (NFR), design, compliance, threat model, extension contracts, cost analysis, investigations, audits, feedback rounds, the changelog and the almanac. Agents open them for a specific question. These stay full. The roadmap only checks that they still match the code. A very large one may still be split into parts, or have finished detail archived, but word for word: nothing is cut.

Where the line is close, the call is:

- **Design:** a record document, kept full. Its "always" and "never" rules are also written as area rules for the interface code, pointing back to it.
- **Engineering design:** a record document. Build steps it implies go into the plan.
- **Deployment:** a working document. Every hosting decision is recorded first in a decision record or the architecture.
- **Implementation plan:** a working document, but each phase's scope and acceptance criteria stay word for word.

Nothing leaves a working document without going somewhere: to a record document or to an enforced rule.

## Now

**Fix the known bugs** (done in Keel 2.5.6). The split tool refuses paths outside the project (a security fix). References to a numbered section, such as section 9 of the architecture document, follow that section when a document is split. Closeout phases are numbered correctly, and the empty placeholder row in the deferred items table is no longer counted as open work.

**Measure Keel** (baseline done; repeated for Keel 2.6.0). A small test: the same few greenfield tasks, run by the same agent three ways (no documents, one short instructions file, the full Keel set). The end state is graded, and success, cost and length of context are recorded. The grader is itself tested on broken work, so a pass means something. This first run is the baseline, taken before anything below changes, and it is repeated after. The result can recommend shorter working documents, never a shorter record document and never a missing one: any proposal to remove a document type needs the written approval of Keel's maintainer.

**Measure what every project loads** (done). How much text a Keel project puts in front of the agent on every run, how large the Keel skill is, and which generated lines are ritual wording ("think carefully") that costs money for no gain.

**Leaner output** (shipped in Keel 2.6.0, together with team answers below). Every document type stays. Size limits and shortening apply to the working documents only; the record documents stay full:

- A slimmer Keel skill: a short core, with each mode loaded only when you use it.
- A shorter main instructions file (AGENTS.md) that holds facts, pointers and one "when to stop and ask" rule, plus a fixed end-of-run report: blocked on me, changed, found, could not confirm.
- Rules for one area of the code, written to `.claude/rules/` with the paths they cover, so they load only when those files are touched. Each rule points to its decision record and never copies it.
- A short header on new decision records: id, status, the paths it governs, and how it is checked. Who approved it stays in the record's own table, so it is not written twice.
- Plain wording in the Verify step: run a real check before calling work done, and a new evidence level, "check seen to fail when it should".

**Team answers** (opt-in, shipped in Keel 2.6.0 as its own pull request). Today one person answers the whole interview. With team answers, each interview round can go to the person who knows it best. The "Team answers" section below has the details. It ships in its own pull request and stays off unless you turn it on, so the measurement above can still tell what the output changes did on their own.

## Next

**Rules that are enforced, not just written.**

- A permissions baseline filled from your documents: trusted services from the architecture, blocked actions from the threat model.
- A guard hook that knows which decision records govern a file. On a protected path it asks a person or blocks, and it fails closed.
- An audit trail of what each agent session did, kept in `.keel/audit/`.

**Risk tiers and review.**

- A table of low, medium and high risk paths, with how many people must approve each. Paths you list always need a person; a bot never counts as a person; new commits cancel earlier approvals.
- A code owners file and branch protection settings generated from that table.
- Merging with no human approval is possible only for the low tier, only if you opt in, and only once real required checks exist.
- A review guide (REVIEW.md), a pull request template with Testing, Risk and How to revert, and review rules: three rounds at most, re-review only what changed, never repeat a finding. A finding that keeps coming back becomes a rule, a lint check or a skill.

**A "done" contract per phase.** Numbered acceptance criteria, each with how it is checked; a one-line "done when" an agent can work towards; a flag for whether the phase needs a separate evaluator (off by default); and a notes file for anything built differently from the plan.

**Checks that run.** A CI starter with build, test, lint and type checks as required checks, plus verification skills for the front end, the API and the command line, seeded from your requirement, design and threat model documents.

**A drift check, `/keel check`.** Read-only. Scripts look for documents that no longer match the code; the model is called only when a script finds something. One report.

**Running without a person at the keyboard.** Recipes for running the checks from a GitHub Action, a scheduled Claude Code task, an Agent SDK script and Codex. A protected path must be blocked on each before Keel says it supports that tool.

## Later

**Opt-in background jobs.** Chosen during generation, off by default, no server:

- a pull request opens: drift check;
- a pull request merges: a draft pull request with the documents brought up to date;
- a weekly health report: stale deferred items, missing evidence, decisions due for review, Keel version.

These jobs never merge, never change code and never rewrite a decision. Factual drift (a path, a version, a size) may be proposed; a change to a decision is only flagged.

**Agents as part of the team.** An agent roster (what each agent does, what it may not do, who owns it) and an autonomy ledger, where each kind of task moves from watched, to sampled, to trusted, based on its record. The threat model gains an agents section: prompt injection, one agent asking another to do what it may not, patches made only to pass a check, and sandbox limits on files and network.

**More generated pieces, each only if it earns its place.** Evaluation templates when your product contains AI features; an on-call guide and a lessons file in the runbook; plan blocks turned into labelled issues any coding agent can pick up; approval lists for agents you build with other agent toolkits; a review in `/keel upgrade` of rules that only existed to work around an older model.

**Keel measured on every release.** A regression in the measurement blocks the release.

**Further out, only if asked for:** shared policy packs for common domains (data residency, payments, health data); a hosted service across several repositories; running the interview from any tool that supports the Model Context Protocol (MCP); decisions from past projects suggested in the next interview; a scheduled review pass that turns review feedback into small updates to generated skills.

**Parked: hosted answer link.** A web link where team members answer their round without handling a file. Parked until the question of where answers may be stored is settled; team answers use files in git meanwhile.

## Team answers

**Rounds and packets.** The interview already runs in rounds (Business Analyst, Product Manager, Architect and the others). In team mode, Keel writes one packet per round: a Markdown file in the project, under `.keel/rounds/`, holding the project summary, that round's questions tailored to this project, and the recommended defaults. Packets are ordinary files in git, so history, review and sharing work the way they already do for your documents.

**The owner.** Every project, and every round, has an owner, chosen during the interview. It can be the person starting the project or anyone else. The owner decides which rounds go to whom.

**Who answers.** A person answers a packet by running `/keel answer` on it, which interviews them for that round only, or by typing into the file. Claude may answer a round when needed. Every answer is marked as given by a person or by Claude, and a person can always overrule a Claude answer. The overrule is recorded; the original answer is kept.

**Seeing other answers.** By default, a respondent can see the answers others have already given to a question. The owner can switch a question to blind: then each respondent answers without seeing the others, and all answers to that question are shown together once everyone named has answered or the owner closes it. Blind mode is a working agreement inside the tool. Anyone who can read the repository can read the files, so for real secrecy, hand blind packets out as files and merge them back.

**Gaps and disagreements.** `/keel merge` reads the returned packets and lists unanswered questions and answers that contradict each other, quoting both sides. Disagreements are settled by the owner, or by a person the owner names during the interview. A Claude answer never settles a disagreement. Each decision is recorded with who decided and why.

A question in a packet, open mode:

```markdown
### ARC-04 Where will user data be stored?
mode: open
- answer: EU region only, one database.
  by: Lead engineer (human)
- answer: Managed Postgres in one EU region (recommended default).
  by: Claude, for Product owner
  overruled-by: Product owner (human): same region, but two databases.
decided: Product owner. Reason: billing data kept apart.
```

The same question in blind mode shows `mode: blind` and no other answers until it is revealed.

**Privacy.** A packet carries only its own round. Packets never hold keys or passwords, and the packet checker flags anything that looks like one. For a public repository, Keel offers to keep `.keel/rounds/` out of git.

## How existing projects adopt this

Run `/keel upgrade` after updating Keel. It works the way it always has (see [Upgrading Existing Projects](./15-upgrade.md)): it reports what is new, proposes changes, and applies only what you approve. Nothing is forced, and running it twice changes nothing the second time.

| Change | What upgrade does |
|---|---|
| Bug fixes and Keel's own scripts (size checker, workflow scripts, update check) | Replaced, as on every upgrade, and listed in the report |
| Shorter working documents (AGENTS.md first) | Offered. The report shows each section and where it would move (a rule, a skill, a hook, or a record document). Text moves word for word; nothing is deleted. Record documents are not touched |
| Area rules in `.claude/rules/` | Offered, generated from your existing decision records |
| Header on decision records | New records only. Existing record files are never rewritten; their paths go in the area rules files instead |
| Verify wording and the new evidence level | Offered as a change to the Verify step |
| Team answers | Nothing to migrate. Offered when you next run an interview round, for example in a new phase |
| Permissions, guard hook, audit trail | Offered one entry at a time, shown as a change to your settings. Never switched on silently |
| Risk tiers, code owners, branch protection | Offered. Branch protection is a repository setting: Keel writes it out, and you apply it |
| Done contract, CI starter, verification skills | Offered for unfinished phases. Finished phases are left as they are |
| Background jobs | Offered, off by default |

Each approved step is its own commit, so any step can be reverted. An offer you decline is remembered and not repeated until a later version changes it. The document format stays at version 2 for everything listed under Now; if a later step ever needs a new format, it comes with its own migration path, as the move from 1.x to 2.0 did.

## What Keel will not build

1. A Keel server or approval database before a hosted stage exists. The pull request is the checkpoint.
2. An interview that runs with no person present.
3. Merging or code edits by Keel's own jobs. Merging without a person belongs to your policy, never to Keel.
4. A watcher that edits decisions. It flags them only.
5. A separate agent per interview persona, or an evaluator on every phase. One agent is the default; the evaluator is a per-phase choice.
6. Tags on every document. Metadata is added only where a tool reads it.
7. New document types before the measurement shows documents help. Smaller working documents are the default; the set itself stays complete.
8. Ritual instructions in generated files, such as "think carefully" or "check everything twice".
9. A rival to existing feature-spec tools. Keel works alongside them.
10. A marketplace for policy packs before two packs exist and someone asks for a third.
11. Keel's own logic resting on preview features of any vendor. Runners are thin adapters.
12. A tier that merges without a person before real required checks exist.
13. A shared summary table as agent memory. One page per subject, with one writer.
14. A smaller documentation set, or shorter record documents. No document type is removed, and no record document is cut, without the written approval of Keel's maintainer.

## Shape this roadmap

Open an issue on [GitHub](https://github.com/achatt89/keel/issues) to argue for, against or about any step. The order changes when the measurements say it should.
