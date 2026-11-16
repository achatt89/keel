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
