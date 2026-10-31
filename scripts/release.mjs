#!/usr/bin/env node
// Release feed for keel: generates release.json (schema: schemas/release-v1.schema.json) and
// RELEASE.md from CHANGELOG.md, and checks every version stamp agrees, so nothing can drift.
// Usage: node scripts/release.mjs            write release.json + RELEASE.md
//        node scripts/release.mjs --check    exit 1 if either file is stale or any version stamp differs
//        node scripts/release.mjs --self-test
// Release step (CLAUDE.md "Release"): bump → CHANGELOG entry → node scripts/release.mjs → commit →
// --check passes → merge → tag keel--vX.Y.Z → push. CI (.github/workflows/release.yml) re-runs --check.
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { tmpdir } from 'os'
import { execSync } from 'child_process'

const REPO = 'https://github.com/achatt89/keel'
const SCHEMA = `${REPO}/blob/main/schemas/release-v1.schema.json`
const INSTALL = {
  commands: ['/plugin marketplace add achatt89/keel', '/plugin install keel@thelogicatelier'],
  update: ['/plugin marketplace update thelogicatelier', '/plugin install keel@thelogicatelier'],
  note: 'Restart Claude Code after installing or updating, then run /keel upgrade in an existing keel project.',
  // One entry per tool keel is documented and tested in. Add a tool only once it is (not before).
  tools: [{
    id: 'claude-code', name: 'Claude Code', start: '/keel', docs: 'docs/site/05-plugin-install.md',
    methods: [
      { id: 'plugin', label: 'Plugin (recommended)', shell: false,
        commands: ['/plugin marketplace add achatt89/keel', '/plugin install keel@thelogicatelier'] },
      { id: 'personal-skill', label: 'Personal skill (no plugin system)', shell: true,
        commands: ['git clone https://github.com/achatt89/keel.git ~/code/keel', 'mkdir -p ~/.claude/skills',
          'ln -s ~/code/keel/plugins/keel/skills/keel ~/.claude/skills/keel'] },
      { id: 'project-skill', label: 'Project skill (one repo, shared with the team)', shell: true,
        commands: ['git clone https://github.com/achatt89/keel.git ~/code/keel', 'mkdir -p .claude/skills',
          'cp -R ~/code/keel/plugins/keel/skills/keel .claude/skills/keel'] },
    ],
  }],
}
const REQUIREMENTS = {
  claudeCode: 'a build with the /plugin command (else install as a personal skill; see README)',
  git: 'on PATH',
  node: '>=18, for the .keel/*.mjs helper scripts keel installs in a project',
}
// Audience: a CHANGELOG entry whose first line under the heading is "<!-- audience: internal -->"
// is internal (no user-visible change); default "user". Internal releases stay in versions[] flagged;
// "latest" and every user-facing surface (top-level summary/highlights, RELEASE.md, the docs badge,
// the skill's userVersion, the update check) use the newest USER release. "version" is always what
// /plugin install gives (plugin.json).
// Every place the version is stamped (CLAUDE.md release convention). [file, regex, which: version|latest]
const STAMPS = [
  ['plugins/keel/.claude-plugin/plugin.json', /"version":\s*"([^"]+)"/],
  ['.claude-plugin/marketplace.json', /"metadata":\s*{[^}]*"version":\s*"([^"]+)"/],
  ['.claude-plugin/marketplace.json', /"plugins":\s*\[\s*{[\s\S]*?"version":\s*"([^"]+)"/],
  ['plugins/keel/skills/keel/SKILL.md', /^\s+version:\s*(\S+)/m],
  ['plugins/keel/skills/keel/references/templates/keel-meta.json', /"keelVersion":\s*"([^"]+)"/],
  ['plugins/keel/skills/keel/SKILL.md', /^\s+userVersion:\s*(\S+)/m, 'latest'],
  ['docs/index.html', /class="version-badge"[^>]*>v([^<]+)</, 'latest'],
]

export function parseChangelog(md) {
  const out = []
  const parts = md.split(/^## /m).slice(1)
  for (const p of parts) {
    const m = p.match(/^\[(\d+\.\d+\.\d+)\]\s*[—-]\s*(\d{4}-\d{2}-\d{2})[^\n]*\n([\s\S]*)$/)
    if (!m) continue
    let notes = m[3].trim()
    const a = notes.match(/^<!--\s*audience:\s*(\w+)\s*-->\s*/)
    const audience = a ? a[1] : 'user'
    if (!['user', 'internal'].includes(audience)) throw new Error(`${m[1]}: audience must be user or internal, not "${audience}"`)
    if (a) notes = notes.slice(a[0].length).trim()
    const lead = notes.split(/\n\s*\n/)[0]
    const highlights = [...notes.matchAll(/^- \*\*(.+?)\*\*/gm)].map(h => h[1].replace(/`/g, '').replace(/[.:]$/, '')).slice(0, 6)
    const summary = !/^(#|-)/.test(lead) ? lead.replace(/\s*\n\s*/g, ' ')
      : highlights.length ? highlights.slice(0, 3).join('; ') + '.' : ''
    out.push({ version: m[1], date: m[2], audience, summary, highlights, notes })
  }
  return out
}

export function build(root, tags = null) {
  const versions = parseChangelog(readFileSync(join(root, 'CHANGELOG.md'), 'utf8'))
  if (!versions.length) throw new Error('CHANGELOG.md has no "## [X.Y.Z] — YYYY-MM-DD" entries')
  // the newest version's tag is created by this release, so it always counts as existing
  const has = (v, i) => i === 0 || !tags || tags.has(`keel--v${v}`)
  const vs = versions.map((v, i) => {
    const prev = versions[i + 1]
    return { ...v, tag: `keel--v${v.version}`, tagUrl: has(v.version, i) ? `${REPO}/tree/keel--v${v.version}` : null,
      compareUrl: prev && has(v.version, i) && has(prev.version, i + 1) ? `${REPO}/compare/keel--v${prev.version}...keel--v${v.version}` : null }
  })
  const li = vs.findIndex(v => v.audience === 'user')
  if (li < 0) throw new Error('CHANGELOG.md has no user-facing release')
  const l = vs[li]
  const newerInternal = vs.slice(0, li).map(v => v.version)
  const nextUser = vs.slice(li + 1).findIndex(v => v.audience === 'user')
  const bundled = vs.slice(li + 1, nextUser < 0 ? vs.length : li + 1 + nextUser).map(v => v.version)
  const json = { $schema: SCHEMA, schemaVersion: 1, name: 'keel', repository: REPO,
    version: vs[0].version, latest: l.version, date: l.date, summary: l.summary, highlights: l.highlights, tag: l.tag, tagUrl: l.tagUrl,
    compareUrl: l.compareUrl, install: INSTALL, requirements: REQUIREMENTS, versions: vs }
  const span = a => a.length > 1 ? `${a[a.length - 1]}–${a[0]}` : a[0]
  const md = `# keel ${l.version} — ${l.date}\n\n${l.summary}\n\n` +
    (newerInternal.length ? `> Installing today gives keel ${vs[0].version}: the later internal release${newerInternal.length > 1 ? 's' : ''} ${span(newerInternal)} change nothing you use.\n\n` : '') +
    (bundled.length ? `> Also includes internal release${bundled.length > 1 ? 's' : ''} ${span(bundled)} (no user-facing changes; see CHANGELOG.md).\n\n` : '') +
    `**Install:**\n\n\`\`\`\n${INSTALL.commands.join('\n')}\n\`\`\`\n\n**Update:**\n\n\`\`\`\n${INSTALL.update.join('\n')}\n\`\`\`\n\n${INSTALL.note}\n\n` +
    `${l.notes}\n\n---\n\nTag: [${l.tag}](${l.tagUrl})${l.compareUrl ? ` · [compare with ${vs[1].version}](${l.compareUrl})` : ''} · ` +
    `full history: [CHANGELOG.md](CHANGELOG.md) · machine-readable: [release.json](release.json)\n` +
    `<!-- generated by scripts/release.mjs from CHANGELOG.md — do not edit -->\n`
  return { json: JSON.stringify(json, null, 2) + '\n', md, version: vs[0].version, latest: l.version }
}

export function stampErrors(root, version, latest = version) {
  return STAMPS.flatMap(([f, re, which]) => {
    const want = which === 'latest' ? latest : version
    if (!existsSync(join(root, f))) return [`${f}: missing`]
    const m = readFileSync(join(root, f), 'utf8').match(re)
    return !m ? [`${f}: no ${which === 'latest' ? 'latest user-facing version' : 'version'} stamp found`]
      : m[1] !== want ? [`${f}: ${m[1]} ≠ CHANGELOG ${which === 'latest' ? 'latest user-facing ' : ''}${want}`] : []
  })
}

const gitTags = root => { try { return new Set(execSync('git tag', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)) } catch { return null } }

if (process.argv.includes('--self-test')) {
  const r = mkdtempSync(join(tmpdir(), 'keel-release-'))
  const w = (f, s) => { mkdirSync(dirname(join(r, f)), { recursive: true }); writeFileSync(join(r, f), s) }
  w('CHANGELOG.md', '# Changelog\n\nIntro.\n\n## [1.1.0] — 2026-02-01\n\nBetter things.\n\n### Added\n- **Feature A.** detail\n- **Feature B**: more\n\n' +
    '## [1.0.0] — 2026-01-01\n\n### Added\n- **First** release\n- plain bullet\n\n## [Unreleased]\n')
  const v = '1.1.0'
  w('plugins/keel/.claude-plugin/plugin.json', `{"name":"keel","version":"${v}"}`)
  w('.claude-plugin/marketplace.json', `{"metadata":{"version":"${v}"},"plugins":[{"name":"keel","version":"${v}"}]}`)
  w('plugins/keel/skills/keel/SKILL.md', `---\nmetadata:\n  version: ${v}\n  userVersion: ${v}\n---\n`)
  w('plugins/keel/skills/keel/references/templates/keel-meta.json', `{"keelVersion":"${v}"}`)
  w('docs/index.html', `<span class="version-badge" aria-label="Version ${v}">v${v}</span>`)
  const b = build(r, new Set(['keel--v1.0.0']))
  const j = JSON.parse(b.json)
  const ok = j.schemaVersion === 1 && j.version === '1.1.0' && j.date === '2026-02-01' && j.summary === 'Better things.' &&
    JSON.stringify(j.highlights) === '["Feature A","Feature B"]' && j.versions.length === 2 &&
    j.versions[1].summary === 'First.' && j.compareUrl.endsWith('/compare/keel--v1.0.0...keel--v1.1.0') &&
    j.tagUrl.endsWith('/tree/keel--v1.1.0') && j.install.tools[0].methods.length === 3 && build(r, new Set()).json.includes('"compareUrl": null') &&
    b.md.startsWith('# keel 1.1.0 — 2026-02-01') && b.md.includes('/plugin install keel@thelogicatelier') &&
    stampErrors(r, v).length === 0
  w('docs/index.html', '<span class="version-badge">v1.0.9</span>')                 // drift is caught
  const drift = stampErrors(r, v)
  const pass = ok && drift.length === 1 && drift[0].startsWith('docs/index.html: 1.0.9')
  // audience: internal releases after (and between) user ones never become "latest"
  w('CHANGELOG.md', '# Changelog\n\n## [1.3.0] — 2026-04-01\n<!-- audience: internal -->\n\nFeed only.\n\n## [1.2.1] — 2026-03-15\n\n<!-- audience: internal -->\nCI only.\n\n' +
    '## [1.2.0] — 2026-03-01\n\nUser thing.\n\n### Added\n- **Visible** change\n\n## [1.1.1] — 2026-02-15\n<!-- audience: internal -->\nTidy.\n\n## [1.1.0] — 2026-02-01\n\nBetter things.\n')
  const a = build(r, null), aj = JSON.parse(a.json)
  const aud = aj.versions.map(x => x.audience).join()
  w('plugins/keel/skills/keel/SKILL.md', '---\nmetadata:\n  version: 1.3.0\n  userVersion: 1.2.0\n---\n')
  for (const f of ['plugins/keel/.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', 'plugins/keel/skills/keel/references/templates/keel-meta.json'])
    w(f, readFileSync(join(r, f), 'utf8').replaceAll(v, '1.3.0'))
  w('docs/index.html', '<span class="version-badge">v1.2.0</span>')
  const aErr = stampErrors(r, a.version, a.latest)
  w('docs/index.html', '<span class="version-badge">v1.3.0</span>')               // badge showing an internal version is drift
  const aErr2 = stampErrors(r, a.version, a.latest)
  let bad = ''; try { parseChangelog('## [1.0.0] — 2026-01-01\n<!-- audience: staff -->\n') } catch (e) { bad = e.message }
  const pass2 = aj.version === '1.3.0' && aj.latest === '1.2.0' && aj.summary === 'User thing.' && aud === 'internal,internal,user,internal,user' &&
    !aj.versions[0].notes.includes('audience') && aj.versions[1].notes === 'CI only.' &&
    a.md.startsWith('# keel 1.2.0') && a.md.includes('Installing today gives keel 1.3.0') && a.md.includes('1.2.1–1.3.0') &&
    a.md.includes('Also includes internal release 1.1.1') && !a.md.includes('Feed only') &&
    aErr.length === 0 && aErr2.length === 1 && /latest user-facing 1\.2\.0/.test(aErr2[0]) && /audience must be/.test(bad)
  console.log(pass && pass2 ? 'ok' : 'FAIL ' + JSON.stringify({ pass, j, drift, md: b.md, aj, aErr, aErr2, amd: a.md, bad }, null, 1)); process.exit(pass && pass2 ? 0 : 1)
}

const root = process.cwd()
const b = build(root, gitTags(root))
const errs = stampErrors(root, b.version, b.latest)
if (process.argv.includes('--check')) {
  const stale = [['release.json', b.json], ['RELEASE.md', b.md]].filter(([f, s]) => !existsSync(join(root, f)) || readFileSync(join(root, f), 'utf8') !== s)
    .map(([f]) => `${f}: stale — run node scripts/release.mjs`)
  const tag = process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : null
  if (tag && tag !== `keel--v${b.version}`) errs.push(`tag ${tag} ≠ keel--v${b.version} (CHANGELOG)`)
  for (const e of [...errs, ...stale]) console.error('DRIFT ' + e)
  console.log(errs.length + stale.length ? `release check failed (${b.version})` : `release ${b.version} (latest user-facing ${b.latest}): release.json, RELEASE.md and ${STAMPS.length} version stamps agree`)
  process.exit(errs.length + stale.length ? 1 : 0)
}
if (errs.length) { for (const e of errs) console.error('DRIFT ' + e); console.error('fix the version stamps first'); process.exit(1) }
writeFileSync(join(root, 'release.json'), b.json)
writeFileSync(join(root, 'RELEASE.md'), b.md)
console.log(`wrote release.json + RELEASE.md for ${b.version}`)
