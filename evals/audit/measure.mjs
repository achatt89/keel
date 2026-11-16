#!/usr/bin/env node
// Keel context audit v0: measures what a Keel project and the Keel skill put into an agent's context.
// Read only. No dependencies.
//   node evals/audit/measure.mjs fresh              template-derived "fresh project" always-loaded bytes
//   node evals/audit/measure.mjs project <dir>...   always-loaded bytes of real projects + doc bytes by tier
//   node evals/audit/measure.mjs skill              SKILL.md + references sizes
//   node evals/audit/measure.mjs ritual             ritual-wording hits in the templates (file:line)
//   node evals/audit/measure.mjs --self-test
// Tokens are an ESTIMATE: bytes / 4 (ponytail: no tokenizer; swap in the count_tokens API if exact numbers matter).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative, basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const SKILL = join(REPO, 'plugins/keel/skills/keel')
const TPL = join(SKILL, 'references/templates')

const read = p => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const bytes = s => Buffer.byteLength(s)
const tok = b => Math.round(b / 4)
const stripComments = s => s.replace(/<!--[\s\S]*?-->\n?/g, '')
const walk = d => !existsSync(d) ? [] : readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])

// Tier of a project doc by file name (agents/keel-mvvwe9nj/reports/keel-doc-tiers.md).
const EXEC = /^(AGENTS|CLAUDE|COMMANDS|IMPLEMENTATION_PLAN|RUNBOOK|DEPLOYMENT|PRODUCT|README)(\b|[._-])/i
export const tierOf = p => /\/\.claude\/(agents|workflows|rules)\//.test(p) || /\/docs\/adr\/README\.md$/.test(p)
  || EXEC.test(basename(p)) || /\/docs\/(commands|implementation_plan|runbook|deployment)\//i.test(p) ? 'execution' : 'record'

// CLAUDE.md with @imports resolved (Claude Code follows @path imports, max 5 hops), counted once each.
function claudeChain(dir) {
  const seen = new Map()
  const visit = (p, depth) => {
    if (seen.has(p) || depth > 5 || !existsSync(p)) return
    const s = read(p); seen.set(p, s)
    for (const m of s.replace(/```[\s\S]*?```/g, '').matchAll(/(?:^|\s)@([\w./-]+\.md)\b/g)) visit(resolve(dirname(p), m[1]), depth + 1)
  }
  for (const f of ['CLAUDE.md', '.claude/CLAUDE.md', 'CLAUDE.local.md']) visit(join(dir, f), 0)
  return seen
}

const frontmatter = s => (s.match(/^---\n([\s\S]*?)\n---/) || [, ''])[1]

// Everything Claude Code puts in context at session start for this project (project-level only).
export function alwaysLoaded(dir) {
  const rows = []
  for (const [p, s] of claudeChain(dir)) rows.push({ what: relative(dir, p), kind: 'CLAUDE.md chain', raw: bytes(s), stripped: bytes(stripComments(s)) })
  for (const p of walk(join(dir, '.claude/rules')).filter(p => p.endsWith('.md'))) {
    const s = read(p), scoped = /^paths\s*:/m.test(frontmatter(s))
    rows.push({ what: relative(dir, p), kind: scoped ? 'rule (path-scoped, loads on match)' : 'rule (always)', raw: scoped ? 0 : bytes(s), stripped: scoped ? 0 : bytes(stripComments(s)), onDemand: scoped ? bytes(s) : 0 })
  }
  for (const p of walk(join(dir, '.claude/agents')).filter(p => p.endsWith('.md'))) {
    const fm = frontmatter(read(p)); const d = bytes(fm)
    rows.push({ what: relative(dir, p), kind: 'subagent listing (frontmatter)', raw: d, stripped: d, onDemand: bytes(read(p)) - d })
  }
  for (const p of walk(join(dir, '.claude/skills')).filter(p => basename(p) === 'SKILL.md')) {
    const fm = frontmatter(read(p)); const d = bytes(fm)
    rows.push({ what: relative(dir, p), kind: 'skill listing (frontmatter)', raw: d, stripped: d, onDemand: bytes(read(p)) - d })
  }
  const hooks = []
  for (const f of ['.claude/settings.json', '.claude/settings.local.json']) {
    try { for (const [ev, list] of Object.entries(JSON.parse(read(join(dir, f)) || '{}').hooks || {}))
      for (const h of list) for (const c of h.hooks || []) hooks.push(`${f.split('/').pop()}: ${ev}${h.matcher ? `[${h.matcher}]` : ''} → ${c.command}`) } catch {}
  }
  const sum = k => rows.reduce((a, r) => a + (r[k] || 0), 0)
  return { rows, hooks, raw: sum('raw'), stripped: sum('stripped'), onDemand: sum('onDemand') }
}

function docsByTier(dir) {
  const t = { execution: 0, record: 0 }, n = { execution: 0, record: 0 }
  const files = [...walk(join(dir, 'docs')), ...['AGENTS.md', 'CLAUDE.md'].map(f => join(dir, f)).filter(existsSync)]
  for (const p of files.filter(p => p.endsWith('.md') && !/\/(archive|node_modules)\//i.test(p))) {
    const k = tierOf(p); t[k] += statSync(p).size; n[k]++
  }
  return { t, n }
}

// Ritual wording: instructions that cost turns or attention without changing the result.
export const RITUAL = [
  ['think-prompt', /\b(think (carefully|hard|deeply)|step[- ]by[- ]step|ultrathink)\b/i],
  ['effort-exhortation', /\b(don'?t be lazy|do not be lazy|be thorough|take your time|be careful|without fail|non-negotiable)\b/i],
  ['shouting', /\b(IMPORTANT|CRITICAL|MUST|NEVER|ALWAYS|MANDATORY|REQUIRED|EXACTLY)\b/],
  ['verify-twice', /\b(double[- ]check|verify (it )?twice|re-?read|re-?verify|check again)\b/i],
  ['scratchpad', /\bscratch ?pad\b/i],
  ['reminder', /\b(remember to|don'?t forget|make sure|be sure to)\b/i],
  ['blanket-trigger', /\b(before|after) (any|every)\b|\bevery (session|time|turn|task)\b/i],
]
export function ritualScan(text) {
  const hits = []; let inComment = false
  text.split('\n').forEach((line, i) => {
    const startsIn = inComment
    // track <!-- --> state; hits inside Keel guidance comments are author-facing (deleted at generation)
    for (const m of line.matchAll(/<!--|-->/g)) inComment = m[0] === '<!--'
    const cats = RITUAL.filter(([, re]) => re.test(line)).map(([c]) => c)
    if (cats.length) hits.push({ line: i + 1, cats, guidance: startsIn || /<!--/.test(line), text: line.trim().slice(0, 160) })
  })
  return hits
}

const kb = b => (b / 1024).toFixed(1) + ' KB'
const isMain = resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)
const cmd = isMain ? (process.argv[2] || 'all') : null

if (cmd === '--self-test') {
  const h = ritualScan('ok line\nYou MUST think carefully.\n<!-- Keel guidance: be thorough\n still IMPORTANT -->\nmake sure to re-read')
  const ok = h.length === 4 && h[0].line === 2 && h[0].cats.includes('shouting') && h[0].cats.includes('think-prompt')
    && h[1].guidance && h[2].guidance && !h[3].guidance && h[3].cats.includes('verify-twice')
    && tierOf('/x/docs/PRD.md') === 'record' && tierOf('/x/AGENTS.md') === 'execution' && tierOf('/x/docs/adr/README.md') === 'execution'
    && tierOf('/x/docs/adr/ADR-001-a.md') === 'record' && bytes(stripComments('a<!-- x -->\nb')) === 2
  console.log(ok ? 'ok' : 'FAIL', ok ? '' : JSON.stringify(h)); process.exit(ok ? 0 : 1)
}

if (cmd === 'fresh' || cmd === 'all') {
  console.log('## Fresh project (templates, Keel guidance comments stripped as generation instructs)\n')
  console.log('| File | Raw | Stripped | ~tokens (stripped) |\n|---|---:|---:|---:|')
  let tot = 0
  for (const f of ['CLAUDE.md', 'AGENTS.md']) {
    const s = read(join(TPL, f)), st = bytes(stripComments(s)); tot += st
    console.log(`| ${f} | ${bytes(s)} | ${st} | ${tok(st)} |`)
  }
  for (const f of ['design.md', 'security.md', 'doc-sync.md']) {
    const fm = bytes(frontmatter(read(join(TPL, 'agents', f)))); tot += fm
    console.log(`| .claude/agents/${f} (frontmatter) | ${fm} | ${fm} | ${tok(fm)} |`)
  }
  console.log(`| **Total always-loaded** | | **${tot}** | **${tok(tot)}** |\n`)
}

if (cmd === 'project' || cmd === 'all') {
  const dirs = cmd === 'project' ? process.argv.slice(3) : []
  if (dirs.length) {
    console.log('## Real projects (as on disk)\n')
    console.log('| Project | keel | Always-loaded raw | stripped | ~tokens | on-demand agent/skill bodies | exec docs | record docs | hooks |\n|---|---|---:|---:|---:|---:|---:|---:|---|')
    for (const d of dirs) {
      const a = alwaysLoaded(d), t = docsByTier(d)
      const v = (read(join(d, '.keel/meta.json')).match(/"keelVersion"\s*:\s*"([^"]+)"/) || [, '?'])[1]
      console.log(`| ${basename(d)} | ${v} | ${a.raw} | ${a.stripped} | ${tok(a.stripped)} | ${kb(a.onDemand)} | ${kb(t.t.execution)} (${t.n.execution}) | ${kb(t.t.record)} (${t.n.record}) | ${a.hooks.length} |`)
    }
    console.log('\n### Breakdown\n')
    for (const d of dirs) {
      const a = alwaysLoaded(d)
      console.log(`- **${basename(d)}**: ` + a.rows.filter(r => r.raw).map(r => `${r.what} ${r.stripped}`).join(' · ') + (a.hooks.length ? `\n  - hooks: ${a.hooks.join(' ; ')}` : ''))
    }
    console.log()
  }
}

if (cmd === 'skill' || cmd === 'all') {
  console.log('## Keel skill (loaded when /keel runs)\n\n| File | Bytes | ~tokens | Lines |\n|---|---:|---:|---:|')
  const files = [join(SKILL, 'SKILL.md'), ...walk(join(SKILL, 'references')).filter(p => !p.includes('/templates/'))]
  let tot = 0
  for (const p of files) { const s = read(p); tot += bytes(s); console.log(`| ${relative(SKILL, p)} | ${bytes(s)} | ${tok(bytes(s))} | ${s.split('\n').length} |`) }
  const t = walk(TPL).reduce((a, p) => a + statSync(p).size, 0)
  console.log(`| references/templates/ (${walk(TPL).length} files) | ${t} | ${tok(t)} | |`)
  console.log(`| **Total** | **${tot + t}** | **${tok(tot + t)}** | |\n`)
}

if (cmd === 'ritual' || cmd === 'all') {
  console.log('## Ritual wording in templates\n\n| File:line | Tier | Category | Guidance comment? | Text |\n|---|---|---|---|---|')
  const counts = {}
  const extra = cmd === 'ritual' ? process.argv.slice(3).map(a => resolve(a)) : []
  for (const p of (extra.length ? extra : walk(TPL)).filter(p => /\.(md|js|mjs)$/.test(p))) {
    for (const h of ritualScan(read(p))) {
      const rel = relative(REPO, p), tier = !p.startsWith(TPL) ? 'skill' : tierOf('/' + relative(TPL, p).replace(/^agents\//, '.claude/agents/').replace(/^workflows\//, '.claude/workflows/'))
      for (const c of h.cats) counts[`${tier}/${h.guidance ? 'guidance' : 'output'}/${c}`] = (counts[`${tier}/${h.guidance ? 'guidance' : 'output'}/${c}`] || 0) + 1
      console.log(`| ${rel}:${h.line} | ${tier} | ${h.cats.join(', ')} | ${h.guidance ? 'yes' : 'no'} | ${h.text.replace(/\|/g, '\\|')} |`)
    }
  }
  console.log('\n### Counts (tier/where/category)\n'); for (const [k, v] of Object.entries(counts).sort()) console.log(`- ${k}: ${v}`)
}
