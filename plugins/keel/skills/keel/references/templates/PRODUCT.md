<!--
  Keel template — PRODUCT.md (impeccable product context)
  PURPOSE: The context file impeccable reads to understand the product. Required for
           /impeccable to work without prompting on first use.
  REGISTER: 'brand' = landing page, marketing site, portfolio, campaign page (design IS the
            product). 'product' = app UI, dashboard, admin tool, widget (design SERVES the
            product). Choose by surface: if someone visits the URL to learn about/buy the
            product, it's brand; if they log in to use it, it's product.
  FILLED BY: Keel from the Designer round. Update whenever register, users, or design
             direction changes. Delete this comment block when the file is filled.
-->
---
register: {{brand|product}}
---

# {{PROJECT_NAME}}

{{ONE_LINE_DESCRIPTION — from BRD.md}}

## Who uses it
{{TARGET_USER_PERSONAS — 2–3 bullet points, drawn from PRD.md personas}}

## What it does
{{CORE_VALUE — 3–5 functional bullets}}

## Design direction
{{DESIGN_DIRECTION — from Designer round: 3 adjectives, brand story, any visual references or anti-references}}

## Register rationale
{{Why brand vs product: what the user does when they arrive at this surface and what that means for design priorities}}

## Browser support
{{BROWSER_SUPPORT_POLICY — e.g. "Baseline Widely Available features only; no polyfills; degrade gracefully for older browsers" — copy from DESIGN.md §12.2}}
