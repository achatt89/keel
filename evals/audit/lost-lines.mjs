// D1 check: every non-blank body line of the old SKILL.md (frontmatter excluded; the description
// was rewritten on purpose) must survive in the new SKILL.md + references/modes/*.md.
// Counted as a multiset; bare --- separators are skipped; headings compare without their #s (a moved heading may change level).
// Usage: node evals/audit/lost-lines.mjs <git-ref-of-old-SKILL.md>   (prints nothing when nothing is lost)
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
const K = 'plugins/keel/skills/keel'
const body = s => s.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n').map(l => l.trimEnd().replace(/^#+ /, '')).filter(l => l.trim() && l !== '---') // '---' rules are section separators, not text
const old = body(execSync(`git show ${process.argv[2] || 'HEAD'}:${K}/SKILL.md`, { encoding: 'utf8' }))
const pool = new Map()
for (const f of [`${K}/SKILL.md`, ...readdirSync(`${K}/references/modes`).map(f => `${K}/references/modes/${f}`)])
  for (const l of body(readFileSync(f, 'utf8'))) pool.set(l, (pool.get(l) || 0) + 1)
for (const l of old) { const n = pool.get(l) || 0; if (n) pool.set(l, n - 1); else console.log(l) }
