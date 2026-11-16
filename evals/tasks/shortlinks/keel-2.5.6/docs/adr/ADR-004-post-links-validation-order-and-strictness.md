# ADR-004 — `POST /links` validation — fixed check order, strict URL charset, 16 KiB body cap

| | |
|---|---|
| **Status** | Proposed 2026-11-16 — `[ASSUMPTION]` (OD-01, OD-02, OD-03); implement as written unless the founder overrides |
| **Deciders** | founder (visible behaviour) · engineering |
| **Bounded by** | VAL-001..004, ABU-001, RSK-002, PRD.md §5 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 (validation, body cap) · Phase 2 (limiter position) |

## Context

The spec lists error codes but not their precedence when several apply (invalid URL *and* limit reached; code taken *and* limit reached), nor what to do with CR/LF or non-ASCII in a URL that `new URL()` accepts but `Location` cannot carry, nor with oversized bodies.

## Decision

| | |
|---|---|
| **Decision** | In the context of ambiguous precedence and an HTTP header that must stay well-formed, facing several orderings, we chose the order **body cap (413) → JSON (400) → `url` (400) → `code` (400) → rate limit (429) → reserved/used code (409) → create**; `url` must parse with `new URL()`, use `http:`/`https:`, be ≤ 2048 chars and contain only printable ASCII (`0x21`–`0x7E`); bodies over 16 KiB get 413 `payload_too_large` — to achieve that client mistakes are reported as 400 regardless of limiter state, that failed requests never consume slots, and that `Location` is always valid, accepting that valid IRIs must be percent-encoded and that `payload_too_large` is a code outside the founder's list. |
| **Revisit trigger** | The founder wants non-ASCII URLs accepted, a different precedence, or no 413. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Rate limit first (429 before validation) | cheapest abuse rejection | a client at the limit cannot learn its input is wrong | ✗ |
| **Validate, then limit, then uniqueness** | clean semantics; 409 at the limit would never create anyway | validation CPU is spent for limited clients (trivial) | ✓ |
| Accept any `new URL()`-valid string | no extra rule | CR/LF are stripped by the parser but not in the raw string; `Location` would throw/500; non-ASCII breaks headers | ✗ |
| Normalise to `URL.href` | always safe | echoed `url` differs from input (`https://a.com` → `https://a.com/`) | ✗ |
| Unlimited body | simplest | memory abuse | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | One validator module; boundaries are enumerable in tests |
| Harder | The limiter position is load-bearing: it sits after validation and before the uniqueness check, in one synchronous step with the write |
| Off the table | Accepting IRIs (non-ASCII) un-encoded; counting invalid requests toward the limit |
| Build deviation | *(filled at Built)* |
