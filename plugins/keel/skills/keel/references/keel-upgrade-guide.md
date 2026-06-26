# Keel Upgrade Guide — per-doc audit checklist

Reference for Phase U2 (Audit) in the keel upgrade command.
For each doc type, the checklist below defines what a fully current keel-generated doc must contain.
Use it to diff existing docs against current keel standards and classify each gap.

---

## Document inventory

| Doc | Required for | Critical if missing |
|---|---|---|
| BRD.md | All projects | ✓ |
| PRD.md | All projects | ✓ |
| ARCHITECTURE.md | All projects | ✓ |
| ADR.md | All projects | ✓ |
| NFR.md | All projects | ✓ |
| ENGINEERING_DESIGN.md | All projects | ✓ |
| IMPLEMENTATION_PLAN.md | All projects | ✓ |
| COMMANDS.md | All projects | ✓ |
| RUNBOOK.md | Production systems | ✓ for prod |
| CLAUDE.md | All projects | ✓ |
| DESIGN.md | UI projects | ✓ for UI |
| PRODUCT.md | UI + impeccable | Critical for UI with skills |
| .keel/meta.json | All projects | Optional |
| .claude/workflows/doc-sync.js | All projects | Important |
| .claude/workflows/phase-*.js | All projects | Important |
| .claude/hooks/modern-web-guidance-hook.mjs | UI projects | Important |
| .claude/settings.json with PostToolUse hooks | UI projects | Important |
| skills-lock.json | All projects | Optional |

---

## Per-doc audit checklist

### CLAUDE.md

Required sections (check by heading presence):
- [ ] Current status (2 lines max: last completed + now)
- [ ] Quick orientation (table: path → purpose)
- [ ] Git & working workflow (mandatory — the build loop)
  - [ ] References `.claude/workflows/phase-N-<slug>.js` scripts ← new in v0.3+
  - [ ] Has doc-sync step (run doc-sync.js before every merge) ← new in v0.3+
  - [ ] Has decisions/ADR capture step ← new in v0.3+
- [ ] Working agreements (conventional commits, branch per feature)
- [ ] Active skills *(UI projects only — new in v0.3+)*
  - [ ] impeccable section with command quick-reference table
  - [ ] modern-web-guidance section with 3-function usage

Outdated indicators → gap category:
- "Git workflow" section present but no workflow script references → OUTDATED_CONVENTION (Important)
- No doc-sync step in the workflow section → MISSING_FEATURE (Important)
- No Active skills section in a UI project → MISSING_FEATURE (Important)
- Active skills section present but only lists "audit" command → OUTDATED_CONVENTION (Important)

---

### IMPLEMENTATION_PLAN.md

Required sections:
- [ ] Non-negotiables block (must appear before Phase 0)
- [ ] Standing rules (check it has 5 bullets, not the old 4):
  - [ ] Workflow-first bullet (references phase scripts + worktrees) ← new in v0.3+
  - [ ] Tests-with-code bullet
  - [ ] Doc sync mandatory before merge bullet ← new in v0.3+
  - [ ] Decisions captured without fail bullet (ADR before merge) ← new in v0.3+
  - [ ] Definition of done bullet (includes doc-sync commit)
- [ ] Phase status table (columns: Phase, Description, Status, Last update)
- [ ] Per phase block:
  - [ ] Scope items
  - [ ] Tests
  - [ ] Exit gates
    - [ ] `/impeccable audit` gate for UI phases ← new in v0.3+
    - [ ] modern-web-guidance search requirement for new UI patterns ← new in v0.3+
    - [ ] Doc-sync gate bullet ← new in v0.3+
  - [ ] `Workflow:` line referencing the phase script ← new in v0.3+
- [ ] Deferred items table ← new in v0.3+
- [ ] Workflow scripts index table ← new in v0.3+

Outdated indicators:
- Old 4-bullet standing rules (no workflow-first) → OUTDATED_CONVENTION (Critical)
- Standing rules present but no doc-sync bullet → MISSING_FEATURE (Important)
- Phase blocks with no exit gate for impeccable audit (UI project) → MISSING_FEATURE (Important)
- No deferred items table → MISSING_FEATURE (Important)
- No workflow scripts index → MISSING_FEATURE (Important)
- Phase blocks with no "Workflow:" line → MISSING_FEATURE (Important)

---

### DESIGN.md

Required sections §1–§12 (check by heading):
- [ ] §1 Design Language (principles numbered, voice & tone)
- [ ] §2 Brand (§2.1 identity, §2.2 colour palette with token table, §2.3 typography)
- [ ] §3 Design Tokens (3-tier architecture: primitive → semantic → component)
- [ ] §4 Atoms (component table with all states listed)
- [ ] §5 Molecules
- [ ] §6 Organisms & UX Patterns (per-flow sub-sections, failure ladder, latency etiquette)
- [ ] §7 Responsiveness (breakpoints, per-surface adaptation table)
- [ ] §8 Multi-Interface Strategy (only if multi-surface; omit otherwise)
- [ ] §9 Trust & Clarity UX Patterns
- [ ] §10 Accessibility (WCAG 2.2 AA, contrast table)
- [ ] §11 Implementation Notes (stack, component DoD, governance)
- [ ] §12 Skill Integration ← new in v0.3+
  - [ ] §12.1 impeccable: 24-row lifecycle command table (all 23 commands mapped)
  - [ ] §12.2 modern-web-guidance: all 3 functions with usage table + 11-row query guide

Outdated indicators:
- §12 absent entirely → MISSING_FEATURE (Important for UI + skills opted-in)
- §12 present but ≤ 8 command rows (old minimal version) → OUTDATED_CONVENTION (Important)
- §12.1 has no "zero-tolerance anti-patterns" list → MISSING_FEATURE (Important)
- §12.2 only mentions `search`, not `retrieve` or `list` → OUTDATED_CONVENTION (Important)
- No browser support policy placeholder in §12.2 → MISSING_FEATURE (Optional)

---

### ARCHITECTURE.md

Required sections:
- [ ] Context diagram (trust boundary, external systems, data flows)
- [ ] Component map (internal modules with responsibilities)
- [ ] Data model overview (primary entities and relationships)
- [ ] Decision ledger (cross-references to ADR.md by number)
- [ ] Non-negotiables (security/isolation rules with no exceptions)
- [ ] Scaling model (bottlenecks, scaling levers)

No new keel v0.3 features to add — check for:
- [ ] ADR cross-references are present (not just "see ADR") → gap: MISSING_SECTION (Important) if absent
- [ ] Non-negotiables section present → gap: MISSING_SECTION (Critical) if absent

---

### ADR.md

Required:
- [ ] At least one ADR entry if any decisions were made during generation
- [ ] Each entry: Context | Decision | Consequences | Revisit trigger
- [ ] No `[NEEDS DECISION]` markers in other docs that map to unresolved ADRs

Outdated indicators:
- Entries present but missing "Revisit trigger" → MISSING_SECTION (Optional)
- Other docs have `[NEEDS DECISION]` with no corresponding ADR → UNFILLED_PLACEHOLDER (Important)

---

### PRODUCT.md (UI projects with impeccable)

Required:
- [ ] YAML frontmatter: `register: brand` or `register: product`
- [ ] One-line description
- [ ] "Who uses it" section (target personas)
- [ ] "What it does" section (core value)
- [ ] "Design direction" section
- [ ] "Browser support" section

Missing PRODUCT.md entirely in a UI project where impeccable is or will be installed → Critical.
impeccable's hook fires on every UI edit but can't run meaningfully without PRODUCT.md.

---

### Workflow scripts (.claude/workflows/)

Check:
- [ ] `doc-sync.js` present → MISSING_FEATURE (Important) if absent
- [ ] At least one `phase-N-*.js` for each ✅ phase in IMPLEMENTATION_PLAN → MISSING_FEATURE (Important)
- [ ] `README.md` present → MISSING_FEATURE (Optional)

---

### Skill files

If UI project:
- [ ] `.claude/skills/impeccable/` directory exists → gap: MISSING_SKILL (Important) if absent
- [ ] `.agents/skills/modern-web-guidance/` or equivalent exists → MISSING_SKILL (Important) if absent
- [ ] `.claude/settings.json` has PostToolUse hook entries for both skills → MISSING_SKILL (Important)
- [ ] `.claude/hooks/modern-web-guidance-hook.mjs` exists → MISSING_SKILL (Important)
- [ ] `skills-lock.json` has both entries → MISSING_SKILL (Optional)
- [ ] `.impeccable/config.json` exists → MISSING_SKILL (Optional)

---

## Gap severity reference

| Situation | Severity |
|---|---|
| Core doc missing entirely | Critical |
| ENGINEERING_DESIGN non-negotiables section missing | Critical |
| PRODUCT.md missing in UI project with skills opted-in | Critical |
| Old 4-bullet standing rules (no workflow-first, no doc-sync) | Critical |
| DESIGN.md §12 missing or outdated (< 15 rows) | Important |
| IMPLEMENTATION_PLAN missing doc-sync exit gate per phase | Important |
| IMPLEMENTATION_PLAN missing deferred items table | Important |
| IMPLEMENTATION_PLAN missing Workflow: line per phase | Important |
| Phase workflow scripts missing from .claude/workflows/ | Important |
| CLAUDE.md Active skills section missing (UI project) | Important |
| Skill files (impeccable/modern-web-guidance) not installed (UI) | Important |
| Unfilled `{{PLACEHOLDER}}` or `[NEEDS DECISION]` in any doc | Important |
| Missing cross-references between docs | Optional |
| Optional sections absent with valid reason | Optional |
| Deferred items table missing | Optional |
| .keel/meta.json missing | Optional |

---

## How to apply updates (Phase U4 rules)

1. **Surgical only.** Add missing sections, update outdated blocks, append new features.
   Preserve all user-written content. Never delete what exists unless replacing an outdated block.

2. **Block replacement.** These sections are safe to replace entirely when outdated:
   - IMPLEMENTATION_PLAN standing rules block (bounded, self-contained)
   - DESIGN.md §12 (bounded: from `## 12.` to `*End of DESIGN.md*`)
   - CLAUDE.md git workflow section (bounded by heading)

3. **Appending.** These sections are added at the end of the doc when absent:
   - DESIGN.md §12 (before the `*End of DESIGN.md*` line)
   - IMPLEMENTATION_PLAN deferred items table + workflow scripts index (before `*End of*` line)
   - CLAUDE.md Active skills section (at end of file)

4. **Placeholder fill.** After every edit, grep the modified doc for `{{[A-Z_]+}}` and fill
   each from project context established during this session. Report any that couldn't be filled.

5. **Skill installation.** Follow the FE skill integration steps in the main keel SKILL.md Phase 3.
   Merge hook entries into existing `.claude/settings.json` rather than overwriting.
   Never delete existing hook entries — append to the PostToolUse array.

6. **Write .keel/meta.json.** After all updates, create or update this file.
