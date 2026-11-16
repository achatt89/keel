# Token usage and spend (internal)

Internal ledger for Keel evaluation v0. Every number comes from Claude Code's `modelUsage` (keyed by exact model id) in the saved run records. Raw transcripts are kept outside the repo in `~/HarnessAgents/eval-raw/keel-eval-v0/` (pilot/, baseline/).

- Tested model: `claude-sonnet-5-5` (alias `sonnet`; the same id in every run's init event and modelUsage).
- Judge: `claude-opus-5-5` (alias `opus`), no tools.
- Claude Code 2.1.325. Keel 2.5.6 fixtures.
- Columns: input = uncached input, output = output, cache read / cache write = prompt cache. Cost is USD at list price, as Claude Code reports it.

## Spend ledger

| item | runs | agent $ | judge $ | total $ | source |
|---|---|---|---|---|---|
| Judge self-test | 6 judge calls | - | 0.415 | 0.415 | `selftest-v0.md` |
| Fixture generation, ledger / shortlinks / booking | 3 | not recorded (log lost with worktree) | - | not recorded | T2b raw folder was git-ignored and torn down |
| First pilot (T2b) | 3 | not recorded (log lost with worktree) | not recorded | not recorded | same |
| Pilot (this run) | 3 | 0.804 | 0.294 | 1.098 | `pilot/summary.json` |
| Baseline | 27 | 4.721 | 2.761 | 7.482 | `baseline/summary.json` |
| Re-judge of shortlinks-min-r1 (checking a judge failure) | 1 judge call | - | 0.103 | 0.103 | `claude-opus-5-5` |
| **Recorded total** | | **5.525** | **3.573** | **9.098** | of the USD 60 approved |
| 2.6.0 regression: fixture generation (ledger / shortlinks / booking, 2.6.0 at b01038d) | 3 | 2.425 | - | 2.425 | `tasks/*/keel-gen-usage.json` |
| 2.6.0 regression: runs | 27 | 4.228 | 2.830 | 7.058 | `regression-260/summary.json` |
| 2.6.0 regression: first try of ledger-keel-r3 (killed when the temp was stopped; transcript not saved) | 1 | not recorded | - | not recorded | re-run is in the 27 |
| 2.6.0 regression: D1 live checks (/keel version, check, change) | 3 | 0.606 | - | 0.606 | `regression-2.6.0.md` |
| **2.6.0 regression recorded total** | | **7.259** | **2.830** | **10.089** | of the USD 25 approved |
| 2.6.1 check: ledger generation with stubs (feat/keel-2.6.1-stubs 1ebce61) | 1 | 0.778 | - | 0.778 | below |
| **Eval v1 total** (judge self-tests, MVP fixtures, pilot, full run incl. `spec`) | 69 (full run) + pilot | see "v1" | see "v1" | **33.764** | of its own USD 60 approved; section "v1" below |

The temp sessions' own tokens (the agents that ran the harness) are not in these records; the orchestrator meters those.

## Pilot (ledger x none, min, keel x 1)

### Pilot: Per run

| run | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ledger-none-r1 | agent | `claude-sonnet-5-5` |  | 18 | 7,523 | 209,130 | 17,399 | 0.166 |
| ledger-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,575 | 649 | 7,869 | 0.095 |
| ledger-min-r1 | agent | `claude-sonnet-5-5` |  | 8 | 5,379 | 77,651 | 12,793 | 0.113 |
| ledger-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,132 | 649 | 7,792 | 0.085 |
| ledger-keel-r1 | agent | `claude-sonnet-5-5` |  | 36 | 21,993 | 572,288 | 81,050 | 0.525 |
| ledger-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 1,059 | 649 | 11,574 | 0.114 |

### Pilot: Totals

| group | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ALL | agent | `claude-sonnet-5-5` | 3 | 62 | 34,895 | 859,069 | 111,242 | 0.804 |
| ALL | judge | `claude-opus-5-5` | 3 | 6 | 3,766 | 1,947 | 27,235 | 0.294 |
| cond keel | agent | `claude-sonnet-5-5` | 1 | 36 | 21,993 | 572,288 | 81,050 | 0.525 |
| cond keel | judge | `claude-opus-5-5` | 1 | 2 | 1,059 | 649 | 11,574 | 0.114 |
| cond min | agent | `claude-sonnet-5-5` | 1 | 8 | 5,379 | 77,651 | 12,793 | 0.113 |
| cond min | judge | `claude-opus-5-5` | 1 | 2 | 1,132 | 649 | 7,792 | 0.085 |
| cond none | agent | `claude-sonnet-5-5` | 1 | 18 | 7,523 | 209,130 | 17,399 | 0.166 |
| cond none | judge | `claude-opus-5-5` | 1 | 2 | 1,575 | 649 | 7,869 | 0.095 |
| ledger / keel | agent | `claude-sonnet-5-5` | 1 | 36 | 21,993 | 572,288 | 81,050 | 0.525 |
| ledger / keel | judge | `claude-opus-5-5` | 1 | 2 | 1,059 | 649 | 11,574 | 0.114 |
| ledger / min | agent | `claude-sonnet-5-5` | 1 | 8 | 5,379 | 77,651 | 12,793 | 0.113 |
| ledger / min | judge | `claude-opus-5-5` | 1 | 2 | 1,132 | 649 | 7,792 | 0.085 |
| ledger / none | agent | `claude-sonnet-5-5` | 1 | 18 | 7,523 | 209,130 | 17,399 | 0.166 |
| ledger / none | judge | `claude-opus-5-5` | 1 | 2 | 1,575 | 649 | 7,869 | 0.095 |
| task ledger | agent | `claude-sonnet-5-5` | 3 | 62 | 34,895 | 859,069 | 111,242 | 0.804 |
| task ledger | judge | `claude-opus-5-5` | 3 | 6 | 3,766 | 1,947 | 27,235 | 0.294 |

## Baseline (3 tasks x 3 conditions x 3 reps)

### Baseline: Per run

| run | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ledger-none-r1 | agent | `claude-sonnet-5-5` |  | 12 | 7,249 | 131,616 | 15,505 | 0.148 |
| ledger-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,362 | 649 | 8,624 | 0.096 |
| ledger-min-r1 | agent | `claude-sonnet-5-5` |  | 6 | 5,850 | 54,179 | 13,178 | 0.117 |
| ledger-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,131 | 649 | 8,366 | 0.090 |
| ledger-keel-r1 | agent | `claude-sonnet-5-5` |  | 42 | 22,305 | 689,356 | 74,135 | 0.535 |
| ledger-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 1,097 | 649 | 13,028 | 0.126 |
| shortlinks-none-r1 | agent | `claude-sonnet-5-5` |  | 4 | 5,786 | 29,474 | 12,223 | 0.110 |
| shortlinks-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,774 | 649 | 7,914 | 0.099 |
| shortlinks-min-r1 | agent | `claude-sonnet-5-5` |  | 4 | 6,249 | 29,955 | 13,448 | 0.119 |
| shortlinks-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,570 | 649 | 8,374 | 0.099 |
| shortlinks-keel-r1 | agent | `claude-sonnet-5-5` |  | 8 | 7,043 | 92,486 | 21,781 | 0.167 |
| shortlinks-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 2,000 | 649 | 9,401 | 0.115 |
| booking-none-r1 | agent | `claude-sonnet-5-5` |  | 4 | 5,573 | 29,501 | 12,389 | 0.108 |
| booking-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,607 | 649 | 8,247 | 0.098 |
| booking-min-r1 | agent | `claude-sonnet-5-5` |  | 4 | 4,325 | 29,979 | 11,515 | 0.092 |
| booking-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,555 | 649 | 7,519 | 0.091 |
| booking-keel-r1 | agent | `claude-sonnet-5-5` |  | 6 | 6,841 | 57,630 | 18,992 | 0.150 |
| booking-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 1,655 | 649 | 9,347 | 0.108 |
| ledger-none-r2 | agent | `claude-sonnet-5-5` |  | 10 | 6,334 | 101,975 | 13,578 | 0.128 |
| ledger-none-r2 | judge | `claude-opus-5-5` |  | 2 | 1,247 | 649 | 8,134 | 0.090 |
| ledger-min-r2 | agent | `claude-sonnet-5-5` |  | 4 | 5,123 | 29,948 | 12,217 | 0.103 |
| ledger-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,609 | 649 | 7,774 | 0.095 |
| ledger-keel-r2 | agent | `claude-sonnet-5-5` |  | 34 | 21,852 | 564,653 | 85,549 | 0.543 |
| ledger-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,287 | 649 | 11,822 | 0.120 |
| shortlinks-none-r2 | agent | `claude-sonnet-5-5` |  | 4 | 6,575 | 29,476 | 13,122 | 0.121 |
| shortlinks-none-r2 | judge | `claude-opus-5-5` |  | 2 | 1,372 | 649 | 8,162 | 0.093 |
| shortlinks-min-r2 | agent | `claude-sonnet-5-5` |  | 4 | 6,786 | 29,963 | 13,802 | 0.126 |
| shortlinks-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,840 | 649 | 8,576 | 0.106 |
| shortlinks-keel-r2 | agent | `claude-sonnet-5-5` |  | 6 | 6,908 | 59,897 | 21,573 | 0.161 |
| shortlinks-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,414 | 649 | 9,315 | 0.103 |
| booking-none-r2 | agent | `claude-sonnet-5-5` |  | 12 | 6,131 | 125,898 | 13,461 | 0.128 |
| booking-none-r2 | judge | `claude-opus-5-5` |  | 2 | 1,625 | 649 | 8,121 | 0.098 |
| booking-min-r2 | agent | `claude-sonnet-5-5` |  | 12 | 5,387 | 125,224 | 12,939 | 0.118 |
| booking-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,292 | 649 | 7,709 | 0.088 |
| booking-keel-r2 | agent | `claude-sonnet-5-5` |  | 14 | 10,250 | 201,810 | 25,531 | 0.225 |
| booking-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,287 | 649 | 11,692 | 0.119 |
| ledger-none-r3 | agent | `claude-sonnet-5-5` |  | 6 | 5,860 | 53,264 | 12,770 | 0.115 |
| ledger-none-r3 | judge | `claude-opus-5-5` |  | 2 | 1,317 | 649 | 8,180 | 0.092 |
| ledger-min-r3 | agent | `claude-sonnet-5-5` |  | 4 | 5,204 | 29,952 | 12,487 | 0.105 |
| ledger-min-r3 | judge | `claude-opus-5-5` |  | 2 | 1,746 | 649 | 7,865 | 0.098 |
| ledger-keel-r3 | agent | `claude-sonnet-5-5` |  | 18 | 11,066 | 277,676 | 27,930 | 0.250 |
| ledger-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,435 | 649 | 12,128 | 0.126 |
| shortlinks-none-r3 | agent | `claude-sonnet-5-5` |  | 4 | 5,747 | 29,474 | 12,246 | 0.109 |
| shortlinks-none-r3 | judge | `claude-opus-5-5` |  | 2 | 1,346 | 649 | 7,834 | 0.090 |
| shortlinks-min-r3 | agent | `claude-sonnet-5-5` |  | 4 | 6,538 | 29,959 | 13,639 | 0.123 |
| shortlinks-min-r3 | judge | `claude-opus-5-5` |  | 2 | 1,983 | 649 | 8,261 | 0.106 |
| shortlinks-keel-r3 | agent | `claude-sonnet-5-5` |  | 6 | 6,472 | 59,793 | 21,006 | 0.155 |
| shortlinks-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,477 | 649 | 9,050 | 0.102 |
| booking-none-r3 | agent | `claude-sonnet-5-5` |  | 10 | 6,751 | 102,639 | 13,989 | 0.134 |
| booking-none-r3 | judge | `claude-opus-5-5` |  | 2 | 1,605 | 649 | 8,626 | 0.101 |
| booking-min-r3 | agent | `claude-sonnet-5-5` |  | 10 | 6,082 | 106,086 | 14,972 | 0.131 |
| booking-min-r3 | judge | `claude-opus-5-5` |  | 2 | 1,553 | 649 | 8,064 | 0.096 |
| booking-keel-r3 | agent | `claude-sonnet-5-5` |  | 26 | 17,408 | 310,887 | 61,049 | 0.399 |
| booking-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,389 | 649 | 11,052 | 0.116 |

### Baseline: Totals

| group | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ALL | agent | `claude-sonnet-5-5` | 27 | 278 | 217,695 | 3,412,750 | 595,026 | 4.721 |
| ALL | judge | `claude-opus-5-5` | 27 | 54 | 40,575 | 17,523 | 243,185 | 2.761 |
| booking / keel | agent | `claude-sonnet-5-5` | 3 | 46 | 34,499 | 570,327 | 105,572 | 0.774 |
| booking / keel | judge | `claude-opus-5-5` | 3 | 6 | 4,331 | 1,947 | 32,091 | 0.344 |
| booking / min | agent | `claude-sonnet-5-5` | 3 | 26 | 15,794 | 261,289 | 39,426 | 0.342 |
| booking / min | judge | `claude-opus-5-5` | 3 | 6 | 4,400 | 1,947 | 23,292 | 0.275 |
| booking / none | agent | `claude-sonnet-5-5` | 3 | 26 | 18,455 | 258,038 | 39,839 | 0.370 |
| booking / none | judge | `claude-opus-5-5` | 3 | 6 | 4,837 | 1,947 | 24,994 | 0.297 |
| cond keel | agent | `claude-sonnet-5-5` | 9 | 160 | 110,145 | 2,314,188 | 357,546 | 2.585 |
| cond keel | judge | `claude-opus-5-5` | 9 | 18 | 13,041 | 5,841 | 96,835 | 1.037 |
| cond min | agent | `claude-sonnet-5-5` | 9 | 52 | 51,544 | 465,245 | 118,197 | 1.035 |
| cond min | judge | `claude-opus-5-5` | 9 | 18 | 14,279 | 5,841 | 72,508 | 0.867 |
| cond none | agent | `claude-sonnet-5-5` | 9 | 66 | 56,006 | 633,317 | 119,283 | 1.101 |
| cond none | judge | `claude-opus-5-5` | 9 | 18 | 13,255 | 5,841 | 73,842 | 0.857 |
| ledger / keel | agent | `claude-sonnet-5-5` | 3 | 94 | 55,223 | 1,531,685 | 187,614 | 1.328 |
| ledger / keel | judge | `claude-opus-5-5` | 3 | 6 | 3,819 | 1,947 | 36,978 | 0.373 |
| ledger / min | agent | `claude-sonnet-5-5` | 3 | 14 | 16,177 | 114,079 | 37,882 | 0.325 |
| ledger / min | judge | `claude-opus-5-5` | 3 | 6 | 4,486 | 1,947 | 24,005 | 0.282 |
| ledger / none | agent | `claude-sonnet-5-5` | 3 | 28 | 19,443 | 286,855 | 41,853 | 0.391 |
| ledger / none | judge | `claude-opus-5-5` | 3 | 6 | 3,926 | 1,947 | 24,938 | 0.278 |
| shortlinks / keel | agent | `claude-sonnet-5-5` | 3 | 20 | 20,423 | 212,176 | 64,360 | 0.483 |
| shortlinks / keel | judge | `claude-opus-5-5` | 3 | 6 | 4,891 | 1,947 | 27,766 | 0.320 |
| shortlinks / min | agent | `claude-sonnet-5-5` | 3 | 12 | 19,573 | 89,877 | 40,889 | 0.368 |
| shortlinks / min | judge | `claude-opus-5-5` | 3 | 6 | 5,393 | 1,947 | 25,211 | 0.310 |
| shortlinks / none | agent | `claude-sonnet-5-5` | 3 | 12 | 18,108 | 88,424 | 37,591 | 0.340 |
| shortlinks / none | judge | `claude-opus-5-5` | 3 | 6 | 4,492 | 1,947 | 23,910 | 0.282 |
| task booking | agent | `claude-sonnet-5-5` | 9 | 98 | 68,748 | 1,089,654 | 184,837 | 1.486 |
| task booking | judge | `claude-opus-5-5` | 9 | 18 | 13,568 | 5,841 | 80,377 | 0.916 |
| task ledger | agent | `claude-sonnet-5-5` | 9 | 136 | 90,843 | 1,932,619 | 267,349 | 2.044 |
| task ledger | judge | `claude-opus-5-5` | 9 | 18 | 12,231 | 5,841 | 85,921 | 0.933 |
| task shortlinks | agent | `claude-sonnet-5-5` | 9 | 44 | 58,104 | 390,477 | 142,840 | 1.192 |
| task shortlinks | judge | `claude-opus-5-5` | 9 | 18 | 14,776 | 5,841 | 76,887 | 0.912 |

## Regression 2.6.0 (3 tasks x 3 conditions x 3 reps; fixtures from 2.6.0)

### Regression 2.6.0: Per run

| run | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ledger-none-r1 | agent | `claude-sonnet-5-5` |  | 12 | 5,626 | 123,577 | 12,961 | 0.120 |
| ledger-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,315 | 649 | 7,691 | 0.088 |
| ledger-min-r1 | agent | `claude-sonnet-5-5` |  | 8 | 5,634 | 77,390 | 12,933 | 0.116 |
| ledger-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,288 | 649 | 7,793 | 0.088 |
| ledger-keel-r1 | agent | `claude-sonnet-5-5` |  | 22 | 18,607 | 404,137 | 39,942 | 0.386 |
| ledger-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 1,360 | 649 | 15,916 | 0.155 |
| shortlinks-none-r1 | agent | `claude-sonnet-5-5` |  | 4 | 5,725 | 29,474 | 12,359 | 0.110 |
| shortlinks-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,587 | 649 | 7,926 | 0.095 |
| shortlinks-min-r1 | agent | `claude-sonnet-5-5` |  | 4 | 6,012 | 29,963 | 12,969 | 0.115 |
| shortlinks-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,478 | 649 | 7,861 | 0.093 |
| shortlinks-keel-r1 | agent | `claude-sonnet-5-5` |  | 8 | 7,848 | 94,129 | 23,625 | 0.182 |
| shortlinks-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 1,423 | 649 | 9,912 | 0.108 |
| booking-none-r1 | agent | `claude-sonnet-5-5` |  | 4 | 5,044 | 29,499 | 11,797 | 0.101 |
| booking-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,735 | 649 | 7,846 | 0.098 |
| booking-min-r1 | agent | `claude-sonnet-5-5` |  | 4 | 4,409 | 29,971 | 11,516 | 0.093 |
| booking-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,815 | 649 | 7,505 | 0.096 |
| booking-keel-r1 | agent | `claude-sonnet-5-5` |  | 14 | 8,366 | 195,357 | 26,084 | 0.208 |
| booking-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 1,373 | 649 | 10,205 | 0.109 |
| ledger-none-r2 | agent | `claude-sonnet-5-5` |  | 4 | 5,259 | 29,485 | 11,951 | 0.103 |
| ledger-none-r2 | judge | `claude-opus-5-5` |  | 2 | 1,265 | 649 | 7,877 | 0.088 |
| ledger-min-r2 | agent | `claude-sonnet-5-5` |  | 10 | 5,533 | 96,957 | 13,154 | 0.118 |
| ledger-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,336 | 649 | 7,621 | 0.088 |
| ledger-keel-r2 | agent | `claude-sonnet-5-5` |  | 22 | 17,502 | 386,226 | 37,958 | 0.366 |
| ledger-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,586 | 649 | 15,530 | 0.156 |
| shortlinks-none-r2 | agent | `claude-sonnet-5-5` |  | 4 | 5,998 | 29,470 | 12,587 | 0.113 |
| shortlinks-none-r2 | judge | `claude-opus-5-5` |  | 2 | 2,148 | 649 | 7,862 | 0.106 |
| shortlinks-min-r2 | agent | `claude-sonnet-5-5` |  | 4 | 6,205 | 29,959 | 13,242 | 0.118 |
| shortlinks-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,650 | 649 | 8,240 | 0.099 |
| shortlinks-keel-r2 | agent | `claude-sonnet-5-5` |  | 10 | 7,625 | 125,898 | 26,261 | 0.194 |
| shortlinks-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,485 | 649 | 9,579 | 0.106 |
| booking-none-r2 | agent | `claude-sonnet-5-5` |  | 4 | 4,960 | 29,499 | 11,637 | 0.099 |
| booking-none-r2 | judge | `claude-opus-5-5` |  | 2 | 1,362 | 649 | 7,667 | 0.089 |
| booking-min-r2 | agent | `claude-sonnet-5-5` |  | 4 | 5,233 | 29,983 | 12,425 | 0.105 |
| booking-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,488 | 649 | 8,151 | 0.095 |
| booking-keel-r2 | agent | `claude-sonnet-5-5` |  | 14 | 10,070 | 185,406 | 23,867 | 0.215 |
| booking-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,544 | 649 | 11,159 | 0.120 |
| ledger-none-r3 | agent | `claude-sonnet-5-5` |  | 6 | 5,783 | 53,040 | 12,626 | 0.114 |
| ledger-none-r3 | judge | `claude-opus-5-5` |  | 2 | 1,217 | 649 | 7,957 | 0.088 |
| ledger-min-r3 | agent | `claude-sonnet-5-5` |  | 8 | 4,802 | 76,402 | 12,175 | 0.104 |
| ledger-min-r3 | judge | `claude-opus-5-5` |  | 2 | 1,041 | 649 | 7,373 | 0.080 |
| ledger-keel-r3 | agent | `claude-sonnet-5-5` |  | 14 | 14,397 | 221,741 | 35,557 | 0.308 |
| ledger-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,440 | 649 | 14,439 | 0.144 |
| shortlinks-none-r3 | agent | `claude-sonnet-5-5` |  | 4 | 6,134 | 29,474 | 12,573 | 0.115 |
| shortlinks-none-r3 | judge | `claude-opus-5-5` |  | 2 | 1,693 | 649 | 7,941 | 0.098 |
| shortlinks-min-r3 | agent | `claude-sonnet-5-5` |  | 4 | 6,042 | 29,959 | 13,067 | 0.116 |
| shortlinks-min-r3 | judge | `claude-opus-5-5` |  | 2 | 2,338 | 649 | 7,984 | 0.111 |
| shortlinks-keel-r3 | agent | `claude-sonnet-5-5` |  | 6 | 8,048 | 57,525 | 21,312 | 0.171 |
| shortlinks-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,355 | 649 | 9,732 | 0.105 |
| booking-none-r3 | agent | `claude-sonnet-5-5` |  | 6 | 6,438 | 53,022 | 13,286 | 0.123 |
| booking-none-r3 | judge | `claude-opus-5-5` |  | 2 | 2,063 | 649 | 8,553 | 0.110 |
| booking-min-r3 | agent | `claude-sonnet-5-5` |  | 10 | 5,401 | 101,920 | 13,047 | 0.116 |
| booking-min-r3 | judge | `claude-opus-5-5` |  | 2 | 1,771 | 649 | 7,964 | 0.099 |
| booking-keel-r3 | agent | `claude-sonnet-5-5` |  | 10 | 9,406 | 115,370 | 23,316 | 0.199 |
| booking-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,459 | 649 | 10,970 | 0.117 |
| gen-usage.json | agent | `claude-sonnet-5-5` |  | 38 | 27,034 | 1,306,518 | 88,734 | 0.756 |
| gen-usage.json | agent | `claude-sonnet-5-5` |  | 38 | 34,769 | 1,288,006 | 101,687 | 0.883 |
| gen-usage.json | agent | `claude-sonnet-5-5` |  | 34 | 30,223 | 1,030,088 | 95,097 | 0.786 |

### Regression 2.6.0: Totals

| group | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| (fixture) / gen | agent | `claude-sonnet-5-5` | 3 | 110 | 92,026 | 3,624,612 | 285,518 | 2.425 |
| ALL | agent | `claude-sonnet-5-5` | 30 | 334 | 294,133 | 6,319,445 | 769,745 | 6.653 |
| ALL | judge | `claude-opus-5-5` | 27 | 54 | 41,615 | 17,523 | 249,254 | 2.830 |
| booking / keel | agent | `claude-sonnet-5-5` | 3 | 38 | 27,842 | 496,133 | 73,267 | 0.621 |
| booking / keel | judge | `claude-opus-5-5` | 3 | 6 | 4,376 | 1,947 | 32,334 | 0.347 |
| booking / min | agent | `claude-sonnet-5-5` | 3 | 18 | 15,043 | 161,874 | 36,988 | 0.315 |
| booking / min | judge | `claude-opus-5-5` | 3 | 6 | 5,074 | 1,947 | 23,620 | 0.291 |
| booking / none | agent | `claude-sonnet-5-5` | 3 | 14 | 16,442 | 112,020 | 36,720 | 0.323 |
| booking / none | judge | `claude-opus-5-5` | 3 | 6 | 5,160 | 1,947 | 24,066 | 0.296 |
| cond gen | agent | `claude-sonnet-5-5` | 3 | 110 | 92,026 | 3,624,612 | 285,518 | 2.425 |
| cond keel | agent | `claude-sonnet-5-5` | 9 | 120 | 101,869 | 1,785,789 | 257,922 | 2.229 |
| cond keel | judge | `claude-opus-5-5` | 9 | 18 | 13,025 | 5,841 | 107,442 | 1.121 |
| cond min | agent | `claude-sonnet-5-5` | 9 | 56 | 49,271 | 502,504 | 114,528 | 1.001 |
| cond min | judge | `claude-opus-5-5` | 9 | 18 | 14,205 | 5,841 | 70,492 | 0.849 |
| cond none | agent | `claude-sonnet-5-5` | 9 | 48 | 50,967 | 406,540 | 111,777 | 0.998 |
| cond none | judge | `claude-opus-5-5` | 9 | 18 | 14,385 | 5,841 | 71,320 | 0.860 |
| ledger / keel | agent | `claude-sonnet-5-5` | 3 | 58 | 50,506 | 1,012,104 | 113,457 | 1.060 |
| ledger / keel | judge | `claude-opus-5-5` | 3 | 6 | 4,386 | 1,947 | 45,885 | 0.455 |
| ledger / min | agent | `claude-sonnet-5-5` | 3 | 26 | 15,969 | 250,749 | 38,262 | 0.338 |
| ledger / min | judge | `claude-opus-5-5` | 3 | 6 | 3,665 | 1,947 | 22,787 | 0.256 |
| ledger / none | agent | `claude-sonnet-5-5` | 3 | 22 | 16,668 | 206,102 | 37,538 | 0.337 |
| ledger / none | judge | `claude-opus-5-5` | 3 | 6 | 3,797 | 1,947 | 23,525 | 0.265 |
| shortlinks / keel | agent | `claude-sonnet-5-5` | 3 | 24 | 23,521 | 277,552 | 71,198 | 0.548 |
| shortlinks / keel | judge | `claude-opus-5-5` | 3 | 6 | 4,263 | 1,947 | 29,223 | 0.319 |
| shortlinks / min | agent | `claude-sonnet-5-5` | 3 | 12 | 18,259 | 89,881 | 39,278 | 0.349 |
| shortlinks / min | judge | `claude-opus-5-5` | 3 | 6 | 5,466 | 1,947 | 24,085 | 0.302 |
| shortlinks / none | agent | `claude-sonnet-5-5` | 3 | 12 | 17,857 | 88,418 | 37,519 | 0.338 |
| shortlinks / none | judge | `claude-opus-5-5` | 3 | 6 | 5,428 | 1,947 | 23,729 | 0.299 |
| task (fixture) | agent | `claude-sonnet-5-5` | 3 | 110 | 92,026 | 3,624,612 | 285,518 | 2.425 |
| task booking | agent | `claude-sonnet-5-5` | 9 | 70 | 59,327 | 770,027 | 146,975 | 1.258 |
| task booking | judge | `claude-opus-5-5` | 9 | 18 | 14,610 | 5,841 | 80,020 | 0.934 |
| task ledger | agent | `claude-sonnet-5-5` | 9 | 106 | 83,143 | 1,468,955 | 189,257 | 1.736 |
| task ledger | judge | `claude-opus-5-5` | 9 | 18 | 11,848 | 5,841 | 92,197 | 0.976 |
| task shortlinks | agent | `claude-sonnet-5-5` | 9 | 48 | 59,637 | 455,851 | 147,995 | 1.234 |
| task shortlinks | judge | `claude-opus-5-5` | 9 | 18 | 15,157 | 5,841 | 77,037 | 0.921 |

### Regression 2.6.0: D1 live checks

| check | role | model id | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|
| /keel version | agent | `claude-sonnet-5-5` | 6 | 815 | 113,003 | 47,263 | 0.209 |
| /keel check | agent | `claude-sonnet-5-5` | 6 | 219 | 116,015 | 42,506 | 0.184 |
| /keel change fix-rounding-note | agent | `claude-sonnet-5-5` | 8 | 1,413 | 174,960 | 45,411 | 0.213 |

## 2.6.1 generation check (ledger, prototype tier)

Fixture not committed (the eval fixtures stay pinned to 2.6.0); kept in `~/HarnessAgents/eval-raw/keel-261/`.
Result: every catalog type present (9 full, 14 stubs quoting founder-answers), `.keel/check.mjs` clean, 3 area-rules files,
catalog read in full, no `[NEEDS DECISION]`, no `{{`. AGENTS.md + CLAUDE.md 5,816 B (2.6.0 ledger: 5,669 B).

| run | role | model id | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|
| gen ledger 2.6.1 | agent | `claude-sonnet-5-5` | 30 | 27,176 | 981,729 | 102,036 | 0.778 |

## v1 (16 Nov 2026)

Keel evaluation v1: harder tasks (invoices, quotas follow-ups; inventory in 3 sessions), conditions none / min / answers / keel. Same sources and columns as v0.

- Tested model: `claude-sonnet-5-5` (alias `sonnet`), exact id from every run's init event and modelUsage.
- Judge (rubric and drift): `claude-opus-5-5` (alias `opus`), no tools.
- Claude Code 2.1.325. Keel fixtures generated by Keel 2.5.6 from tag `keel--v2.5.6` (`git archive`), MVP tier.
- Raw logs: `~/HarnessAgents/eval-raw/keel-eval-v1/` (gen/, pilot/, full/).

### v1 spend ledger

| item | runs | agent $ | judge $ | total $ | source |
|---|---|---|---|---|---|
| Judge self-test (rubric) | 4 judge calls | - | 0.332 | 0.332 | `selftest-v1.md` |
| Drift judge self-test | 2 judge calls | - | 0.520 | 0.520 | `selftest-v1-drift.md` |
| Fixture generation, MVP tier, 3 tasks | 3 | 3.904 | - | 3.904 | `tasks/*/keel-gen-usage.json` |
| Pilot | 4 runs + 3 sessions | 3.935 | 1.668 | 5.603 | `v1-pilot/summary.json` |
| Full run (A 24 runs; B 5 conds x 3 reps x 3 sessions, incl. `spec`) | 24 runs + 45 sessions | 17.226 | 6.179 | 23.405 | `v1-full/summary.json` |
| **v1 total** | | **25.065** | **8.699** | **33.764** | of the USD 60 approved (full-run cap was 49.6; not reached) |

### Fixture generation (v1)

| run | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| gen invoices | agent | `claude-sonnet-5-5` | 1 | 44 | 58,431 | 2,402,087 | 150,193 | 1.425 |
| gen quotas | agent | `claude-sonnet-5-5` | 1 | 40 | 52,759 | 2,136,626 | 154,049 | 1.358 |
| gen inventory | agent | `claude-sonnet-5-5` | 1 | 44 | 40,926 | 2,063,141 | 126,245 | 1.121 |

### Pilot (v1)

#### Per run

| run | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| invoices-none-r1 | agent | `claude-sonnet-5-5` |  | 8 | 3,035 | 70,088 | 12,431 | 0.087 |
| invoices-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,253 | 649 | 9,263 | 0.099 |
| invoices-min-r1 | agent | `claude-sonnet-5-5` |  | 16 | 4,585 | 172,904 | 14,889 | 0.123 |
| invoices-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,002 | 649 | 9,564 | 0.097 |
| invoices-answers-r1 | agent | `claude-sonnet-5-5` |  | 10 | 5,512 | 99,005 | 16,601 | 0.131 |
| invoices-answers-r1 | judge | `claude-opus-5-5` |  | 2 | 1,173 | 649 | 9,504 | 0.100 |
| invoices-keel-r1 | agent | `claude-sonnet-5-5` |  | 10 | 7,170 | 119,792 | 25,802 | 0.187 |
| invoices-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 959 | 649 | 10,033 | 0.100 |
| inventory-keel-r1-s1 | agent | `claude-sonnet-5-5` |  | 128 | 32,590 | 1,108,955 | 217,459 | 1.004 |
| inventory-keel-r1-s1 | judge | `claude-opus-5-5` |  | 2 | 1,322 | 649 | 39,116 | 0.340 |
| inventory-keel-r1-s2 | agent | `claude-sonnet-5-5` |  | 132 | 43,996 | 1,135,899 | 249,021 | 1.196 |
| inventory-keel-r1-s2 | judge | `claude-opus-5-5` |  | 2 | 1,884 | 649 | 50,092 | 0.439 |
| inventory-keel-r1-s3 | agent | `claude-sonnet-5-5` |  | 148 | 43,303 | 1,348,070 | 247,709 | 1.207 |
| inventory-keel-r1-s3 | judge | `claude-opus-5-5` |  | 2 | 1,317 | 649 | 58,472 | 0.494 |

#### Totals

| group | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ALL | agent | `claude-sonnet-5-5` | 7 | 452 | 140,191 | 4,054,713 | 783,912 | 3.935 |
| ALL | judge | `claude-opus-5-5` | 7 | 14 | 8,910 | 4,543 | 186,044 | 1.668 |
| cond answers | agent | `claude-sonnet-5-5` | 1 | 10 | 5,512 | 99,005 | 16,601 | 0.131 |
| cond answers | judge | `claude-opus-5-5` | 1 | 2 | 1,173 | 649 | 9,504 | 0.100 |
| cond keel | agent | `claude-sonnet-5-5` | 4 | 418 | 127,059 | 3,712,716 | 739,991 | 3.594 |
| cond keel | judge | `claude-opus-5-5` | 4 | 8 | 5,482 | 2,596 | 157,713 | 1.372 |
| cond min | agent | `claude-sonnet-5-5` | 1 | 16 | 4,585 | 172,904 | 14,889 | 0.123 |
| cond min | judge | `claude-opus-5-5` | 1 | 2 | 1,002 | 649 | 9,564 | 0.097 |
| cond none | agent | `claude-sonnet-5-5` | 1 | 8 | 3,035 | 70,088 | 12,431 | 0.087 |
| cond none | judge | `claude-opus-5-5` | 1 | 2 | 1,253 | 649 | 9,263 | 0.099 |
| inventory / keel | agent | `claude-sonnet-5-5` | 3 | 408 | 119,889 | 3,592,924 | 714,189 | 3.407 |
| inventory / keel | judge | `claude-opus-5-5` | 3 | 6 | 4,523 | 1,947 | 147,680 | 1.272 |
| invoices / answers | agent | `claude-sonnet-5-5` | 1 | 10 | 5,512 | 99,005 | 16,601 | 0.131 |
| invoices / answers | judge | `claude-opus-5-5` | 1 | 2 | 1,173 | 649 | 9,504 | 0.100 |
| invoices / keel | agent | `claude-sonnet-5-5` | 1 | 10 | 7,170 | 119,792 | 25,802 | 0.187 |
| invoices / keel | judge | `claude-opus-5-5` | 1 | 2 | 959 | 649 | 10,033 | 0.100 |
| invoices / min | agent | `claude-sonnet-5-5` | 1 | 16 | 4,585 | 172,904 | 14,889 | 0.123 |
| invoices / min | judge | `claude-opus-5-5` | 1 | 2 | 1,002 | 649 | 9,564 | 0.097 |
| invoices / none | agent | `claude-sonnet-5-5` | 1 | 8 | 3,035 | 70,088 | 12,431 | 0.087 |
| invoices / none | judge | `claude-opus-5-5` | 1 | 2 | 1,253 | 649 | 9,263 | 0.099 |
| task inventory | agent | `claude-sonnet-5-5` | 3 | 408 | 119,889 | 3,592,924 | 714,189 | 3.407 |
| task inventory | judge | `claude-opus-5-5` | 3 | 6 | 4,523 | 1,947 | 147,680 | 1.272 |
| task invoices | agent | `claude-sonnet-5-5` | 4 | 44 | 20,302 | 461,789 | 69,723 | 0.528 |
| task invoices | judge | `claude-opus-5-5` | 4 | 8 | 4,387 | 2,596 | 38,364 | 0.395 |

### Full run (v1)

Source `v1-full/summary.json`. Tested model `claude-sonnet-5-5` and judge `claude-opus-5-5` in every row (exact ids from each run's `modelUsage`); Claude Code 2.1.325. Judge rows exist only where a judge ran: the rubric judge on invoices/quotas, the drift judge on inventory/keel.

#### Per run

| run | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| invoices-none-r1 | agent | `claude-sonnet-5-5` |  | 10 | 3,278 | 91,418 | 12,975 | 0.094 |
| invoices-none-r1 | judge | `claude-opus-5-5` |  | 2 | 841 | 649 | 9,238 | 0.091 |
| invoices-min-r1 | agent | `claude-sonnet-5-5` |  | 8 | 3,734 | 72,809 | 14,077 | 0.101 |
| invoices-min-r1 | judge | `claude-opus-5-5` |  | 2 | 833 | 649 | 9,603 | 0.094 |
| invoices-answers-r1 | agent | `claude-sonnet-5-5` |  | 8 | 3,749 | 74,085 | 14,815 | 0.104 |
| invoices-answers-r1 | judge | `claude-opus-5-5` |  | 2 | 1,107 | 649 | 10,119 | 0.103 |
| invoices-keel-r1 | agent | `claude-sonnet-5-5` |  | 14 | 11,695 | 202,765 | 31,459 | 0.263 |
| invoices-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 963 | 649 | 10,239 | 0.101 |
| quotas-none-r1 | agent | `claude-sonnet-5-5` |  | 12 | 3,476 | 116,434 | 12,703 | 0.097 |
| quotas-none-r1 | judge | `claude-opus-5-5` |  | 2 | 1,089 | 649 | 8,121 | 0.087 |
| quotas-min-r1 | agent | `claude-sonnet-5-5` |  | 8 | 2,574 | 70,300 | 11,813 | 0.080 |
| quotas-min-r1 | judge | `claude-opus-5-5` |  | 2 | 1,221 | 649 | 7,594 | 0.085 |
| quotas-answers-r1 | agent | `claude-sonnet-5-5` |  | 8 | 3,101 | 72,136 | 13,086 | 0.091 |
| quotas-answers-r1 | judge | `claude-opus-5-5` |  | 2 | 1,352 | 649 | 8,247 | 0.093 |
| quotas-keel-r1 | agent | `claude-sonnet-5-5` |  | 38 | 15,559 | 475,446 | 90,027 | 0.477 |
| quotas-keel-r1 | judge | `claude-opus-5-5` |  | 2 | 2,079 | 649 | 9,825 | 0.120 |
| inventory-none-r1-s1 | agent | `claude-sonnet-5-5` |  | 4 | 3,018 | 29,792 | 9,873 | 0.073 |
| inventory-none-r1-s2 | agent | `claude-sonnet-5-5` |  | 8 | 2,452 | 68,580 | 8,625 | 0.066 |
| inventory-none-r1-s3 | agent | `claude-sonnet-5-5` |  | 8 | 2,444 | 73,953 | 5,103 | 0.052 |
| inventory-min-r1-s1 | agent | `claude-sonnet-5-5` |  | 6 | 2,730 | 49,202 | 10,115 | 0.073 |
| inventory-min-r1-s2 | agent | `claude-sonnet-5-5` |  | 10 | 2,368 | 91,465 | 9,002 | 0.069 |
| inventory-min-r1-s3 | agent | `claude-sonnet-5-5` |  | 10 | 1,788 | 97,338 | 4,089 | 0.044 |
| inventory-answers-r1-s1 | agent | `claude-sonnet-5-5` |  | 6 | 3,325 | 49,882 | 11,222 | 0.083 |
| inventory-answers-r1-s2 | agent | `claude-sonnet-5-5` |  | 6 | 648 | 50,387 | 7,491 | 0.041 |
| inventory-answers-r1-s3 | agent | `claude-sonnet-5-5` |  | 6 | 957 | 54,948 | 2,873 | 0.027 |
| inventory-keel-r1-s1 | agent | `claude-sonnet-5-5` |  | 152 | 40,381 | 1,267,934 | 289,422 | 1.278 |
| inventory-keel-r1-s1 | judge | `claude-opus-5-5` |  | 2 | 1,480 | 649 | 39,590 | 0.346 |
| inventory-keel-r1-s2 | agent | `claude-sonnet-5-5` |  | 152 | 49,773 | 1,295,759 | 289,114 | 1.370 |
| inventory-keel-r1-s2 | judge | `claude-opus-5-5` |  | 2 | 1,247 | 649 | 51,784 | 0.439 |
| inventory-keel-r1-s3 | agent | `claude-sonnet-5-5` |  | 162 | 46,302 | 1,440,022 | 291,895 | 1.357 |
| inventory-keel-r1-s3 | judge | `claude-opus-5-5` |  | 2 | 632 | 649 | 60,639 | 0.498 |
| invoices-none-r2 | agent | `claude-sonnet-5-5` |  | 8 | 3,347 | 70,103 | 12,660 | 0.091 |
| invoices-none-r2 | judge | `claude-opus-5-5` |  | 2 | 825 | 649 | 9,502 | 0.093 |
| invoices-min-r2 | agent | `claude-sonnet-5-5` |  | 8 | 3,541 | 72,405 | 13,592 | 0.097 |
| invoices-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,121 | 649 | 9,508 | 0.099 |
| invoices-answers-r2 | agent | `claude-sonnet-5-5` |  | 8 | 4,687 | 75,655 | 15,902 | 0.118 |
| invoices-answers-r2 | judge | `claude-opus-5-5` |  | 2 | 832 | 649 | 10,271 | 0.099 |
| invoices-keel-r2 | agent | `claude-sonnet-5-5` |  | 8 | 3,893 | 87,865 | 23,433 | 0.141 |
| invoices-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,008 | 649 | 9,767 | 0.098 |
| quotas-none-r2 | agent | `claude-sonnet-5-5` |  | 12 | 3,380 | 111,128 | 12,196 | 0.094 |
| quotas-none-r2 | judge | `claude-opus-5-5` |  | 2 | 1,116 | 649 | 7,946 | 0.086 |
| quotas-min-r2 | agent | `claude-sonnet-5-5` |  | 10 | 3,466 | 93,690 | 12,605 | 0.094 |
| quotas-min-r2 | judge | `claude-opus-5-5` |  | 2 | 1,193 | 649 | 8,040 | 0.088 |
| quotas-answers-r2 | agent | `claude-sonnet-5-5` |  | 8 | 3,448 | 72,133 | 13,414 | 0.095 |
| quotas-answers-r2 | judge | `claude-opus-5-5` |  | 2 | 1,281 | 649 | 8,408 | 0.093 |
| quotas-keel-r2 | agent | `claude-sonnet-5-5` |  | 34 | 18,837 | 570,676 | 86,204 | 0.506 |
| quotas-keel-r2 | judge | `claude-opus-5-5` |  | 2 | 1,535 | 649 | 10,167 | 0.112 |
| inventory-none-r2-s1 | agent | `claude-sonnet-5-5` |  | 6 | 2,719 | 48,309 | 9,640 | 0.071 |
| inventory-none-r2-s2 | agent | `claude-sonnet-5-5` |  | 10 | 2,578 | 90,013 | 8,717 | 0.070 |
| inventory-none-r2-s3 | agent | `claude-sonnet-5-5` |  | 8 | 2,693 | 73,215 | 5,137 | 0.055 |
| inventory-min-r2-s1 | agent | `claude-sonnet-5-5` |  | 6 | 2,769 | 49,178 | 10,132 | 0.073 |
| inventory-min-r2-s2 | agent | `claude-sonnet-5-5` |  | 4 | 709 | 31,134 | 6,048 | 0.034 |
| inventory-min-r2-s3 | agent | `claude-sonnet-5-5` |  | 8 | 3,375 | 74,801 | 5,574 | 0.064 |
| inventory-answers-r2-s1 | agent | `claude-sonnet-5-5` |  | 6 | 3,112 | 49,805 | 11,005 | 0.080 |
| inventory-answers-r2-s2 | agent | `claude-sonnet-5-5` |  | 8 | 1,055 | 71,289 | 8,228 | 0.051 |
| inventory-answers-r2-s3 | agent | `claude-sonnet-5-5` |  | 6 | 858 | 55,007 | 2,446 | 0.024 |
| inventory-keel-r2-s1 | agent | `claude-sonnet-5-5` |  | 132 | 35,945 | 1,089,459 | 256,636 | 1.134 |
| inventory-keel-r2-s1 | judge | `claude-opus-5-5` |  | 2 | 1,922 | 649 | 38,980 | 0.350 |
| inventory-keel-r2-s2 | agent | `claude-sonnet-5-5` |  | 132 | 42,113 | 1,158,950 | 216,204 | 1.098 |
| inventory-keel-r2-s2 | judge | `claude-opus-5-5` |  | 2 | 1,658 | 649 | 49,281 | 0.428 |
| inventory-keel-r2-s3 | agent | `claude-sonnet-5-5` |  | 158 | 49,964 | 1,457,378 | 310,991 | 1.443 |
| inventory-keel-r2-s3 | judge | `claude-opus-5-5` |  | 2 | 1,469 | 649 | 57,845 | 0.492 |
| invoices-none-r3 | agent | `claude-sonnet-5-5` |  | 8 | 2,793 | 70,100 | 12,040 | 0.083 |
| invoices-none-r3 | judge | `claude-opus-5-5` |  | 2 | 1,236 | 649 | 9,031 | 0.097 |
| invoices-min-r3 | agent | `claude-sonnet-5-5` |  | 8 | 3,690 | 72,275 | 13,597 | 0.099 |
| invoices-min-r3 | judge | `claude-opus-5-5` |  | 2 | 928 | 649 | 9,577 | 0.095 |
| invoices-answers-r3 | agent | `claude-sonnet-5-5` |  | 14 | 4,860 | 156,665 | 17,174 | 0.133 |
| invoices-answers-r3 | judge | `claude-opus-5-5` |  | 2 | 979 | 649 | 10,344 | 0.102 |
| invoices-keel-r3 | agent | `claude-sonnet-5-5` |  | 12 | 6,967 | 149,607 | 25,822 | 0.188 |
| invoices-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,078 | 649 | 9,886 | 0.101 |
| quotas-none-r3 | agent | `claude-sonnet-5-5` |  | 10 | 5,449 | 91,691 | 14,942 | 0.123 |
| quotas-none-r3 | judge | `claude-opus-5-5` |  | 2 | 1,075 | 649 | 8,051 | 0.086 |
| quotas-min-r3 | agent | `claude-sonnet-5-5` |  | 8 | 3,067 | 70,931 | 12,232 | 0.087 |
| quotas-min-r3 | judge | `claude-opus-5-5` |  | 2 | 1,181 | 649 | 7,723 | 0.086 |
| quotas-answers-r3 | agent | `claude-sonnet-5-5` |  | 8 | 3,352 | 72,003 | 13,277 | 0.094 |
| quotas-answers-r3 | judge | `claude-opus-5-5` |  | 2 | 1,373 | 649 | 8,554 | 0.096 |
| quotas-keel-r3 | agent | `claude-sonnet-5-5` |  | 20 | 9,227 | 243,338 | 50,064 | 0.287 |
| quotas-keel-r3 | judge | `claude-opus-5-5` |  | 2 | 1,279 | 649 | 9,967 | 0.105 |
| inventory-none-r3-s1 | agent | `claude-sonnet-5-5` |  | 8 | 3,514 | 70,604 | 11,064 | 0.086 |
| inventory-none-r3-s2 | agent | `claude-sonnet-5-5` |  | 8 | 3,207 | 70,069 | 10,100 | 0.079 |
| inventory-none-r3-s3 | agent | `claude-sonnet-5-5` |  | 8 | 2,439 | 73,877 | 5,137 | 0.052 |
| inventory-min-r3-s1 | agent | `claude-sonnet-5-5` |  | 6 | 2,694 | 49,188 | 10,082 | 0.072 |
| inventory-min-r3-s2 | agent | `claude-sonnet-5-5` |  | 4 | 684 | 31,132 | 5,740 | 0.033 |
| inventory-min-r3-s3 | agent | `claude-sonnet-5-5` |  | 6 | 847 | 54,331 | 2,084 | 0.022 |
| inventory-answers-r3-s1 | agent | `claude-sonnet-5-5` |  | 6 | 3,166 | 49,812 | 11,105 | 0.081 |
| inventory-answers-r3-s2 | agent | `claude-sonnet-5-5` |  | 6 | 838 | 51,419 | 7,703 | 0.044 |
| inventory-answers-r3-s3 | agent | `claude-sonnet-5-5` |  | 6 | 704 | 56,013 | 2,744 | 0.024 |
| inventory-keel-r3-s1 | agent | `claude-sonnet-5-5` |  | 176 | 51,623 | 1,620,791 | 319,036 | 1.503 |
| inventory-keel-r3-s1 | judge | `claude-opus-5-5` |  | 2 | 1,444 | 649 | 41,427 | 0.360 |
| inventory-keel-r3-s2 | agent | `claude-sonnet-5-5` |  | 158 | 48,593 | 1,419,435 | 306,131 | 1.413 |
| inventory-keel-r3-s2 | judge | `claude-opus-5-5` |  | 2 | 1,524 | 649 | 52,677 | 0.452 |
| inventory-keel-r3-s3 | agent | `claude-sonnet-5-5` |  | 42 | 17,162 | 762,139 | 80,223 | 0.511 |
| inventory-keel-r3-s3 | judge | `claude-opus-5-5` |  | 2 | 1,316 | 649 | 59,289 | 0.501 |
| inventory-spec-r1-s1 | agent | `claude-sonnet-5-5` |  | 6 | 3,613 | 50,872 | 12,688 | 0.092 |
| inventory-spec-r1-s2 | agent | `claude-sonnet-5-5` |  | 8 | 4,497 | 73,904 | 14,899 | 0.112 |
| inventory-spec-r1-s3 | agent | `claude-sonnet-5-5` |  | 14 | 4,354 | 171,043 | 18,379 | 0.134 |
| inventory-spec-r2-s1 | agent | `claude-sonnet-5-5` |  | 8 | 3,249 | 72,329 | 11,428 | 0.085 |
| inventory-spec-r2-s2 | agent | `claude-sonnet-5-5` |  | 8 | 5,305 | 72,758 | 15,076 | 0.121 |
| inventory-spec-r2-s3 | agent | `claude-sonnet-5-5` |  | 8 | 5,089 | 79,124 | 9,638 | 0.097 |
| inventory-spec-r3-s1 | agent | `claude-sonnet-5-5` |  | 6 | 3,400 | 50,878 | 12,378 | 0.089 |
| inventory-spec-r3-s2 | agent | `claude-sonnet-5-5` |  | 8 | 4,931 | 73,095 | 12,754 | 0.108 |
| inventory-spec-r3-s3 | agent | `claude-sonnet-5-5` |  | 12 | 4,793 | 132,787 | 10,065 | 0.101 |

#### Totals

| group | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ALL | agent | `claude-sonnet-5-5` | 69 | 1,816 | 609,948 | 17,159,058 | 3,228,145 | 17.226 |
| ALL | judge | `claude-opus-5-5` | 33 | 66 | 40,217 | 21,417 | 671,240 | 6.179 |
| cond answers | agent | `claude-sonnet-5-5` | 15 | 110 | 37,860 | 1,011,239 | 152,485 | 1.090 |
| cond answers | judge | `claude-opus-5-5` | 6 | 12 | 6,924 | 3,894 | 55,943 | 0.587 |
| cond keel | agent | `claude-sonnet-5-5` | 15 | 1,390 | 448,034 | 13,241,564 | 2,666,661 | 12.968 |
| cond keel | judge | `claude-opus-5-5` | 15 | 30 | 20,634 | 9,735 | 511,363 | 4.506 |
| cond min | agent | `claude-sonnet-5-5` | 15 | 110 | 38,036 | 980,179 | 140,782 | 1.042 |
| cond min | judge | `claude-opus-5-5` | 6 | 12 | 6,477 | 3,894 | 52,045 | 0.547 |
| cond none | agent | `claude-sonnet-5-5` | 15 | 128 | 46,787 | 1,149,286 | 150,912 | 1.187 |
| cond none | judge | `claude-opus-5-5` | 6 | 12 | 6,182 | 3,894 | 51,889 | 0.540 |
| cond spec | agent | `claude-sonnet-5-5` | 9 | 78 | 39,231 | 776,790 | 117,305 | 0.939 |
| inventory / answers | agent | `claude-sonnet-5-5` | 9 | 56 | 14,663 | 488,562 | 64,817 | 0.455 |
| inventory / keel | agent | `claude-sonnet-5-5` | 9 | 1,264 | 381,856 | 11,511,867 | 2,359,652 | 11.105 |
| inventory / keel | judge | `claude-opus-5-5` | 9 | 18 | 12,692 | 5,841 | 451,512 | 3.867 |
| inventory / min | agent | `claude-sonnet-5-5` | 9 | 60 | 17,964 | 527,769 | 62,866 | 0.484 |
| inventory / none | agent | `claude-sonnet-5-5` | 9 | 68 | 25,064 | 598,412 | 73,396 | 0.604 |
| inventory / spec | agent | `claude-sonnet-5-5` | 9 | 78 | 39,231 | 776,790 | 117,305 | 0.939 |
| invoices / answers | agent | `claude-sonnet-5-5` | 3 | 30 | 13,296 | 306,405 | 47,891 | 0.355 |
| invoices / answers | judge | `claude-opus-5-5` | 3 | 6 | 2,918 | 1,947 | 30,734 | 0.305 |
| invoices / keel | agent | `claude-sonnet-5-5` | 3 | 34 | 22,555 | 440,237 | 80,714 | 0.592 |
| invoices / keel | judge | `claude-opus-5-5` | 3 | 6 | 3,049 | 1,947 | 29,892 | 0.301 |
| invoices / min | agent | `claude-sonnet-5-5` | 3 | 24 | 10,965 | 217,489 | 41,266 | 0.297 |
| invoices / min | judge | `claude-opus-5-5` | 3 | 6 | 2,882 | 1,947 | 28,688 | 0.288 |
| invoices / none | agent | `claude-sonnet-5-5` | 3 | 26 | 9,418 | 231,621 | 37,675 | 0.268 |
| invoices / none | judge | `claude-opus-5-5` | 3 | 6 | 2,902 | 1,947 | 27,771 | 0.281 |
| quotas / answers | agent | `claude-sonnet-5-5` | 3 | 24 | 9,901 | 216,272 | 39,777 | 0.280 |
| quotas / answers | judge | `claude-opus-5-5` | 3 | 6 | 4,006 | 1,947 | 25,209 | 0.282 |
| quotas / keel | agent | `claude-sonnet-5-5` | 3 | 92 | 43,623 | 1,289,460 | 226,295 | 1.270 |
| quotas / keel | judge | `claude-opus-5-5` | 3 | 6 | 4,893 | 1,947 | 29,959 | 0.338 |
| quotas / min | agent | `claude-sonnet-5-5` | 3 | 26 | 9,107 | 234,921 | 36,650 | 0.261 |
| quotas / min | judge | `claude-opus-5-5` | 3 | 6 | 3,595 | 1,947 | 23,357 | 0.259 |
| quotas / none | agent | `claude-sonnet-5-5` | 3 | 34 | 12,305 | 319,253 | 39,841 | 0.314 |
| quotas / none | judge | `claude-opus-5-5` | 3 | 6 | 3,280 | 1,947 | 24,118 | 0.259 |
| task inventory | agent | `claude-sonnet-5-5` | 45 | 1,526 | 478,778 | 13,903,400 | 2,678,036 | 13.588 |
| task inventory | judge | `claude-opus-5-5` | 9 | 18 | 12,692 | 5,841 | 451,512 | 3.867 |
| task invoices | agent | `claude-sonnet-5-5` | 12 | 114 | 56,234 | 1,195,752 | 207,546 | 1.512 |
| task invoices | judge | `claude-opus-5-5` | 12 | 24 | 11,751 | 7,788 | 117,085 | 1.173 |
| task quotas | agent | `claude-sonnet-5-5` | 12 | 176 | 74,936 | 2,059,906 | 342,563 | 2.126 |
| task quotas | judge | `claude-opus-5-5` | 12 | 24 | 15,774 | 7,788 | 102,643 | 1.138 |


## 2.6.2 drift measurement (16 Nov 2026, cap USD 15)

Task v1 inventory, keel condition, 2.5.6 docs plus the 2.6.2 doc-sync overlay. Stopped after rep 1 (verdict already decided: 2 of 9 sessions failed). Rep 2 session 1 was killed mid-run: its transcript was never written, so its tokens and cost are **not recorded**: estimated at USD 0.3–0.6 (about 1–2 of 4–5 minutes), upper bound USD 5; counted as USD 0.6 for the budget. Recorded spend: USD 5.242 (agent 3.987 + judge 1.255).

### Per run

| run | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| inventory-keel-r1-s1 | agent | `claude-sonnet-5-5` |  | 178 | 46,869 | 1,516,220 | 324,528 | 1.455 |
| inventory-keel-r1-s1 | judge | `claude-opus-5-5` |  | 2 | 1,394 | 649 | 40,260 | 0.350 |
| inventory-keel-r1-s2 | agent | `claude-sonnet-5-5` |  | 148 | 45,341 | 1,330,054 | 287,133 | 1.325 |
| inventory-keel-r1-s2 | judge | `claude-opus-5-5` |  | 2 | 1,298 | 649 | 50,617 | 0.431 |
| inventory-keel-r1-s3 | agent | `claude-sonnet-5-5` |  | 148 | 43,145 | 1,411,902 | 245,715 | 1.207 |
| inventory-keel-r1-s3 | judge | `claude-opus-5-5` |  | 2 | 834 | 649 | 57,092 | 0.474 |

### Totals

| group | role | model id | runs | input | output | cache read | cache write | cost $ |
|---|---|---|---|---|---|---|---|---|
| ALL | agent | `claude-sonnet-5-5` | 3 | 474 | 135,355 | 4,258,176 | 857,376 | 3.987 |
| ALL | judge | `claude-opus-5-5` | 3 | 6 | 3,526 | 1,947 | 147,969 | 1.255 |
| cond keel | agent | `claude-sonnet-5-5` | 3 | 474 | 135,355 | 4,258,176 | 857,376 | 3.987 |
| cond keel | judge | `claude-opus-5-5` | 3 | 6 | 3,526 | 1,947 | 147,969 | 1.255 |
| inventory / keel | agent | `claude-sonnet-5-5` | 3 | 474 | 135,355 | 4,258,176 | 857,376 | 3.987 |
| inventory / keel | judge | `claude-opus-5-5` | 3 | 6 | 3,526 | 1,947 | 147,969 | 1.255 |
| task inventory | agent | `claude-sonnet-5-5` | 3 | 474 | 135,355 | 4,258,176 | 857,376 | 3.987 |
| task inventory | judge | `claude-opus-5-5` | 3 | 6 | 3,526 | 1,947 | 147,969 | 1.255 |
