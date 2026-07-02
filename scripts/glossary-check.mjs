#!/usr/bin/env node
// Glossary coverage + validation tool.
//
//   node scripts/glossary-check.mjs          # full report
//   node scripts/glossary-check.mjs --ci     # exit non-zero on structural errors
//
// It (1) validates the glossary's structural integrity, (2) reports which terms
// are actually linkable in the prose and which are dead (defined but never used),
// and (3) surfaces candidate vocabulary — emphasized phrases in the content that
// aren't covered by any glossary term — so coverage can be grown deliberately.

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT_DIR = join(root, 'src', 'content')
const GLOSSARY_FILE = join(root, 'src', 'data', 'glossary.ts')
const CI = process.argv.includes('--ci')

// --- Parse the glossary (flat object literals, no nesting) -------------------
const gsrc = readFileSync(GLOSSARY_FILE, 'utf8')
const terms = []
for (const m of gsrc.matchAll(/\{[^{}]*\}/g)) {
  const body = m[0]
  const slug = body.match(/slug:\s*'([^']+)'/)?.[1]
  const term = body.match(/term:\s*'([^']+)'/)?.[1]
  if (!slug || !term) continue
  const aliasRaw = body.match(/aliases:\s*\[([^\]]*)\]/)?.[1] ?? ''
  const aliases = [...aliasRaw.matchAll(/'([^']+)'/g)].map((a) => a[1])
  terms.push({ slug, term, aliases })
}

// --- Build the same matcher the build-time linker uses (keep in sync) -------
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const norm = (s) => s.toLowerCase().replace(/[\s-]+/g, ' ').trim()
const phrasePattern = (p) => p.split(/[\s-]+/).map(escapeRe).join('[\\s-]+')
const phraseToSlug = {}
const phrases = []
const errors = []
for (const t of terms) {
  for (const p of [t.term, ...t.aliases]) {
    const key = norm(p)
    if (phraseToSlug[key] && phraseToSlug[key] !== t.slug) {
      errors.push(`Alias/term collision: "${p}" maps to both ${phraseToSlug[key]} and ${t.slug}`)
    }
    phraseToSlug[key] = t.slug
    phrases.push(p)
  }
}
const slugs = terms.map((t) => t.slug)
for (const s of slugs) if (slugs.indexOf(s) !== slugs.lastIndexOf(s)) errors.push(`Duplicate slug: ${s}`)
phrases.sort((a, b) => b.length - a.length)
const TERM_RE = new RegExp(`\\b(${phrases.map(phrasePattern).join('|')})(?:es|s)?\\b`, 'gi')
const slugForMatch = (matched) => {
  const key = norm(matched)
  return phraseToSlug[key] ?? phraseToSlug[key.replace(/s$/, '')] ?? phraseToSlug[key.replace(/es$/, '')]
}

// Strip code + heading lines so the scan matches what the linker actually sees.
const stripForScan = (mdx) =>
  mdx
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .split('\n')
    .filter((line) => !/^\s*#{1,6}\s/.test(line))
    .join('\n')

// --- Scan content -----------------------------------------------------------
const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'))
const usedSlugs = new Set()
const perFile = []
const emphasis = new Map() // uncovered emphasized phrase -> count

for (const file of files) {
  const raw = readFileSync(join(CONTENT_DIR, file), 'utf8')
  const scan = stripForScan(raw)

  const linked = new Set()
  TERM_RE.lastIndex = 0
  let m
  while ((m = TERM_RE.exec(scan))) {
    const slug = slugForMatch(m[0])
    if (slug) {
      linked.add(slug)
      usedSlugs.add(slug)
    }
  }
  perFile.push({ file, count: linked.size })

  // Emphasized (**bold**) phrases that no glossary term covers → candidates.
  for (const b of raw.matchAll(/\*\*([^*]+)\*\*/g)) {
    const phrase = b[1].trim().replace(/[.:,;]+$/, '')
    if (phrase.length < 3 || phrase.length > 40) continue
    if (/^[A-Z][a-z]+:?$/.test(phrase)) continue // skip "Read:", "Write:" style labels
    TERM_RE.lastIndex = 0
    if (TERM_RE.test(phrase)) continue // already covered by a term
    const key = phrase.toLowerCase()
    emphasis.set(key, (emphasis.get(key) ?? 0) + 1)
  }
}

const dead = terms.filter((t) => !usedSlugs.has(t.slug)).map((t) => t.slug)
const candidates = [...emphasis.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])

// --- Report -----------------------------------------------------------------
console.log(`Glossary: ${terms.length} terms · ${files.length} content files`)
console.log(`Linkable terms in prose: ${usedSlugs.size}/${terms.length}`)
const avg = (perFile.reduce((s, f) => s + f.count, 0) / perFile.length).toFixed(1)
console.log(`Avg linked terms per file: ${avg}`)

const sparse = perFile.filter((f) => f.count <= 3).sort((a, b) => a.count - b.count)
if (sparse.length) {
  console.log(`\nSparsely-linked files (≤3 terms):`)
  for (const f of sparse) console.log(`  ${f.count}  ${f.file}`)
}

if (dead.length) {
  console.log(`\n⚠ Dead entries (defined, never appear in prose): ${dead.length}`)
  console.log('  ' + dead.join(', '))
}

if (candidates.length) {
  console.log(`\n★ Candidate terms (emphasized ≥2× in prose, not covered): ${candidates.length}`)
  for (const [phrase, n] of candidates) console.log(`  ${String(n).padStart(2)}×  ${phrase}`)
}

if (errors.length) {
  console.log(`\n✖ Structural errors: ${errors.length}`)
  for (const e of errors) console.log('  ' + e)
}

if (CI && errors.length) {
  console.error(`\nglossary-check failed with ${errors.length} structural error(s).`)
  process.exit(1)
}
