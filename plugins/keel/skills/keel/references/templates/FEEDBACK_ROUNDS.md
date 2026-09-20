<!--
  Keel template — FEEDBACK_ROUNDS.md (external feedback as a first-class input)
  WHAT: The log of every batch of feedback that arrived from outside the build loop — a
        client review, a founder walkthrough, a user test, a demo — and where each item
        went. Rounds SPAWN work (a Phase or a Change); they never contain fixes.
  INCLUDE WHEN: the product has a client, a founder who reviews builds, or users who are
        watched. Skip for a solo internal tool with no reviewer.
  DEPENDS ON: IMPLEMENTATION_PLAN.md (Phases, CHG-xxx, deferred table) — every item lands
        in one of those three places.
  OWNS: FR-xx (round IDs) and FR-xx.n (item IDs within a round).
  KEY RULE: no inline fixes without a row. If feedback changed the code, a row here says
        which item, and the Change/Phase it produced references FR-xx.n. Otherwise the
        reason a thing looks the way it does is lost within a month.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — Feedback Rounds

> External feedback in, work units out. Items are triaged into a Phase, a Change, a
> deferred row, or an explicit "won't do" — never fixed silently.

---

## Rounds

<!-- Keel guidance: one row per round, newest first. "Items → work" is counts + refs, not
     the items themselves (those are in the round's block below). -->

| Round | Date | Source | Format | Items | → Phase / CHG | Status |
|---|---|---|---|---|---|---|
| FR-{{02}} | {{YYYY-MM-DD}} | {{client — name/role}} | {{annotated screenshots / call notes / email}} | {{9}} | Phase {{N}} ({{6}}) · CHG-{{xxx}} ({{2}}) · deferred ({{1}}) | 🔄 |
| FR-{{01}} | {{YYYY-MM-DD}} | {{founder walkthrough}} | {{live session}} | {{4}} | CHG-{{xxx}}, CHG-{{xxx}} | ✅ |

---

<!-- ============================================================ -->
<!-- Copy this block per round. Keep it short — items are one line each. -->
<!-- ============================================================ -->

## FR-{{02}} — {{Client review of the {{feature}} build}} ({{YYYY-MM-DD}})

**Source:** {{who, in what capacity}} · **Raw input:** {{link / path to the notes, screenshots, recording}}
**Context:** {{what they were shown — build `{{abc1234}}` on {{staging URL}}; what they were asked to look at}}

| Item | Feedback (their words, condensed) | Kind | Disposition | Ref | Decider |
|---|---|---|---|---|---|
| FR-{{02}}.1 | {{"the hero copy reads like a pharmacy" }} | copy | scheduled | Phase {{N}} | founder |
| FR-{{02}}.2 | {{"can't find the loyalty points on mobile"}} | UX | fix now | CHG-{{xxx}} | engineering |
| FR-{{02}}.3 | {{"add Apple Pay"}} | feature | deferred — {{needs ADR-001 exception}} | deferred row · `[NEEDS DECISION]` | founder |
| FR-{{02}}.4 | {{"the badge colour is wrong"}} | design | won't do — {{brand guide §2 says otherwise; explained {{date}}}} | — | founder |

**Follow-up owed:** {{what was promised back to the source and by when — e.g. "re-review on staging after Phase N, target {{date}}"}}.

<!-- ============================================================ -->

## FR-{{01}} — {{Founder walkthrough of the first deployed build}} ({{YYYY-MM-DD}})

**Source:** {{founder}} · **Raw input:** {{…}}

| Item | Feedback | Kind | Disposition | Ref | Decider |
|---|---|---|---|---|---|
| FR-{{01}}.1 | {{…}} | {{…}} | {{…}} | {{…}} | {{…}} |

---

*End of FEEDBACK_ROUNDS.md — {{PROJECT_NAME}}*
