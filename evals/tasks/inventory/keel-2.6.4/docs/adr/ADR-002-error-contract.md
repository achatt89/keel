---
id: ADR-002
status: Accepted
paths: [src/inventory.js]
check: test/errors.test.js (NFR-COR-001)
---

# ADR-002 — Error contract — one InventoryError with a closed code set

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | founder (call) · engineering (design) |
| **Bounded by** | STK-001, BO-03, NFR-COR-001 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Every broken rule must throw `InventoryError` with a specific `code`; the founder lists the codes but not their precedence or the codes for unlisted malformed inputs. Callers branch on `code`, so precedence must be deterministic.

## Decision

| | |
|---|---|
| **Decision** | In the context of callers branching on error codes, facing inputs that match several rules, we chose **one `InventoryError` class with eight codes and a fixed check order (argument shape and format, then state)** to achieve predictable errors, accepting that unlisted cases use the nearest listed code: an unknown or non-string SKU is `not_found` (A-02) and `release`/`fulfil` on an id with no reservation is `not_found` (A-03). |
| **Revisit trigger** | The founder answers an open decision that changes a code or the order. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Several error classes | `instanceof` branching | Spec says one class with `code` | ✗ |
| **One class, `code` property, fixed order** | Matches the spec; simple | Precedence must be documented | ✓ |
| Return result objects | No throwing | Spec says every broken rule throws | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Callers write `catch (e) { if (e.code === ...) }`; tests assert codes exactly. |
| Harder | Adding a code later is a contract change visible to callers. |
| Off the table | Throwing native `TypeError`/`RangeError` for rule violations. |
| Build deviation | — (filled at Built) |
