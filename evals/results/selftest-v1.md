# Judge self-test, v1 tasks (16 Nov 2026)

`node evals/grade.mjs --selftest invoices quotas inventory`. Judge `claude-opus-5-5`. Every line must be OK. Judge spend USD 0.332.
The drift judge self-test (`--drift-selftest inventory`) needs the Keel fixture and is in `selftest-v1-drift.md`.

```
OK   invoices/reference: tests 13/13 (decision 11/11), judge pass (failed: errors) 0.093 [claude-opus-5-5 in 2 out 989 cacheR 649 cacheW 9155]
OK   invoices/broken: tests 3/13 (decision 1/11), judge fail (failed: own-tests,csv-quoting,readme,errors) 0.077 [claude-opus-5-5 in 2 out 697 cacheR 649 cacheW 7876]
OK   quotas/reference: tests 11/11 (decision 9/9), judge pass (failed: errors) 0.092 [claude-opus-5-5 in 2 out 1594 cacheR 649 cacheW 7477]
OK   quotas/broken: tests 3/11 (decision 1/9), judge fail (failed: own-tests,readme) 0.070 [claude-opus-5-5 in 2 out 894 cacheR 649 cacheW 6443]
OK   inventory/reference: tests 15/15 (phase 1 5/5, phase 2 6/6, phase 3 4/4), no rubric judge
OK   inventory/broken: tests 12/15 (phase 1 5/5, phase 2 4/6, phase 3 3/4), no rubric judge
```
