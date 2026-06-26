<!--
  Keel template — DESIGN.md (UX/UI design system)
  WHAT: The authoritative design reference for every user-facing surface —
        design language, brand, tokens, component inventory, responsiveness,
        multi-interface rules, trust/clarity UX patterns, accessibility floor.
  INCLUDE WHEN: the project has a UI. Skip entirely for headless / API-only /
        CLI-only / library tools (adaptivity trigger: document-catalog "DESIGN.md — if UI").
  DEPENDS ON: PRD.md (personas, flows, roadmap); Designer interview round.
  OWNS: design tokens and component names (referenced by PRD flows + front-end work).
        No requirement/decision IDs.
  CROSS-REF: by doc + section — "see PRD.md §<n>", "ADR-<nnn>".
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — UX/UI Design System

**Version:** {{VERSION}}
**Status:** {{STATUS}}
**References:** PRD.md ({{PRD_SECTIONS}}), BRD.md, IMPLEMENTATION_PLAN.md ({{UI_PHASE}})
**Scope note:** brand values, palette, and type in §2–§3 are the working proposal — changing them is a token-level edit, not a redesign. Everything from §4 onward is structural and survives a re-skin.

---

<!-- Keel guidance: §1 — 3–6 numbered principles that drive every decision. Each is a
     rule a reviewer could reject a PR against, not an adjective. End with voice & tone. -->

## 1. Design Language

{{ONE_LINE_EXPERIENCE_GOAL — e.g. "a calm, trustworthy archive that answers".}}

1. **{{PRINCIPLE_1}}** — {{what it forces in the UI}}.
2. **{{PRINCIPLE_2}}** — {{...}}.
3. **{{PRINCIPLE_3}}** — {{...}}.

**Voice & tone:** {{2–3 sentences: register, person, how numbers/errors/empty states read}}.

---

## 2. Brand

<!-- Keel guidance: §2.1 identity, §2.2 colour (hex placeholders, role per token),
     §2.3 type. Every colour has ONE role — state it. Note dark-theme stance. -->

### 2.1 Identity
- **Name:** {{how the name is written in prose}}.
- **Wordmark / logomark:** {{form, min size, the one place the brand decorates}}.
- **Brand idea:** *"{{one line}}"*.

### 2.2 Colour palette

Primary — **{{PRIMARY_NAME}}**:

| Token | Hex | Use |
|---|---|---|
| `{{primary-50}}`  | `{{#HEX}}` | tinted fills |
| `{{primary-500}}` | `{{#HEX}}` | links / secondary action |
| `{{primary-600}}` | `{{#HEX}}` | **primary action colour** |
| `{{primary-900}}` | `{{#HEX}}` | headings / high-emphasis text |

Accent — **{{ACCENT_NAME}}** ({{what owns it; used nowhere else}}):

| Token | Hex | Use |
|---|---|---|
| `{{accent-100}}` | `{{#HEX}}` | accent fill |
| `{{accent-500}}` | `{{#HEX}}` | accent marker |

Neutrals — **{{NEUTRAL_NAME}}** (the app surface):

| Token | Hex | Use |
|---|---|---|
| `{{neutral-0}}`   | `{{#HEX}}` | app background |
| `{{neutral-50}}`  | `{{#HEX}}` | cards / panels |
| `{{neutral-100}}` | `{{#HEX}}` | borders / dividers |
| `{{neutral-500}}` | `{{#HEX}}` | secondary text |
| `{{neutral-900}}` | `{{#HEX}}` | max-contrast text |

Semantic (fixed meanings; never repurposed):

| Token | Hex | Meaning |
|---|---|---|
| `success` | `{{#HEX}}` | success / complete |
| `warning` | `{{#HEX}}` | warning / degraded |
| `error`   | `{{#HEX}}` | error / destructive |
| `info`    | `{{#HEX}}` | info / in-progress |

> **DO / DO-NOT**

| DO | DO NOT |
|---|---|
| Use `{{primary-600}}` as the single primary-action colour | Introduce off-palette hex (PR rejection) |
| Maintain WCAG contrast (§10) for every text/background pair | Use a low-contrast tint for body text |
| Reserve the accent colour for {{its one role}} | Use more than {{N}} focal colours on one surface |

**Dark theme:** {{shipped in v1 / deferred (state which)}}. If shipped, components reference only semantic tokens (§3.1) so dark mode is a token swap, not a component fork; default follows OS.

### 2.3 Typography

| Role | Face | Notes |
|---|---|---|
| UI / body | **{{UI_FONT}}** | {{weights; tabular numerals where}} |
| {{Reading / long-form}} | **{{READING_FONT}}** | {{where used}} |
| Code / IDs | **{{MONO_FONT}}** | hashes, keys, error codes |

Type scale (rem, {{line-height}} baseline): `xs 12` · `sm 14` · `base 16` · `lg 18` · `xl 20` · `2xl 24` · `3xl 30` · `display {{N}}`. Body text never below {{N}}px.

---

## 3. Design Tokens

<!-- Keel guidance: 3-tier — components consume SEMANTIC tokens only. This is what
     makes theming and per-surface adaptation cheap. State that rule explicitly. -->

### 3.1 Token architecture
Three tiers, defined once and exported to every surface (§8.3):
1. **Primitive** — raw values: `--ds-{{primary}}-600`, `--ds-space-4`, `--ds-radius-md`.
2. **Semantic** — meaning-bearing aliases components actually consume: `--ds-surface-page`, `--ds-text-primary`, `--ds-action-primary`, `--ds-border-subtle`, `--ds-focus-ring`. **Components may reference only semantic tokens.**
3. **Component** — overridable knobs only where needed: `--ds-button-height`, `--ds-card-padding`.

### 3.2 Space, radius, elevation, motion
- **Spacing:** {{base}}px base — `1 4` · `2 8` · `3 12` · `4 16` · `6 24` · `8 32` · `12 48` · `16 64`. No off-scale values.
- **Radius:** `sm {{4}}` (inputs, chips) · `md {{8}}` (buttons, cards) · `lg {{12}}` (dialogs) · `full` (pills, avatars).
- **Elevation:** `e0` flat · `e1` card · `e2` popover · `e3` dialog. {{Dark theme expresses elevation via surface lightening.}}
- **Motion:** `fast {{120}}ms` · `base {{200}}ms` · `slow {{320}}ms`; easing `{{cubic-bezier(...)}}`. **`prefers-reduced-motion` collapses all motion to opacity-only ≤ {{80}}ms.**
- **Focus:** every interactive element shows a {{2}}px `--ds-focus-ring` on keyboard focus. Never `outline: none` without replacement.

---

## 4. Atoms

<!-- Keel guidance: the indivisible set. One responsibility each; semantic tokens
     only; every state documented (default/hover/focus/active/disabled/loading/error). -->

| Atom | Variants & rules |
|---|---|
| **Button** | `primary` · `secondary` · `ghost` · `destructive` (only inside confirmation §7). Sizes `sm {{32}} / md {{40}}`. Loading swaps label for spinner, keeps width. |
| **Input / Textarea** | single border style; error = colour + message (never colour alone). |
| **Select / Combobox** | keyboard-first. |
| **Toggle / Checkbox / Radio** | state change announced via `aria-live`. |
| **Badge** | status dot + label mapped to semantic colours. |
| **Tag / Chip** | dismissible variant for active filters. |
| **{{DOMAIN_ATOM}}** | {{the load-bearing atom unique to this product}}. |
| **Avatar / Tooltip / Kbd / Icon** | {{icon set + stroke + grid}}. |
| **ProgressBar / Spinner / Skeleton** | spinner ≤ {{400}}ms only; longer ops use ProgressBar + narrative. |

---

## 5. Molecules

<!-- Keel guidance: atoms composed into reusable behaviours. Composition → purpose. -->

| Molecule | Composition → purpose |
|---|---|
| **{{PRIMARY_INPUT}}** | {{e.g. SearchBar / QueryBar — the primary entry point}}. |
| **{{PRIMARY_OUTPUT_CARD}}** | {{the core result/content unit}}. |
| **{{STATUS_ROW}}** | id + Badge + ProgressBar + timestamps → tracker row. |
| **Toast** | transient confirmations; errors persist until dismissed. |
| **EmptyState** | illustration + one line + primary action. |
| **{{...}}** | {{...}}. |

---

## 6. Organisms & UX Patterns

<!-- Keel guidance: one sub-section per core screen/flow, each cross-referencing its
     PRD flow. Name the failure ladder and latency etiquette where they matter. -->

### 6.1 {{CORE_EXPERIENCE}} (PRD Flow {{n}})
{{Layout + behaviour. Failure ladder: {{degrade-to path}} — never {{forbidden state}}. Latency etiquette: {{skeleton immediately; first-token target; narration if > Ns}}.}}

### 6.2 {{SECONDARY_FLOW}} (PRD Flow {{n}})
{{...}}

### 6.3 Destructive-action pattern
Two-step always: (1) manifest of consequences, (2) type-to-confirm for irreversible destruction. Destructive Button variant appears only here. Completion shows a receipt where an audit reference exists.

---

## 7. Responsiveness

<!-- Keel guidance: state the stance (desktop-first / mobile-first), breakpoints, then
     a per-surface adaptation table. Keep rules at the bottom. -->

**Decision: {{desktop-first / mobile-first}}, responsive down to {{360}}px.**

Breakpoints: `sm {{640}}` · `md {{768}}` · `lg {{1024}}` · `xl {{1280}}`.

| Surface | ≥ lg | md | < md |
|---|---|---|---|
| App shell | {{nav rail + content}} | {{collapsed rail}} | {{bottom tab bar}} |
| {{Core screen}} | {{...}} | {{...}} | {{...}} |
| Dialogs | centred, max {{560}}px | same | full-screen sheets |

Rules: touch targets ≥ {{44}}px below `md`; tables collapse to stacked key-value rows; no horizontal scroll except code blocks; hover-revealed info must also be reachable by tap/focus.

---

## 8. Multi-Interface Strategy

<!-- Keel guidance: include only if there is more than one surface (web + extension +
     mobile + API/headless). Tokens/patterns shared; layout/chrome adapt. Otherwise omit. -->

One design system, {{N}} surfaces. **Tokens and patterns are shared; layout and chrome adapt.**

### 8.1 Surface decisions

| Surface | Ships | Role | Binding decisions |
|---|---|---|---|
| **{{Web app}}** | {{v1}} | primary | reference implementation |
| **{{Extension / mobile / headless}}** | {{when}} | {{role}} | {{constraints}} |

### 8.2 What may differ per surface
Layout, navigation chrome, input affordances. **What may never differ:** {{citation/consent/cost-confirmation/destructive patterns}}, semantic colour meanings, voice & tone.

### 8.3 Token distribution
Single source of truth (`{{packages/design-tokens}}`, JSON) → built by {{Style Dictionary}} into CSS custom properties + TS constants ({{+ native token files}}). A token change is one PR that propagates everywhere; hand-copied values in any surface are a defect.

---

## 9. Trust & Clarity UX Patterns

<!-- Keel guidance: product-specific UI shapes that are requirements, not preferences —
     consent, cost-before-spend, inspectability, honest status. Drop if none apply. -->

These are product requirements with UI shapes, not stylistic preferences:

1. **{{Pattern, e.g. cost before spend}}** — {{the mandatory UI step}}.
2. **{{Consent before sensitive action}}** — {{...}}.
3. **{{Inspectability}}** — {{what the user can always see/export/delete}}.
4. **Honest system status** — degraded states are labelled in-place with the semantic colour system; the UI never silently degrades.

---

## 10. Accessibility

<!-- Keel guidance: WCAG 2.2 AA is the default floor; verify in CI. Include a verified
     contrast table once real hex values are chosen. -->

WCAG 2.2 AA is the floor, verified in CI ({{axe}}) + manual screen-reader passes per release:

- Contrast ≥ 4.5:1 text, ≥ 3:1 UI components — every theme.
- Full keyboard operability; visible focus (§3.2); skip-link; roving tabindex in grids.
- Dynamic content announced via `aria-live` (`polite` status / `assertive` errors).
- Colour never carries meaning alone (dot + label; colour + icon + text).
- `prefers-reduced-motion` honoured; user font-scaling to 200% without loss.

Verified contrast (fill once hex chosen):

| Combination | Ratio | Pass |
|---|---|---|
| {{text-900 on surface-0}} | {{N:1}} | ✅ |
| {{action-600 on surface-0}} | {{N:1}} | ✅ AA |

---

## 11. Implementation Notes

<!-- Keel guidance: stack, the component definition-of-done, and governance. Keep to
     decisions already made in ADRs; mark anything open as [NEEDS DECISION]. -->

- **Stack:** {{React + TypeScript}}, {{Tailwind over CSS custom-property tokens}}, {{Radix primitives}}, {{Style Dictionary token pipeline}}. {{Storybook: adopted / deferred (state which) — ADR-<nnn>}}.
- **Definition of done for any component:** all states proven; every theme; keyboard + screen-reader pass; tokens only (no literal colours/sizes); responsive per §7.
- **Governance:** new components require a §4–§6 entry here before merge; token additions follow §3.1 tiering; per-surface deviations beyond §8.2 require recorded sign-off.

---

## 12. Skill Integration

<!-- Keel guidance: include when the project has a UI and skills integration was opted-in
     during the Designer round. These tools provide ongoing quality gates throughout the build.
     Every impeccable command and every modern-web-guidance function is lifecycle-mapped below.
     Use the command table to know WHEN to reach for each. Remove this section entirely if no
     UI or if the user skipped skills integration. -->

### 12.1 impeccable — visual quality gates (all commands, lifecycle-mapped)

**Register:** `{{brand|product}}` — see `PRODUCT.md`. *(brand = landing / marketing / portfolio — design IS the product. product = app UI / dashboard / admin / tool — design SERVES the product.)*

**Hook (automatic):** activate once with `/impeccable hooks on` in Claude Code after skill install. Fires after every UI file edit — surfaces design and a11y findings as system reminders without any manual invocation. Disable: `/impeccable hooks off`. Status: `/impeccable hooks status`.

**Full command map — use these at the specified lifecycle moment:**

| Lifecycle moment | Command | What it does |
|---|---|---|
| **Project setup (Phase 0)** | `/impeccable init` | Establish `PRODUCT.md`, `DESIGN.md`, live config, and next-step recommendations. Run once at project start. |
| **Before building any UI feature** | `/impeccable shape {{feature}}` | Plan UX/UI — document flow, key states, component contracts — before writing code. Non-optional for non-trivial features. |
| **Building a feature end-to-end** | `/impeccable craft {{feature}}` | Shape then build: full UX-to-implementation cycle with quality baked in. Use for features too large for ad-hoc building. |
| **Existing UI code, no design system** | `/impeccable document` | Reverse-engineer a `DESIGN.md` from existing code. Use when joining a project or after a rapid prototype phase. |
| **Patterns repeating across components** | `/impeccable extract {{target}}` | Pull reusable tokens and components into a design system. Run once enough components exist to see the pattern. |
| **After feature is functionally complete** | `/impeccable critique {{target}}` | UX heuristic review: information architecture, cognitive load, copy, flows, trust patterns. **Phase exit gate — run before merge.** |
| **Technical quality check (required gate)** | `/impeccable audit {{target}}` | Systematic checks: a11y (WCAG AA), performance, responsive, theming, anti-patterns. **Hard phase exit gate: no P0 or P1 findings before merge.** |
| **Design reads as bland or safe** | `/impeccable bolder {{target}}` | Amplify — more visual conviction, more identity, more signal. Use when `critique` flags "too neutral" or "too generic". |
| **Design is too loud or busy** | `/impeccable quieter {{target}}` | Reduce noise — surface hierarchy, add breathing room. Use when `critique` flags "too stimulating". |
| **UI has accumulated unnecessary complexity** | `/impeccable distill {{target}}` | Strip to essence — remove anything that doesn't earn its place. Use at end of any build sprint. |
| **Typography lacks hierarchy** | `/impeccable typeset {{target}}` | Fix type scale, line heights, letter spacing, weight contrast, readability. Run whenever heading hierarchy is unclear. |
| **Palette too flat or neutral** | `/impeccable colorize {{target}}` | Add strategic colour — one deliberate, purposeful addition. Not a palette dump. |
| **Layout or spacing feels off** | `/impeccable layout {{target}}` | Fix spacing rhythm, visual hierarchy, whitespace, alignment. Run when critique flags "things don't land". |
| **Time to add personality** | `/impeccable delight {{target}}` | Add memorable micro-interactions, motion, copy moments. Run after functional completeness — never before. |
| **Feature warrants extraordinary craft** | `/impeccable overdrive {{target}}` | Push past conventional limits — technically extraordinary visual effects. Use selectively for premium or hero moments. |
| **Adding intentional motion** | `/impeccable animate {{target}}` | Add purposeful animation — reveal, transition, feedback. Always with `prefers-reduced-motion`. Run after core UI is stable. |
| **UX copy needs work** | `/impeccable clarify {{target}}` | Improve labels, empty state copy, error messages, onboarding text. Run on any user-visible string pass. |
| **Error states / i18n / edge cases** | `/impeccable harden {{target}}` | Make production-ready: all states covered (empty, loading, error, partial), i18n, edge cases. Pre-launch gate. |
| **First-run / empty states / activation** | `/impeccable onboard {{target}}` | Design first-run flows, empty states, activation moments. Run when onboarding/activation features are built. |
| **Responsive or multi-device issues** | `/impeccable adapt {{target}}` | Fix breakpoints, touch targets (≥44px), horizontal overflow, text scaling. Run as mobile QA pass. |
| **UI performance problems** | `/impeccable optimize {{target}}` | Diagnose and fix layout thrash, expensive animations, bundle bloat, missing lazy loading. |
| **Final pass before any release** | `/impeccable polish {{target}}` | Comprehensive quality pass — a11y, perf, tokens, anti-patterns, copy, responsiveness. **Pre-launch hard gate.** |
| **Active visual iteration in browser** | `/impeccable live` | Pick elements in the browser and generate visual alternatives in real time. Use during fast design iteration. |
| **Suppress an intentional finding** | `/impeccable hooks ignore-value {{rule}} {{value}} --shared --reason "..."  ` | Record a known intentional deviation. Never suppress without the user explicitly confirming. |

**Quality protocol — mandatory sequence per UI feature:**

1. `shape` — plan before coding
2. Build → tests alongside code (hook fires automatically on each edit)
3. `critique` — UX review when complete
4. `audit` — technical pass; no P0/P1 before merge
5. `polish` — final pass before shipping to users

**Pre-launch hardening sequence (final phase, all required):**

`harden` → `adapt` → `optimize` → `onboard` → `animate` → `polish` → merge.

**Zero-tolerance anti-patterns (auto-detected by hook, PR-blocking):**
Gradient text (`background-clip: text`) · glassmorphism as default · hero-metric template (big number + small label) · identical card grids (icon + heading + body, repeated) · side-stripe borders (>1px coloured left/right border on cards) · tiny uppercase tracked eyebrows above every section · numbered section scaffolding (01/02/03 on every section) · text overflowing its container.

---

### 12.2 modern-web-guidance — modern web platform patterns (all three functions)

**Trigger (automatic):** `.claude/hooks/modern-web-guidance-hook.mjs` fires after every FE file edit (`.html`, `.css`, `.js`, `.ts`, `.tsx`, `.jsx`, `.vue`, `.svelte`, `.astro`, `.scss`) and reminds to check before implementing new UI patterns.

**Three functions — use all three in sequence:**

| Step | Function | When | Command |
|---|---|---|---|
| 1 | `search` | **Before implementing any new UI pattern** — find if a modern native approach exists | `npx -y modern-web-guidance@latest search "<action-oriented query>"` |
| 2 | `retrieve` | After search returns a relevant ID — get the full implementation guide and code | `npx -y modern-web-guidance@latest retrieve "<id>"` *(comma-separate multiple IDs)* |
| 3 | `list` | When search returns vague or no results — browse all guides by category | `npx -y modern-web-guidance@latest list` |

**How to query (always action-oriented — describe WHAT you want to achieve, not the technology):**

| Intent | Query |
|---|---|
| Add a modal dialog | `"add a modal dialog"` → native `<dialog>` guide |
| Animate on scroll | `"animate elements when they scroll into view"` → Scroll-driven animations |
| Popover / tooltip | `"create a tooltip or popover"` → Popover API |
| Optimise LCP image | `"optimise loading priority of hero image"` → Fetch Priority / preload |
| Form with autofill | `"build a sign-in or sign-up form with autofill"` → Autofill guides |
| Page transitions | `"animate between pages or views"` → View Transitions API |
| Responsive without breakpoints | `"responsive layout without media queries"` → Container Queries |
| Style based on child | `"style parent based on child state"` → `:has()` selector guide |
| Lazy load off-screen content | `"defer rendering of off-screen sections"` → `content-visibility` guide |
| Custom select | `"style a custom select menu"` → Styled select guide |
| Anchor tooltip | `"position a tooltip relative to its anchor"` → CSS Anchor Positioning |

**Mandatory trigger points — always search before implementing:**
Modals or dialogs · popovers or tooltips · scroll-triggered animations · parallax · page/view transitions · form autofill · image loading priority · CSS-only responsive grids · custom selects or pickers · backdrop filters or glassmorphism effects · anchor positioning · `content-visibility` deferral · any "I'd normally reach for a library for this" moment.

**Browser support policy for this project:**
`{{BROWSER_SUPPORT_POLICY}}`
*(Fill from the Delivery/Ops round. Example: "Baseline Widely Available only; no polyfills; degrade gracefully." State once here — future agents never need to re-ask. This is the standing policy for all UI work.)*

**Key categories relevant to this project:** `{{CSS | forms | performance | scroll-motion | privacy | security — select by surface type}}`

---

*End of DESIGN.md — {{PROJECT_NAME}}*
