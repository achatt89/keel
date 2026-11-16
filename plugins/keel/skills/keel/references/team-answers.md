# Team answers (opt-in)

Load this file only when the user turns team mode on in Phase 0, or runs `/keel answer` or
`/keel merge`. Without team mode, Keel runs the single-person interview exactly as SKILL.md says.

**What changes:** the Phase 1 rounds are handed out as packet files under `.keel/rounds/`, answered by
the people who know them best, and merged back before Phase 2. **What stays:** personas, question
banks, tiers, Phase 2 and Phase 3, every template. The full document set is still generated.

## 1. Phase 0 in team mode

After the tier is confirmed (SKILL.md Phase 0 step 3), ask with `AskUserQuestion`:
*"Answer the interview yourself (default), or hand rounds to your team?"* Solo → stop reading this
file. Team → continue:

1. **Owner.** Ask who owns the project. It can be the person running Keel or anyone else.
2. **Rounds.** Decide which rounds the project needs (SKILL.md Phase 1 rules: BA + PM + Architect
   always; the others by trigger). For each round, ask who answers it. A round may have several
   respondents; a person may hold several rounds. Claude may be assigned a round only if the owner
   says so, and then every answer is marked `Claude, for <owner>`.
3. **Decider.** Ask who settles disagreements: the owner (default) or a person the owner names.
   Never Claude.
4. **Blind questions.** Open is the default. Ask the owner whether any question should be blind
   (each respondent answers without seeing the others). Suggest blind for estimates, priorities and
   risk ratings, where an early answer anchors the rest. Set per question.
5. **Write the packets.** One file per round, `.keel/rounds/<round>.md`, from
   `references/templates/ROUND_PACKET.md`: the Phase 0 summary, that round's questions tailored to
   this project (not the raw bank), each with an ID (`BA-`, `PM-`, `ARC-`, `SEC-`, `DES-`, `OPS-`
   plus two digits), a `mode:` and a `default:`. Mark cross-round dependencies with `after:`.
   A packet carries only its own round.
6. **Install the checker.** Copy `references/templates/keel-packet-check.mjs` to
   `.keel/packet-check.mjs` and run it once; it must pass on the fresh packets.
7. **Record** in `.keel/meta.json`:
   ```json
   "rounds": {
     "owner": "Ana", "decider": "Ana",
     "assigned": { "architect": ["Ben"], "product-manager": ["Ana", "Ben"] },
     "blind": ["PM-03"], "status": "out", "gitignored": false
   }
   ```
   `status`: `out` → `merged`. Solo projects have no `rounds` key (or `null`).
8. **Public repositories.** If the repo is public or may become public (ask if unknown), offer to
   add `.keel/rounds/` to `.gitignore`. Answers can hold security gaps, costs and customer names.
   Record the choice in `rounds.gitignored`.
9. **Tell the owner how to hand out packets:** commit them (default: they are ordinary files in
   git), or send the file by any channel the team trusts. For real secrecy on blind questions, send
   files rather than sharing the repo: anyone with repo access can read every file.

Phase 1 then waits: the owner runs `/keel merge` when packets are back. The owner may still answer
their own rounds in this session with the normal interview; those answers go into the packet marked
`(human)`.

## 2. `/keel answer <packet>`

One round only. The respondent runs it on their own machine.

1. Read the packet. Run `node .keel/packet-check.mjs <dir>` first; stop on errors and show them.
2. Ask who is answering (name as listed in `respondents`). If they are not listed, say so and ask
   the owner to add them; do not answer for them.
3. Adopt the round's persona (`references/interview-personas.md`) and interview them on this
   packet's questions only, in its order, honouring `after:`. Same rules as Phase 1: batch 2–5,
   recommend inline, reflect contradictions within the round.
4. **Marks.** Write each answer as `- answer:` + `  by: <name> (human)`. If the respondent asks
   Claude to answer one ("you decide", "use the default"), write `  by: Claude, for <name>`. Never
   mark a Claude answer as human.
5. **Overrules.** A person may overrule a Claude answer: add `  overruled-by: <name> (human): <answer>`
   under it. The original line stays. Only Claude answers are overruled this way; a person who
   changes their own answer edits it.
6. **Open questions:** show the answers already there before asking. **Blind questions** (no
   `revealed:` line): do not show or read out other answers; write this person's answer to
   `.keel/rounds/sealed/<round>.<name-slug>.md` (frontmatter `keel-packet: 1`, `round`,
   `respondent`; only the blind questions), never into the shared packet.
7. Never write keys, passwords or tokens; write where the secret lives. Run the checker again before
   finishing; fix what it reports.
8. Tell the respondent how to return it (commit, or send the files back to the owner).

## 3. `/keel merge`

Run by the owner (or decider) when packets are back.

1. Run `node .keel/packet-check.mjs --json`. Errors block the merge: list them and stop.
2. **Reveal blind questions.** For each blind question, when every respondent has a sealed answer,
   copy the answers into the shared packet and add `revealed: all answered`. If some are missing,
   list who; the owner may close it (`revealed: closed by <owner>`) or wait. Re-run the checker.
3. **Gaps.** List every unanswered question with its default. The owner answers it (marked human),
   accepts the default (write `- answer: <default>` + `  by: Claude, for <owner>` and note
   "defaulted" in the transcript), or sends it back to the respondent.
4. **Contradictions.** Compare answers within each question and across rounds (for example PM "EU
   users only" vs Architect "US hosting"). The checker's `review` lines are candidates; judging what
   contradicts is yours. Quote both sides with names and IDs. A Claude answer that a person
   overruled counts as the person's answer.
5. **The decider settles each one** (`AskUserQuestion`, quoting both sides). Write
   `decided: <decider>. Reason: <why>` under the question. A Claude answer never settles a
   disagreement: if the only voices are Claude's, it is still the decider's call. Only the decider
   (or the owner) may decide.
6. Run the checker; it must pass. Set `rounds.status` to `merged`.
7. Continue with Phase 1's synthesis (summarise per round, thumbs-up from the owner), then Phase 2.

## 4. Phase 3 additions in team mode

`docs/keel-transcript.md` gets, per round: who answered, each answer with its mark (human / Claude,
for X / overruled by Y), blind questions and how they were revealed, and each decision with who
decided and why. Packets stay in `.keel/rounds/` as the raw record (or out of git, per
`rounds.gitignored`).

## 5. Rules (the checker enforces the ones marked ✓)

- ✓ Every answer is marked human or `Claude, for <name>`; Claude answers only for a named person.
- ✓ Only Claude answers are overruled, and the original is kept.
- ✓ `decided:` names the decider or owner, never Claude, and gives a reason.
- ✓ A blind question shows no answers in the shared packet until revealed; `all answered` needs an
  answer from every respondent; only the owner closes early.
- ✓ Nothing that looks like a key, password or token.
- A packet carries only its own round. Single-person flow stays the default.

Self-test: `node .keel/packet-check.mjs --self-test` (open and blind modes, every ✓ rule).
