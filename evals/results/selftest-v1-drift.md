# Drift judge self-test, inventory (16 Nov 2026)

`node evals/grade.mjs --drift-selftest inventory`. Judge `claude-opus-5-5`. Both lines must be OK. Judge spend USD 0.520.

```
OK   inventory/drift keel docs + no code: verdict pass (want pass; failed: -) $0.252 [claude-opus-5-5 in 2 out 298 cacheR 649 cacheW 30748]
OK   inventory/drift keel docs + final reference code: verdict fail (want fail; failed: plan-status, no-contradiction, changelog, readme) $0.268 [claude-opus-5-5 in 2 out 418 cacheR 649 cacheW 32466]
```

Judge reasons on the second line, verbatim in substance:
- plan-status: the code implements all phase 1 to 3 functions, yet IMPLEMENTATION_PLAN shows every phase not started.
- no-contradiction: the code departs from Keel's LLD in places the prompt never fixed: addItem returns undefined and trims the name (LLD: returns a copy, no trim); receive/ship look up the SKU before validating qty (LLD/ADR-002: qty first); no MAX_SAFE_INTEGER check; a non-object reserve line does not throw invalid_input.
- changelog: CHANGELOG records only the foundation docs.
- readme: no README.md among the documents.
