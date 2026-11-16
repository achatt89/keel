# Grader self-test (v0)

Run 2026-11-16, `node evals/grade.mjs --selftest`, Claude Code 2.1.325, judge model `claude-opus-5-5` (alias `opus`), no tools. Reference must pass both graders, broken must fail both. Result: all six OK; judge cost $0.415 total.

```
OK   booking/reference: tests 7/7, judge pass (failed: errors) $0.079 [claude-opus-5-5 in 2 out 1661 cacheR 649 cacheW 5727]
OK   booking/broken: tests 3/7, judge fail (failed: strict-time,half-open,own-tests,readme,errors,clarity) $0.057 [claude-opus-5-5 in 2 out 885 cacheR 649 cacheW 4918]
OK   ledger/reference: tests 17/17, judge pass (failed: -) $0.075 [claude-opus-5-5 in 2 out 1417 cacheR 649 cacheW 5854]
OK   ledger/broken: tests 7/17, judge fail (failed: money-cents,errors,own-tests,readme,remainder-rule,clarity) $0.055 [claude-opus-5-5 in 2 out 664 cacheR 649 cacheW 5231]
OK   shortlinks/reference: tests 6/6, judge pass (failed: errors) $0.094 [claude-opus-5-5 in 2 out 2465 cacheR 649 cacheW 5564]
OK   shortlinks/broken: tests 3/6, judge fail (failed: url-validation,rate-limit,own-tests,readme,errors,clarity) $0.055 [claude-opus-5-5 in 2 out 757 cacheR 649 cacheW 5021]
```

Tokens: in = uncached input, out = output, cacheR/cacheW = prompt-cache read/write, as Claude Code's `modelUsage` reports them. Note: the judge failed the non-MUST `errors` item on two reference solutions; MUST items decide the verdict, so the verdicts stand.
