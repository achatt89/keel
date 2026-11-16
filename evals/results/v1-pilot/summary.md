| run | success | tests | decision tests | judge | drift | regressions | agent $ | judge $ | turns | wall s | out tok | cache read | doc reads (sub) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| invoices-none-r1 | no | 5/13 | 3/11 | pass (errors) | - | - | 0.09 | 0.10 | 4 | 23 | 3035 | 70088 | 0 (0) |
| invoices-min-r1 | no | 5/13 | 3/11 | pass (errors) | - | - | 0.12 | 0.10 | 9 | 35 | 4585 | 172904 | 0 (0) |
| invoices-answers-r1 | yes | 13/13 | 11/11 | pass (errors) | - | - | 0.13 | 0.10 | 5 | 34 | 5512 | 99005 | 1 (0) |
| invoices-keel-r1 | yes | 13/13 | 11/11 | pass (errors) | - | - | 0.19 | 0.10 | 5 | 42 | 7170 | 119792 | 2 (0) |
| inventory-keel-r1-s1 | yes | 5/5 | - | - | fail (no-contradiction) | 0 | 1.00 | 0.34 | 6 | 186 | 32590 | 1108955 | 0 (0) |
| inventory-keel-r1-s2 | yes | 11/11 | - | - | pass | 0 | 1.20 | 0.44 | 6 | 217 | 43996 | 1135899 | 0 (0) |
| inventory-keel-r1-s3 | yes | 15/15 | - | - | fail (no-contradiction) | 0 | 1.21 | 0.49 | 6 | 225 | 43303 | 1348070 | 0 (0) |

Total spend: agent 3.935 + judge 1.668 = 5.603. Multi-session runs: the run total is the sum of its session rows.
