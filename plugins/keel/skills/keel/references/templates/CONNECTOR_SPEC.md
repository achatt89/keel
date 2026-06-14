<!--
  Keel template — {{EXTENSION_POINT}} contract spec (e.g. CONNECTOR_SPEC / ADAPTER_SPEC / PLUGIN_SPEC)
  WHAT: The binding contract for one pluggable extension point. The interface, the
        validation rules, the lifecycle, error handling, registration metadata, and the
        universal test suite every implementation must pass.
  INCLUDE WHEN: ONLY when the system has a real extension/plugin ecosystem — multiple
        implementations of one interface, added without touching core. If there's no
        plug-in dimension, omit this file entirely.
  DEPENDS ON: {{LLD}} (types), {{ARCHITECTURE}} (where the extension point sits, trust
        boundaries).
  OWNS: The {{EXTENSION_POINT}} interface contract. Rename "{{EXTENSION_POINT}}"
        throughout to the project's own word (connector / adapter / plugin / driver).
  Delete all <!-- Keel guidance --> comments (and this block) when filling this in.
-->

# {{EXTENSION_POINT_TITLE}} Specification
## {{PROJECT_NAME}} — {{EXTENSION_POINT}} Contract

**Version:** {{VERSION}}
**Date:** {{DATE}}
**Status:** Authoritative — the binding contract for all {{EXTENSION_POINT}} implementations.

---

## 1. Overview

<!-- Keel guidance: define what one {{EXTENSION_POINT}} is and the single job it does.
     State the strict plugin rule up front: adding a new one requires ZERO changes to
     core. Note statelessness and any trust posture (untrusted input, sandboxing). -->

A **{{EXTENSION_POINT}}** is a stateless plugin responsible for one job: {{EXTENSION_JOB}}.
Everything downstream — {{DOWNSTREAM_CONCERNS}} — is the {{CORE_SYSTEM}}'s concern, not the
{{EXTENSION_POINT}}'s.

The plugin model is strict: **adding a {{EXTENSION_POINT}} requires zero changes to the
{{CORE_SYSTEM}}.** A {{EXTENSION_POINT}} registers itself in the {{REGISTRY}} and the
{{CORE_SYSTEM}} routes to it by {{ROUTING_KEY}}. No core modifications, no conditional
branches in core code. This is a hard constraint ({{INVARIANT_REF}}).

---

## 2. Core interface

<!-- Keel guidance: the canonical signature block in the project's real language
     (placeholders below are language-agnostic). Shared types it consumes/emits, then the
     interface with each method's contract. State statelessness / idempotency /
     no-side-effect rules explicitly — they are the contract, not advice. -->

```{{LANG}}
// ─── Shared types ────────────────────────────────────────────────────────────

type {{INPUT_TYPE}} = {
  {{INPUT_FIELDS}}
}

type {{OUTPUT_TYPE}} = {
  /** Stable, deterministic identity — same input always yields the same id. */
  {{ID_FIELD}}: {{ID_TYPE}}
  {{OUTPUT_FIELDS}}
}

type {{CONTEXT_TYPE}} = {
  /** Scope/tenant this invocation belongs to. Required for isolation. */
  {{SCOPE_FIELD}}: {{SCOPE_TYPE}}
  {{CONTEXT_FIELDS}}
}

type ValidationResult = {
  valid: boolean
  /** User-facing messages when valid is false — never raw stack traces. */
  errors?: string[]
  {{VALIDATION_EXTRA}}
}

// ─── Primary interface ───────────────────────────────────────────────────────

/**
 * {{INTERFACE_NAME}} — the binding contract for every {{EXTENSION_POINT}}.
 *
 * Rules:
 *   1. Stateless — no instance state between invocations.
 *   2. {{PROCESS_METHOD}}() must be idempotent — same input always produces the same output.
 *   3. {{PROCESS_METHOD}}() must NOT write to the database or queue. It returns results only.
 *   4. {{VALIDATE_METHOD}}() must be fast (<{{VALIDATE_BUDGET}}). No full processing during validation.
 *   5. A {{EXTENSION_POINT}} that extracts nothing from a valid input returns empty — it must NOT throw.
 */
interface {{INTERFACE_NAME}} {
  // ── Identity ──────────────────────────────────────────────────────────────
  readonly id: string            // stable, kebab-case, globally unique
  readonly name: string          // human-readable display name
  readonly version: string       // semver; bump on any breaking output change
  readonly {{ROUTING_FIELD}}: {{ROUTING_TYPE}}   // what the registry routes on

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  {{VALIDATE_METHOD}}(input: {{INPUT_TYPE}}): Promise<ValidationResult>
  {{PROCESS_METHOD}}(input: {{INPUT_TYPE}}, context: {{CONTEXT_TYPE}}): Promise<{{OUTPUT_TYPE}}[]>

  // ── Discovery / metadata ──────────────────────────────────────────────────
  {{METADATA_METHOD}}(): {{METADATA_TYPE}}
}
```

---

## 3. Validation contract

<!-- Keel guidance: what validate() MUST check before input is accepted — shape, time
     budget, and input-safety obligations (size caps, decompression limits,
     path-traversal, MIME/type checks). The security floor every implementation
     inherits. Reference NFR IDs rather than restating acceptance criteria. -->

`{{VALIDATE_METHOD}}()` runs before an input is accepted. It MUST:

- Check structure / shape / required fields and reject malformed input with user-facing `errors`.
- Complete in **<{{VALIDATE_BUDGET}}** — no full processing, no I/O beyond reading the input.
- Enforce the shared input-safety limits ({{SAFETY_LIMITS}}, see {{NFR}} {{SAFETY_NFR_REFS}}): size caps, {{DECOMPRESSION_RULE}}, and {{PATH_TRAVERSAL_RULE}}. Implementations MUST use the shared validator — never roll their own.

---

## 4. Lifecycle

<!-- Keel guidance: the full path of one invocation, from entry to stored result. ASCII
     boxes or a numbered list — whichever the team scans faster. Call out the
     deduplication / idempotency key and any retry/partial-success semantics. -->

```
1. Submit & validate   → {{REGISTRY}}.resolve({{ROUTING_KEY}}) → {{VALIDATE_METHOD}}()
                          → reject if invalid; accept + enqueue if valid
2. Dequeue & process   → resolve {{EXTENSION_POINT}}, build {{CONTEXT_TYPE}}, call {{PROCESS_METHOD}}()
                          → emit {{OUTPUT_TYPE}}[]
3. Deduplicate         → key: ({{DEDUP_KEY}}); skip if seen, proceed if new
4. {{DOWNSTREAM_STEPS}} → core pipeline takes over
5. Completion          → record status, {{COMPLETION_SIDE_EFFECTS}}, write audit entry
6. Failure             → retry {{RETRY_POLICY}}; partial success is valid (log per-item, continue)
```

**Deduplication / idempotency key:** `({{DEDUP_KEY}})`. {{EXTENSION_POINT}}s MUST produce
stable, deterministic identities; when none is available from the source, derive one
deterministically from available fields.

---

## 5. Error handling

<!-- Keel guidance: the rules for what throws vs. what's skipped. The recurring pattern:
     never throw on one bad item inside a batch — skip and log; only throw for input the
     whole invocation can't proceed on. Define the error taxonomy if there is one. -->

- **Per-item failures never abort the batch.** A malformed item is skipped and logged; valid items still return. `{{PROCESS_METHOD}}()` must not throw because one item is bad.
- **Empty is a valid result.** A valid input with nothing to extract returns `[]`, never an error.
- **Validation failures are user-facing.** Return `valid: false` with `errors` — never leak internals.
- {{ERROR_TAXONOMY}}.

---

## 6. Registration & metadata

<!-- Keel guidance: how a {{EXTENSION_POINT}} announces itself to the registry, and the
     capability/metadata object it exposes for discovery. Show the registry's resolve
     paths (by id, by routing key) and the bootstrap pattern (self-registration on
     import; core never imports the {{EXTENSION_POINT}}). -->

Registration is **explicit** — each {{EXTENSION_POINT}} registers itself with the
{{REGISTRY}} at startup; there is no filesystem auto-discovery. The {{REGISTRY}} resolves
by explicit `id` and by `{{ROUTING_KEY}}`. The {{CORE_SYSTEM}} never imports a
{{EXTENSION_POINT}} directly — the registry is the only coupling point.

```{{LANG}}
// {{EXTENSION_POINT}}s/{{EXAMPLE_NAME}}/index.{{EXT}}
import { {{REGISTRY_SINGLETON}} } from '{{REGISTRY_PATH}}'
import { {{EXAMPLE_CLASS}} } from './{{EXAMPLE_CLASS}}'

{{REGISTRY_SINGLETON}}.register(new {{EXAMPLE_CLASS}}())
```

The metadata object returned by `{{METADATA_METHOD}}()` declares the {{EXTENSION_POINT}}'s
identity and capabilities for discovery: `{ id, name, version, {{ROUTING_FIELD}}, capabilities[] }`.

---

## 7. Universal test suite

<!-- Keel guidance: the checklist EVERY implementation must pass — this is the contract's
     teeth. Keep it as a table of test → assertion. Include the security fixtures row if
     the input surface is untrusted. Reference NFR IDs for exact acceptance criteria. -->

Every {{EXTENSION_POINT}} MUST pass these. Tests live alongside the implementation.

| Test | Assertion |
|---|---|
| **Valid input — golden fixture** | Correct output count; correct field mapping on ≥3 specific items; no thrown errors. |
| **Invalid / malformed input** | `{{VALIDATE_METHOD}}()` returns `valid: false` with non-empty `errors`; `{{PROCESS_METHOD}}()` returns `[]` without throwing. |
| **Empty input** | Structurally valid, zero items → `valid: true`; `{{PROCESS_METHOD}}()` returns `[]`. |
| **Determinism / dedup stability** | `{{PROCESS_METHOD}}()` twice on one fixture → identical set of identity keys. |
| **No throw on one bad item** | One malformed item among valid ones → valid items returned, bad one skipped, no exception. |
| **{{SECURITY_FIXTURE_ROW}}** | {{SECURITY_FIXTURE_ASSERTION}} (full criteria in {{NFR}} {{SAFETY_NFR_REFS}}). |

---

## 8. Adding a new {{EXTENSION_POINT}} — checklist

<!-- Keel guidance: the step-by-step a contributor follows. Keep it to the loop; the
     interface detail is §2. End with the doc-sync step so the registry and the docs
     stay in agreement (the CLAUDE.md / docs-README invariant). -->

1. Create the {{EXTENSION_POINT}} directory ({{IMPL_FILE}}, tests, fixtures).
2. Implement `{{INTERFACE_NAME}}` (§2) honouring every rule.
3. Self-register with the {{REGISTRY}} (§6) and import it at startup.
4. Write the universal test suite (§7) plus any {{EXTENSION_POINT}}-specific cases, with golden fixtures.
5. Update the docs: add a row to `{{EXTENSION_SPEC}}` and to the `docs/README` index; add the routing key to any shared enum.

---

*End of {{EXTENSION_SPEC}} v{{VERSION}}*
