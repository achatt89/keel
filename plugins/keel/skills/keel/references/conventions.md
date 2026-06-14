# House style & conventions

Apply these across every generated document so the suite reads as one coherent system.

## Voice & formatting

- **Reference material, not narrative.** Terse, scannable, imperative. The reader is looking
  something up, not reading a story.
- **Tables over prose** for anything enumerable: requirements, risks, components, decisions,
  env vars, metrics. Bold headers; terse cells; full prose lives in surrounding sections.
- **One fact, one home.** State each fact in exactly one document; reference it elsewhere. Never
  copy-paste a requirement, decision, or threshold into two docs.
- **Section numbering.** Use hierarchical `§` numbering for docs that get cross-referenced by
  section (ARCHITECTURE, LLD, NFR): `## 1. …`, `### 1.2 …`. Cross-reference as `ARCHITECTURE.md §5`.
- **Active voice, present tense.** "The worker validates the URL," not "URLs will be validated."

## ID conventions

Each document **owns** an ID namespace. IDs are stable once assigned — never renumber; retire with
a tombstone if needed. Use a consistent width (zero-pad: `REQ-001`, not `REQ-1`).

| Namespace | Owner doc | Example |
|---|---|---|
| `BO-xx` | BRD | Business objective |
| `<GROUP>-xxx` | BRD | Requirement, grouped by outcome (e.g. `AUTH-001`, `SEC-003`) |
| `CON-xxx` | BRD | Constraint |
| `A-xx` | BRD | Assumption |
| `RSK-xxx` | BRD | Risk (mirrored in ARCHITECTURE accepted-risk register) |
| `F-xx` | PRD | Feature |
| `P-xx` | ARCHITECTURE | Architecture principle |
| `ADR-xxx` | ADR | Decision record |
| `NFR-<AREA>-xxx` | NFR | Non-functional requirement (`NFR-SEC-001`, `NFR-PERF-002`) |
| `THR-xxx` | THREAT_MODEL | Threat |
| `C0`–`C3` | ENGINEERING_DESIGN | Data classification tiers |
| `Phase 0..N` | IMPLEMENTATION_PLAN | Build phase |

Choose requirement group prefixes from the project's own domain (3–4 uppercase letters per outcome
area). Define them once in the BRD and reuse everywhere.

## Cross-references

- **By ID** for requirements/decisions/features: "implements `AUTH-002`", "see `ADR-014`".
- **By doc + section** for structural references: "see `ARCHITECTURE.md §6`", "`LLD.md §3`".
- **By phase** for build sequencing: "delivered in `IMPLEMENTATION_PLAN` Phase 3".
- When a topic spans abstraction levels, reference in order: BRD (*what/why*) → ARCHITECTURE
  (*how, component*) → LLD (*how, module/type*) → ADR (*why this way*) → NFR (*how verified*) →
  RUNBOOK (*how operated*).
- Prefer relative links so the suite is portable: `[ADR-014](./ADR.md#adr-014)`.

## Status markers

Use a consistent set across all docs:

- `✅` complete / accepted / done · `🔄` in progress · `⬜` not started · `⚠️` superseded /
  needs attention · `[NEEDS DECISION]` open question with options surfaced · `[ASSUMPTION]` a stated
  assumption to validate.
- Priorities: `Must` / `Should` / `Could` / `Won't` (MoSCoW) in requirement and feature tables.

## Immutability & change rules

- **Accepted records are immutable.** Once an ADR (or a numbered requirement) is accepted, don't
  edit its meaning. Supersede it: write a new ADR that references and replaces the old, and mark the
  old `⚠️ Superseded by ADR-xxx`.
- **Append-only registers** (risk register, decision log) grow downward; entries aren't deleted,
  they're marked resolved/retired with a date.
- **Living docs** (`CLAUDE.md` current-status, `IMPLEMENTATION_PLAN` phase status, `COMMANDS`,
  `RUNBOOK`) are updated freely as the build progresses — that's their job.

## Traceability checklist (run before handoff)

- [ ] Every requirement has a unique ID and at least one downstream reference (feature, component,
      or phase).
- [ ] Every ADR has context, options, decision, consequences, and a revisit trigger.
- [ ] Every NFR has a target *and* a verification method.
- [ ] Every cross-reference resolves to a real ID / section / file.
- [ ] `CLAUDE.md`'s document map lists exactly the files that exist on disk — no more, no less.
- [ ] No two documents state the same fact (one is the home; the rest reference it).
- [ ] Every `[NEEDS DECISION]` is surfaced in the handoff summary.

## Honesty rules for generation

- Do **not** invent specifics the interview didn't establish (numbers, SLAs, vendor names, scale
  figures). Use `[NEEDS DECISION]` / `[ASSUMPTION]` markers instead.
- If a section would be empty because the project doesn't warrant it, omit the section (and the
  doc) rather than padding it.
- If the interview revealed a contradiction or a risk, it belongs in the docs (risk register,
  open decision) — not smoothed over.
