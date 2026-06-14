# Interview personas & question banks

This is the heart of Keel's Phase 1. Conduct the brainstorm as **staged rounds**, each fronted by
a named persona. The question banks below are a **coverage checklist** — the things that must be
understood before the matching documents can be written well. They are NOT a script to read aloud.

## How to run a round

- **Announce the hat.** *"Switching to my Architect hat for a few questions —"*. The persona framing
  helps the user shift register and signals what kind of answer you want.
- **Ask 2–5 questions per turn**, grouped by theme. Use `AskUserQuestion` for crisp multiple-choice
  decisions (stack, tier, pricing model, build-vs-buy). Use open prose questions for the
  generative, exploratory parts (the problem story, the user's day, the dream).
- **Adapt relentlessly.** Skip anything already answered. Drill into anything vague with a
  follow-up. Chase contradictions. If an answer opens a more important door, walk through it.
- **Close every round with a synthesis.** 3–6 bullets of "here's what I heard," plus any
  assumptions you're now making and any flags you're raising. Get a thumbs-up before the next
  persona takes over.
- **Scale to the ambition tier** (set in Phase 0):
  - *Prototype/weekend:* Business Analyst (light) + Architect (light). One or two rounds total.
  - *Product/MVP:* + Product Manager + Designer (if UI) + Delivery/Ops (light).
  - *Platform/regulated:* the full panel, Security/Compliance in depth.

The persona's question bank maps to the documents it feeds — noted per persona so you know why each
answer matters.

---

## 1. Business Analyst — *the problem & the market*

**Goal:** Establish that there is a real, valuable problem worth solving, who has it, and what
winning looks like. **Feeds:** BRD, parts of PRD, almanac positioning/GTM.

- **Problem:** What's the problem, in one sentence? Whose problem is it? How do they suffer today —
  what's the painful status quo (tools, workarounds, cost in time/money/risk)?
- **Why now:** What changed that makes this solvable or urgent now? Why hasn't it been solved?
- **Who:** Who exactly feels this most acutely (the beachhead), and who else later? Who *pays* —
  is the payer the user?
- **Value & money:** What's the value created? What's the business model (subscription, usage,
  one-time, free/OSS, internal tool)? If revenue matters, what's the rough pricing intuition?
- **Competition:** Who/what do people use instead (including "a spreadsheet" / "nothing")? What's
  your wedge — why you, why now, what's genuinely different vs. merely better?
- **Objectives & metrics:** What are the top 3–5 business objectives? How would you *measure*
  success in 6–12 months (concrete numbers, not "users love it")?
- **Constraints:** Hard constraints — budget, deadline, team size, tech you must/can't use,
  existing systems to integrate, a cost ceiling?
- **Risks:** What's most likely to kill this — market, technical, legal, execution? What are you
  knowingly betting on being true (assumptions)?
- **Scope edge:** What is explicitly *not* part of this, at least for v1?

## 2. Product Manager — *the users & the cut*

**Goal:** Turn the problem into concrete users, journeys, and a defensible MVP boundary.
**Feeds:** PRD, DESIGN (personas/flows), IMPLEMENTATION_PLAN scope.

- **Personas:** Who are the 2–3 primary user personas? For each: their goal, their context, their
  sophistication, what success feels like *to them*.
- **Jobs & journeys:** Walk me through the single most important user journey end to end — from
  trigger to outcome. Where does it start? What's the "aha" moment? What's the happy path?
- **Core capabilities:** What are the handful of capabilities the product *must* have to deliver
  the core value? Rank them.
- **MVP cut:** If you could ship only one slice in 4–6 weeks that a real user would pay for / rely
  on, what's in it? What gets deferred to v1.5 / v2 — and why is each deferral safe?
- **Prioritization:** For the capability list, what's Must-have vs Should-have vs Could-have for
  v1? (MoSCoW.)
- **Non-goals:** What will people *ask* for that you will deliberately say no to in v1, and why?
- **Acceptance:** For the top features, what does "done and working correctly" look like —
  concretely enough to test?
- **Success (product):** What product metrics tell you v1 is working (activation, retention, a
  key action per user)?

## 3. Architect / Engineering Lead — *feasibility & shape*

**Goal:** Establish the technical shape, the hard bets, and the data/trust model. **Feeds:**
ENGINEERING_DESIGN, ARCHITECTURE, HLD, LLD, ADR, parts of NFR.

- **Stack:** Any stack already decided or strongly preferred (language, framework, DB, host)? Team
  expertise? Reasons (familiarity, hiring, ecosystem, performance)? Use `AskUserQuestion` to pin
  the big ones if open.
- **Shape:** Roughly, what are the major components/services? Monolith vs services vs serverless —
  and *why* for this project at this size?
- **Data model:** What are the core entities and their relationships? What's the most important /
  highest-volume data? Any data that's expensive, regulated, or hard to get?
- **Integrations:** What external systems/APIs/models must it talk to? Which are critical-path?
  What's the failure mode if each is down? Any auth/token storage implications?
- **The hard bets:** What are the 2–3 genuinely hard or risky technical decisions (the ones that,
  if wrong, force a rewrite)? These become ADRs.
- **State & scale:** Expected scale at launch and at "success" (users, data volume, request rate)?
  What has to stay fast (latency-sensitive paths)? What can be async/queued?
- **AI/LLM (if any):** Which model(s) and why? What's the prompt/guardrail strategy? How is cost
  and usage tracked? (If it's an LLM app, default to the latest Claude models unless the user has a
  reason otherwise — and consult the `claude-api` skill for current model IDs/pricing.)
- **Build vs buy:** What will you build vs. adopt (auth, payments, queue, vector store, search)?
- **Non-negotiables:** Are there invariants that must hold everywhere (e.g. every query scoped to a
  tenant, every write audited, no secrets in code)? These become enforced rules.

## 4. Security / Compliance — *risk & data* *(include for anything holding user data)*

**Goal:** Surface data sensitivity, tenancy, auth, regulatory exposure, and the threat model.
**Feeds:** NFR (security), COMPLIANCE, THREAT_MODEL, ARCHITECTURE (trust boundaries), ADRs.

- **Data classification:** What data does the system hold? Sort it: operational/metadata vs user
  content vs preferences vs sensitive (PII, financial, health, credentials). Which is the most
  sensitive thing you hold?
- **Tenancy & isolation:** Single-user, multi-user, or multi-tenant? If multi-tenant, how strong
  must isolation be, and what's the blast radius of a cross-tenant leak?
- **Auth & access:** How do users authenticate? What roles/permissions exist? Who can see/do what?
  Any admin/superuser powers, and how are they constrained and audited?
- **Regulatory exposure:** Any regime in play — GDPR, CCPA, HIPAA, PCI, SOC2, age-gating? Which
  jurisdictions/users? What rights must you honor (access, export, erasure, consent)?
- **Trust boundaries:** Where does untrusted input enter (user uploads, URLs, webhooks, LLM
  output)? What validation guards each boundary?
- **Threats:** What's the attacker's prize? Top threats — data exfiltration, injection (incl.
  prompt injection), SSRF, abuse/cost-bombing, account takeover? What's currently unmitigated?
- **Retention & deletion:** How long is data kept? How is it deleted on request? Any append-only /
  audit data that must never be mutated?
- **Accepted risk:** What residual risks are you knowingly accepting for v1, with what trigger to
  revisit?

## 5. Designer — *experience & brand* *(include for anything with a UI)*

**Goal:** Establish surfaces, key flows, brand feel, and accessibility floor. **Feeds:** DESIGN,
PRD (UX flows), almanac website-copy.

- **Surfaces:** What interfaces exist — web app, mobile, browser extension, CLI, API, voice? Which
  is primary for v1?
- **Design language:** Three adjectives for how it should feel. Any brand that exists (name,
  colors, logo, voice) or is this greenfield? Any products whose feel you admire/avoid?
- **Key screens & flows:** What are the 3–5 screens/flows that matter most? What's the one moment
  the design has to nail?
- **Tone of voice:** How does the product talk — to users, in empty states, in errors? Formal,
  warm, terse, playful?
- **Accessibility & responsiveness:** Accessibility floor (assume WCAG 2.2 AA unless told
  otherwise)? Which devices/breakpoints matter? Desktop-first or mobile-first?
- **Trust/clarity patterns:** Any moments that need special care — consent, cost-before-spend,
  destructive actions, showing sources/citations, honest loading/error states?

## 6. Delivery / Ops — *build & run* *(include for anything that will be deployed & operated)*

**Goal:** Establish phasing, environments, deployment, and operability. **Feeds:**
IMPLEMENTATION_PLAN, COMMANDS, RUNBOOK, NFR (availability/observability).

- **Phasing:** What's the natural build order? What must exist before anything else is safe to
  build (foundations, guardrails)? What are the phase boundaries and exit criteria?
- **Team & cadence:** Who's building (solo, small team, with Claude Code)? Any parallel work
  streams? How do you want to track progress?
- **Environments:** Local / staging / production? How does a developer run it locally? What's the
  minimal dev setup?
- **Deploy:** Where does it run (which host/platform)? How does code get to production — CI/CD,
  manual, scripts? How do you roll back?
- **Observability:** How will you know it's healthy — metrics, logs, traces, alerts? What are the
  SLOs that matter? What's the first thing you'd check in an incident?
- **Operations:** Routine ops (backups, migrations, key rotation, scaling)? Likely incident types
  and their first-response steps?
- **Definition of done:** What gates must be green before a change ships (tests, lint, security
  checks, audit)?

---

## Interview anti-patterns to avoid

- **The firehose:** dumping every question at once. Stage them; let answers steer.
- **The script-reader:** asking questions whose answers you already have. Adapt.
- **The stenographer:** writing down whatever you're told without challenge. If an assumption is
  shaky or a scope is unrealistic, push back — that's the value.
- **The over-scoper:** dragging a weekend prototype through a four-persona compliance interview.
  Match depth to tier.
- **Premature generation:** writing docs before you can describe the product, its users, its shape,
  and its risks without guessing. If you're guessing, ask another question.
