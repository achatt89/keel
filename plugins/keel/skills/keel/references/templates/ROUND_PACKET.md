---
keel-packet: 1
project: {{PROJECT_NAME}}
round: {{ROUND_SLUG — business-analyst · product-manager · architect · security-compliance · designer · delivery-ops}}
round-title: {{ROUND_TITLE}}
owner: {{OWNER_NAME}}
decider: {{DECIDER_NAME — the owner, or the person the owner named}}
respondents: {{NAME_1}}, {{NAME_2}}
keel: {{KEEL_VERSION}}
written: {{YYYY-MM-DD}}
---

<!-- One packet per round, written by Keel in team mode (references/team-answers.md). Checked by
`node .keel/packet-check.mjs`. Never put keys, passwords or tokens here: name the secrets store instead. -->

# {{ROUND_TITLE}} round: {{PROJECT_NAME}}

## Project summary

{{3–6 sentences from Phase 0: the problem, who has it, the shape of the solution, the ambition tier.}}

## How to answer

- Run `/keel answer .keel/rounds/{{ROUND_SLUG}}.md` for a short guided interview of this round only,
  or type your answer under a question, as an `- answer:` line with a `by:` line under it.
- Mark every answer: `by: <your name> (human)`. If Claude answers for you, it writes
  `by: Claude, for <your name>`. To overrule a Claude answer, add under it
  `overruled-by: <your name> (human): <your answer>`. Never delete the original.
- A `mode: blind` question shows no answers until everyone named has answered or the owner closes it.
  Answer it with `/keel answer`, which keeps your answer in `.keel/rounds/sealed/`, or send the file
  back to the owner without reading other copies.
- `default:` is Keel's recommendation. Leaving a question empty is fine: it is listed as a gap, and
  the owner settles it. A default is recorded as "defaulted", never as your answer.
- `after:` means the question depends on another round's answer; answer it after that one is in.

## Questions

### {{ID — e.g. ARC-01}} {{Question, tailored to this project}}
mode: open
default: {{Recommended default, with the one-line reason}}

### {{ID}} {{Question}}
mode: blind
default: {{Recommended default}}
after: {{ID of the question in another round, or remove this line}}
