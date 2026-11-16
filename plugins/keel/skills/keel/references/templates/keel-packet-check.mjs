#!/usr/bin/env node
// keel packet checker (team answers). Installed as .keel/packet-check.mjs in team mode only.
// Usage:  node .keel/packet-check.mjs [dir]      check every packet in dir (default .keel/rounds) and dir/sealed/
//         node .keel/packet-check.mjs --json     same, machine-readable (used by /keel merge)
//         node .keel/packet-check.mjs --self-test
// Checks format, answer marks (human / Claude), overrules, decisions, open/blind modes, and anything
// that looks like a secret. Prints per question: answered, gap, review (2+ answers, undecided), sealed.
// Exit 1 on any error. It never edits a packet. Contradictions are judged by /keel merge, not here.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const ID = /^[A-Z]{2,4}-\d{2,3}$/
const HUMAN = /^(.+?) \(human\)$/
const CLAUDE = /^Claude, for (.+)$/
// ponytail: pattern list, not entropy analysis; add a pattern when a real leak shape is missed.
const SECRETS = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'API secret key (sk-)'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, 'Google API key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'JWT'],
  [/\b(password|passwd|pwd|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*\S{6,}/i, 'credential assignment'],
]

const frontmatter = t => {
  const m = t.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return null
  const o = {}
  for (const l of m[1].split('\n')) { const k = l.match(/^([\w-]+):\s*(.*)$/); if (k) o[k[1]] = k[2].trim() }
  return o
}
const list = s => (s || '').split(',').map(x => x.trim()).filter(Boolean)

// Parse "### ID text" blocks under "## Questions".
function questions(t) {
  const body = t.split(/^## Questions\s*$/m)[1]
  if (body === undefined) return null
  return body.split(/^### /m).slice(1).map(block => {
    const lines = block.replace(/\n## [\s\S]*$/, '').split('\n')
    const [id, ...text] = lines[0].trim().split(' ')
    const q = { id, text: text.join(' '), mode: null, answers: [], decided: null, revealed: null, lines: lines.slice(1) }
    let a = null
    for (const l of q.lines) {
      let m
      if ((m = l.match(/^mode:\s*(.*)$/))) q.mode = m[1].trim()
      else if ((m = l.match(/^revealed:\s*(.*)$/))) q.revealed = m[1].trim()
      else if ((m = l.match(/^decided:\s*(.*)$/))) q.decided = m[1].trim()
      else if ((m = l.match(/^- answer:\s*(.*)$/))) q.answers.push(a = { text: m[1].trim(), by: null, overruledBy: null })
      else if (a && (m = l.match(/^\s+by:\s*(.*)$/))) a.by = m[1].trim()
      else if (a && (m = l.match(/^\s+overruled-by:\s*(.*)$/))) a.overruledBy = m[1].trim()
    }
    return q
  })
}

// Name an answer speaks for: the human, or the person Claude answered for.
const speaker = by => (by.match(HUMAN) || by.match(CLAUDE) || [])[1]

function checkFile(file, sealedByRound) {
  const t = fs.readFileSync(file, 'utf8'), name = path.basename(file), err = [], report = []
  for (const [re, what] of SECRETS) {
    const i = t.split('\n').findIndex(l => re.test(l))
    if (i >= 0) err.push(`${name}:${i + 1}: looks like a secret (${what}); packets never hold keys or passwords, use a reference to the secrets store`)
  }
  const fm = frontmatter(t)
  if (!fm || fm['keel-packet'] !== '1') return { err: [...err, `${name}: missing frontmatter with keel-packet: 1`], report }
  const sealed = 'respondent' in fm
  const need = sealed ? ['round', 'respondent'] : ['round', 'owner', 'decider', 'respondents']
  for (const k of need) if (!fm[k]) err.push(`${name}: frontmatter has no ${k}`)
  const people = sealed ? [fm.respondent] : list(fm.respondents)
  const qs = questions(t)
  if (!qs) return { err: [...err, `${name}: no "## Questions" section`], report }
  const seen = new Set()
  for (const q of qs) {
    const at = `${name} ${q.id}`
    if (!ID.test(q.id)) err.push(`${at}: question id must look like ARC-04`)
    if (seen.has(q.id)) err.push(`${at}: duplicate question id`)
    seen.add(q.id)
    if (!['open', 'blind'].includes(q.mode)) err.push(`${at}: mode must be open or blind`)
    for (const a of q.answers) {
      if (!a.by) { err.push(`${at}: answer has no "by:" line`); continue }
      const h = a.by.match(HUMAN), c = a.by.match(CLAUDE)
      if (!h && !c) err.push(`${at}: by must be "<name> (human)" or "Claude, for <name>", got "${a.by}"`)
      if (c && !people.includes(c[1]) && c[1] !== fm.owner) err.push(`${at}: Claude answered for "${c[1]}", who is not named on this round`)
      if (a.overruledBy) {
        if (!c) err.push(`${at}: only a Claude answer can be overruled`)
        if (!/^.+? \(human\): .+/.test(a.overruledBy)) err.push(`${at}: overruled-by must be "<name> (human): <their answer>"`)
      }
      if (sealed && speaker(a.by) !== fm.respondent) err.push(`${at}: sealed file holds an answer by someone other than ${fm.respondent}`)
    }
    if (sealed) { if (q.mode !== 'blind') err.push(`${at}: sealed files hold blind questions only`); continue }
    if (q.decided) {
      const d = q.decided.match(/^(.+?)\. Reason: (.+)$/)
      if (!d) err.push(`${at}: decided must be "<name>. Reason: <why>"`)
      else if (/^Claude\b/i.test(d[1])) err.push(`${at}: a Claude answer never settles a disagreement; the decider is a person`)
      else if (![fm.decider, fm.owner].includes(d[1])) err.push(`${at}: decided by "${d[1]}", who is neither the decider (${fm.decider}) nor the owner (${fm.owner})`)
    }
    if (q.mode === 'blind') {
      const box = (sealedByRound[fm.round] || []).filter(s => s.ids.has(q.id)).map(s => s.respondent)
      if (!q.revealed) {
        if (q.answers.length) err.push(`${at}: blind and not revealed, so the shared packet must show no answers`)
        report.push(`${at}: sealed (${box.length} of ${people.length} answered)`)
        continue
      }
      if (q.revealed === 'all answered') {
        const missing = people.filter(p => !q.answers.some(a => speaker(a.by) === p))
        if (missing.length) err.push(`${at}: revealed as "all answered" but no answer from ${missing.join(', ')}`)
      } else if (!new RegExp(`^closed by ${(fm.owner || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).test(q.revealed)) {
        err.push(`${at}: revealed must be "all answered" or "closed by ${fm.owner}" (the owner)`)
      }
    } else if (q.revealed) err.push(`${at}: revealed applies to blind questions only`)
    const voices = new Set(q.answers.map(a => a.overruledBy ? a.overruledBy : a.text))
    report.push(`${at}: ${!q.answers.length ? 'gap' : q.decided ? 'decided' : voices.size > 1 ? 'review (2+ answers, undecided)' : 'answered'}`)
  }
  return { err, report }
}

function run(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f)) : []
  const sd = path.join(dir, 'sealed')
  const sealedFiles = fs.existsSync(sd) ? fs.readdirSync(sd).filter(f => f.endsWith('.md')).map(f => path.join(sd, f)) : []
  const sealedByRound = {}
  for (const f of sealedFiles) {
    const t = fs.readFileSync(f, 'utf8'), fm = frontmatter(t) || {}, qs = questions(t) || []
    ;(sealedByRound[fm.round] ||= []).push({ respondent: fm.respondent, ids: new Set(qs.filter(q => q.answers.length).map(q => q.id)) })
  }
  const out = { err: [], report: [] }
  for (const f of [...files, ...sealedFiles]) { const r = checkFile(f, sealedByRound); out.err.push(...r.err); out.report.push(...r.report) }
  return out
}

if (process.argv.includes('--self-test')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'keel-packet-'))
  const head = (round, extra = '') => `---\nkeel-packet: 1\nproject: Demo\nround: ${round}\nowner: Ana\ndecider: Ana\nrespondents: Ana, Ben\n${extra}---\n\n# ${round}\n\n## Questions\n\n`
  const OPEN = head('architect') +
    '### ARC-01 Where is user data stored?\nmode: open\n- answer: EU region only, one database.\n  by: Ben (human)\n' +
    '- answer: Managed Postgres in one EU region.\n  by: Claude, for Ana\n  overruled-by: Ana (human): same region, two databases.\ndecided: Ana. Reason: billing data kept apart.\n\n' +
    '### ARC-02 Which queue?\nmode: open\n\n' +
    '### ARC-03 Monolith or services?\nmode: open\n- answer: Monolith.\n  by: Ana (human)\n- answer: Services.\n  by: Ben (human)\n'
  const BLIND = head('product-manager') + '### PM-01 What is out of scope?\nmode: blind\n\n'
  const SEAL = `---\nkeel-packet: 1\nround: product-manager\nrespondent: Ben\n---\n\n## Questions\n\n### PM-01 What is out of scope?\nmode: blind\n- answer: Mobile apps.\n  by: Ben (human)\n`
  const cases = [
    ['valid open + blind round', { 'architect.md': OPEN, 'product-manager.md': BLIND, 'sealed/product-manager.ben.md': SEAL },
      r => !r.err.length && ['ARC-01: decided', 'ARC-02: gap', 'ARC-03: review', 'PM-01: sealed (1 of 2'].every(s => r.report.some(l => l.includes(s)))],
    ['blind answer leaked into shared packet', { 'pm.md': BLIND + '- answer: x\n  by: Ben (human)\n' }, r => r.err.some(e => e.includes('must show no answers'))],
    ['blind revealed as all answered with one missing', { 'pm.md': BLIND + 'revealed: all answered\n- answer: x\n  by: Ben (human)\n' }, r => r.err.some(e => e.includes('no answer from Ana'))],
    ['blind closed by the owner', { 'pm.md': BLIND + 'revealed: closed by Ana\n- answer: x\n  by: Ben (human)\n' }, r => !r.err.length],
    ['blind closed by a non-owner', { 'pm.md': BLIND + 'revealed: closed by Ben\n' }, r => r.err.some(e => e.includes('(the owner)'))],
    ['Claude settles a dispute', { 'a.md': OPEN.replace('decided: Ana.', 'decided: Claude.') }, r => r.err.some(e => e.includes('never settles'))],
    ['decided by someone not named', { 'a.md': OPEN.replace('decided: Ana.', 'decided: Zed.') }, r => r.err.some(e => e.includes('neither the decider'))],
    ['human answer overruled', { 'a.md': OPEN.replace('by: Ben (human)\n', 'by: Ben (human)\n  overruled-by: Ana (human): no.\n') }, r => r.err.some(e => e.includes('only a Claude answer'))],
    ['unmarked answer', { 'a.md': OPEN.replace('by: Ben (human)', 'by: Ben') }, r => r.err.some(e => e.includes('by must be'))],
    ['missing mode', { 'a.md': OPEN.replace('### ARC-02 Which queue?\nmode: open', '### ARC-02 Which queue?') }, r => r.err.some(e => e.includes('mode must be'))],
    ['secret in an answer', { 'a.md': OPEN.replace('EU region only', 'key AKIAABCDEFGHIJKLMNOP') }, r => r.err.some(e => e.includes('AWS access key'))],
    ['no owner: reported, not a crash', { 'pm.md': BLIND.replace('owner: Ana\n', '') + 'revealed: closed by Ana\n' }, r => r.err.some(e => e.includes('frontmatter has no owner'))],
    ['sealed file with someone else\'s answer', { 'pm.md': BLIND, 'sealed/pm.ana.md': SEAL.replace('respondent: Ben', 'respondent: Ana') }, r => r.err.some(e => e.includes('other than Ana'))],
  ]
  let fail = 0
  for (const [label, files, pass] of cases) {
    const d = path.join(tmp, label.replace(/\W+/g, '-'))
    for (const [f, body] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(d, f)), { recursive: true }); fs.writeFileSync(path.join(d, f), body) }
    const r = run(d), ok = pass(r)
    if (!ok) { fail++; console.error(`FAIL ${label}\n  ${[...r.err, ...r.report].join('\n  ')}`) } else console.log(`ok   ${label}`)
  }
  fs.rmSync(tmp, { recursive: true, force: true })
  console.log(fail ? `self-test FAILED (${fail})` : `self-test passed (${cases.length} cases)`)
  process.exit(fail ? 1 : 0)
}

const dir = process.argv.slice(2).find(a => !a.startsWith('--')) || '.keel/rounds'
const r = run(dir)
if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1))
else {
  for (const l of r.report) console.log(l)
  for (const e of r.err) console.error(`ERROR ${e}`)
  console.log(r.err.length ? `packet-check: ${r.err.length} error(s)` : `packet-check: ok (${r.report.length} questions)`)
}
process.exit(r.err.length ? 1 : 0)
