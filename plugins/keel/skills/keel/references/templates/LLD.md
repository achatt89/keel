<!--
  Keel template — LLD.md (Low-Level Design)
  =================================================================
  WHAT THIS DOC IS:
    The implementer's contract reference. A module map, the canonical shared-type
    definitions (single source of truth for core types), the key interface/
    signature blocks per module, an error-handling strategy, and the
    security-module implementations. This is what a team — or Claude Code —
    builds against, module by module.

  WHEN TO INCLUDE (catalog adaptivity trigger):
    Product tier and up. Include for anything built module-by-module against a
    shared type contract. Skip for a pure script/one-file library where
    ARCHITECTURE already says enough.

  DEPENDS ON:
    ARCHITECTURE.md (component breakdown, schema, API design) and the Architect
    round. References ADRs for decisions baked into type shapes.

  IDS THIS DOC OWNS:
    - The MODULE MAP (§1): the authoritative module → file → responsibility table.
    - The CANONICAL TYPE / INTERFACE NAMESPACE (§2): the one home for shared core
      types. Every other doc and module references these; they are NOT redefined
      elsewhere.
    It does not mint requirement/decision ids — it references BRD/PRD/ADR ids and
    ARCHITECTURE §-sections. Owns its own §-numbering for cross-reference.

  Cross-reference siblings: ARCHITECTURE.md §x (component/schema), ADR-xxx
    (why a type/interface is shaped this way), NFR.md (how a security module is
    tested). Per the convention chain: BRD → ARCHITECTURE → THIS → ADR → NFR.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Low-Level Design
## {{PROJECT_NAME}}

**Version:** 0.1
**Date:** {{DATE}}
**Author:** {{AUTHOR}}
**Status:** Draft
**Source of truth:** ARCHITECTURE.md

---

## Table of Contents

1. [Module Map](#1-module-map)
2. [Core Type Definitions](#2-core-type-definitions)
3. [{{MODULE_A}} Module](#3-module-a)
4. [{{MODULE_B}} Module](#4-module-b)
5. [API Layer Module](#5-api-layer-module)
6. [Data Access Layer](#6-data-access-layer)
7. [Error Handling Strategy](#7-error-handling-strategy)
8. [Security Module Implementations](#8-security-module-implementations)

<!-- Add a § per real module — mirror the ARCHITECTURE §2 component set. -->

---

## 1. Module Map

<!-- Keel guidance: one row per module/file the build produces. This is the
     blueprint Claude Code follows file-by-file. The two right-hand columns are
     load-bearing: "depends on" sets build order; "does NOT own" prevents two
     modules claiming the same responsibility. Derive directly from
     ARCHITECTURE §2 — each component's "what it owns / does not own" becomes a
     row. -->

| Module | File path | Responsibility | Depends on | Does NOT own |
|---|---|---|---|---|
| **Core Types** | `{{src/types/index}}` | Shared types across the system | — | any runtime logic |
| **{{Module}}** | `{{path}}` | {{single responsibility}} | {{Core Types, …}} | {{the concern it delegates}} |
| **{{Module}}** | `{{path}}` | {{...}} | {{...}} | {{...}} |

---

## 2. Core Type Definitions

<!-- Keel guidance: THE single source of truth for shared types. Language-agnostic
     interface blocks (use the project's language). Group by domain area with
     comment dividers. Anything used by 2+ modules lives HERE and is imported,
     never re-declared. Keep request/response API shapes that cross module
     boundaries here too. This is the contract the whole build references. -->

```{{language}}
// {{src/types/index}}

// ─── {{Scope / Identity}} ───────────────────────────────────────────────
export type {{ScopeRole}} = '{{role_a}}' | '{{role_b}}' | '{{role_c}}';

export interface {{ScopeContext}} {
  {{scopeKey}}: string;     // {{isolation key carried on every scoped op}}
  userId: string;
  role: {{ScopeRole}};
  requestId: string;        // trace correlation
}

// ─── {{Core Entity}} ────────────────────────────────────────────────────
export interface {{Entity}} {
  id: string;
  {{scopeKey}}: string;
  {{field}}: {{Type}};
  createdAt: Date;
}

// ─── {{Operation / Job}} ────────────────────────────────────────────────
export type {{JobStatus}} = '{{queued}}' | '{{running}}' | '{{done}}' | '{{failed}}';

export interface {{RequestType}} { {{...}} }
export interface {{ResponseType}} { {{...}} }
```

---

## 3. {{MODULE_A}}

<!-- Keel guidance: one § per significant module. EVERY module section states what
     it OWNS and what it does NOT own (mirrors its module-map row), then the key
     interface(s)/signature(s) — not full implementations, just the contract a
     caller depends on. Note the integration rule (who must call what). -->

**Owns:** {{responsibilities}}
**Does NOT own:** {{delegated concern}} (→ {{module}})

```{{language}}
// {{path}}
export interface {{ModuleContract}} {
  {{method}}({{args}}): {{ReturnType}};
}
```

**Integration rule:** {{e.g. callers MUST go through {{fn}}; direct use of {{x}}
is prohibited (enforced by {{lint rule / convention}}).}}

---

## 4. {{MODULE_B}}

**Owns:** {{...}}
**Does NOT own:** {{...}}

```{{language}}
// {{path}}
export interface {{ModuleContract}} { {{...}} }
```

<!-- Repeat §5, §6 … per module from the map. -->

---

## 5. API Layer Module

<!-- Keel guidance: server bootstrap, the middleware/preHandler chain in ORDER,
     and how scope/identity context is injected before handlers run. Show the
     signature of the scope-context entrypoint (the single guarded path to data).
     Route handlers implement the contracts in ARCHITECTURE §4 — reference, don't
     restate the wire shapes. -->

**Owns:** server bootstrap, middleware chain order, {{scope}}-context injection.
**Does NOT own:** business logic (delegated to modules above), authz policy (→ §8).

```{{language}}
// {{scope-context entrypoint — the single guarded path to data}}
export function {{withScope}}({{scopeKey}}: string) {
  // wraps every operation so {{isolation}} is enforced before any access
}
```

Middleware chain (in order): {{ [1] headers → [2] rate limit → [3] authn →
[4] scope context → [5] authz → [6] input validation → [7] handler → [8] audit ]}}

---

## 6. Data Access Layer

<!-- Keel guidance: how persistence is reached. The schema definitions live in
     ARCHITECTURE §3 — here, show the access-wrapper contract that enforces the
     scoping invariant on every query, and the rule that bars bypassing it. -->

**Owns:** the scoped query wrapper; schema bindings.
**Does NOT own:** the schema of record (→ ARCHITECTURE §3).

```{{language}}
// {{path}} — every query goes through the scoped wrapper
export function {{createScopedClient}}({{scopeKey}}: string) { {{...}} }
```

**Rule:** {{no module may obtain a raw/unscoped client; enforced by {{lint rule}}.}}

---

## 7. Error Handling Strategy

<!-- Keel guidance: one error hierarchy, a closed set of error codes, and how
     errors propagate to the client vs. the log. State which errors are retryable
     (drives queue/worker retry) and the sanitisation rule (internal detail never
     reaches the client in production). -->

```{{language}}
// {{src/errors/index}}
export type {{ErrorCode}} =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | '{{DOMAIN_ERROR}}'
  | '{{DOMAIN_ERROR}}';

export class {{BaseError}} extends Error {
  readonly code: {{ErrorCode}};
  readonly retryable: boolean;
  readonly httpStatus: number;
  readonly context?: Record<string, unknown>;
}
```

| Error code | Retryable? | HTTP | Client message |
|---|---|---|---|
| `{{CODE}}` | {{yes/no}} | {{status}} | {{sanitised message}} |

**Propagation:** {{handler → global error normaliser → client envelope}}.
**Sanitisation:** in production, {{internal details ({{stack/DB constraints}})}}
go to logs only, never to the client.

---

## 8. Security Module Implementations

<!-- Keel guidance: the concrete implementations of the controls catalogued in
     ARCHITECTURE §6. One subsection per security module: the threat it addresses
     (+ ADR ref), the enforcement RULE (what callers must/mustn't do, ideally
     lint-enforced), and the key signatures. Test requirements live in NFR.md —
     reference them. Only include the modules the project's data sensitivity
     actually warrants. -->

> Modules in `{{src/security/}}` implement controls in ARCHITECTURE §6; their test
> requirements live in NFR.md; accepted residual risks in ARCHITECTURE §9.

### 8.1 {{Security Module}} ({{ADR-xxx}})

Addresses {{threat}}.

**Rule:** {{what callers MUST do / what is prohibited}} (enforced by {{lint rule
/ CI gate}}).

```{{language}}
// {{path}}
export function {{guardFn}}({{args}}): {{ReturnType}} { {{...}} }
```

### 8.2 {{Security Module}} ({{ADR-xxx}})

Addresses {{threat}}.

**Rule:** {{...}}

```{{language}}
// {{path}}
export function {{guardFn}}({{args}}): {{ReturnType}} { {{...}} }
```

<!-- Repeat §8.x per security module. Common ones: input/upload validation,
     webhook signature + replay protection, scope-context guard for async
     workers, telemetry attribute allowlist, outbound-URL (SSRF) validation,
     content-safety wrapping for any untrusted text that reaches a model. -->

---

*End of LLD.md — {{PROJECT_NAME}}*
