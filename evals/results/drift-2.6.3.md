# 2.6.3 docs under test: signal run (16 Nov 2026)

**Signal only, n=1.** One rep × 3 sessions, on a fixture regenerated with 2.6.3. This run does not test the 9-session pass rule and makes no claim about it.

**Result.**
- Drift failed in 3 of 3 sessions. The README caused none of the failures.
- In every session the README's examples and error table were under test: `examples/` held 5 example files with expected output, and `test/examples.test.js` passed 15 of 15 in the final state.
- The new failures come from the **BRD**, which generation wrote, and once from the AGENTS.md status line.
- All code tests passed (5/5, 11/11, 15/15). `.keel/check.mjs` was clean after every session.

| session | tests | drift | what the drift judge found | agent $ | judge $ |
|---|---|---|---|---|---|
| r1-s1 | 5/5 | fail | BRD assumption A-06: "the stored name is the trimmed value"; the code stores it untrimmed | 1.664 | 0.341 |
| r1-s2 | 11/11 | fail | the same A-06; AGENTS.md says Phase 2 is still on its branch while the plan and CHANGELOG say merged | 1.409 | 0.419 |
| r1-s3 | 15/15 | fail | the same A-06; BRD RSK-001 says `ship` and `fulfil` share a stock-decrease helper, but the code decrements inline in each | 1.312 | 0.480 |

**Spend:** USD 6.509, made up of generation 0.883 (`claude-sonnet-5-5`), agent 4.385 (`claude-sonnet-5-5`) and judge 1.240 (`claude-opus-5-5`). That is **over the 6.5 cap by USD 0.009**. The runner gives each session a budget, but the last session ran USD 0.022 past its own and its judge call runs afterwards. Tokens are in `token-usage.md`. Eval v1 total so far is about USD 56.2 of 60.

**Not like for like.**
- This fixture is a 2.6.3 generation: every document type is present, many as stubs, and it has 5 ADRs and its own BRD. The v1 and 2.6.2 runs used the 2.5.6 fixture.
- The trimmed-name assumption exists only in this generation's BRD. It is in neither the founder's answers nor the idea, and the hidden tests do not check it.
- So these failures say nothing about 2.6.3's README rule. They point to a different gap.

## What this shows

1. **The README rule did what it was for (n=1).** No README contradiction in 3 sessions, against 2 of 6 sessions on 2.6.2. The README content was under test throughout.
2. **A new source: record docs that state implementation detail.**
   - Generation wrote a BRD assumption (trimming) and a risk mitigation (a shared helper) that go beyond the founder's answers.
   - Doc sync's "design docs vs code" step compares ARCHITECTURE, LLD and README, not the BRD's assumptions or risk mitigations, so these stayed contradicted in all 3 sessions.
3. **The status line lagged once:** AGENTS.md said "on branch" after the merge (s2).

## Candidates (not built, no spend)

- **Generation:** a BRD assumption or a risk mitigation that names code behaviour must cite its source (a founder answer, or an ADR). Otherwise it is a design choice and belongs in an ADR or the LLD, not the BRD.
- **Doc sync:** add BRD assumptions and risk mitigations (and PRD acceptance notes) that name code behaviour to the step 7 comparison. A contradiction becomes an ADR Build deviation or an assumption status update. The record stays full: nothing is shortened.
- **Merge step:** flip the AGENTS.md status line in the same commit that marks the plan merged.
