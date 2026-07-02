import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import { GLOSSARY } from './src/data/glossary'

// --- Glossary auto-linker -------------------------------------------------
// A rehype plugin that turns the FIRST mention of each glossary term in a
// document's prose into a link to /glossary#<slug>. Runs at build time, so no
// MDX file needs hand-editing. Skips headings, code, and existing links.

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Normalize a matched surface form so whitespace/hyphen/newline variations all
// map to the same key (prose is hard-wrapped, so terms often span a line break).
const norm = (s: string) => s.toLowerCase().replace(/[\s-]+/g, ' ').trim()
// Build a regex fragment where spaces/hyphens between words match any run of
// whitespace or hyphens — so "leader election", "leader-election", and a term
// split across a line all match.
const phrasePattern = (p: string) =>
  p
    .split(/[\s-]+/)
    .map(escapeRe)
    .join('[\\s-]+')

// All-caps acronyms (no lowercase) must match case-sensitively, or short ones
// like "HA"/"CA"/"ACID" would catch lowercase words ("ha", "has", "acid").
const isAcronym = (p: string) => !/[a-z]/.test(p)
const phraseToSlug: Record<string, string> = {}
const ciPhrases: string[] = [] // case-insensitive (contain a lowercase letter)
const csPhrases: string[] = [] // case-sensitive (all-caps acronyms)
for (const t of GLOSSARY) {
  for (const p of [t.term, ...(t.aliases ?? [])]) {
    phraseToSlug[norm(p)] = t.slug
    ;(isAcronym(p) ? csPhrases : ciPhrases).push(p)
  }
}
const byLenDesc = (a: string, b: string) => b.length - a.length
// Trailing (?:es|s)? lets a term match its simple plural; lookup strips it back.
const buildRe = (list: string[], flags: string) =>
  list.length
    ? new RegExp(`\\b(${[...list].sort(byLenDesc).map(phrasePattern).join('|')})(?:es|s)?\\b`, flags)
    : null
const RE_CI = buildRe(ciPhrases, 'gi')
const RE_CS = buildRe(csPhrases, 'g')
const slugForMatch = (matched: string): string | undefined => {
  const key = norm(matched)
  // Try exact, then de-pluralize: strip a single "s" (node→nodes) before "es"
  // (box→boxes), so words ending in "e" aren't over-trimmed ("nodes" → "node").
  return phraseToSlug[key] ?? phraseToSlug[key.replace(/s$/, '')] ?? phraseToSlug[key.replace(/es$/, '')]
}
const SKIP_TAGS = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rehypeGlossary() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    const linked = new Set<string>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function linkify(value: string): any[] | null {
      // Collect matches from both matchers, then emit non-overlapping links,
      // first-occurrence-per-slug, left to right.
      const found: { i: number; end: number; text: string; slug: string }[] = []
      for (const re of [RE_CI, RE_CS]) {
        if (!re) continue
        re.lastIndex = 0
        let m: RegExpExecArray | null
        while ((m = re.exec(value))) {
          const slug = slugForMatch(m[0])
          if (slug) found.push({ i: m.index, end: m.index + m[0].length, text: m[0], slug })
        }
      }
      if (!found.length) return null
      found.sort((a, b) => a.i - b.i || b.end - b.i - (a.end - a.i))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out: any[] = []
      let last = 0
      let used = false
      for (const f of found) {
        if (f.i < last || linked.has(f.slug)) continue
        if (f.i > last) out.push({ type: 'text', value: value.slice(last, f.i) })
        out.push({
          type: 'element',
          tagName: 'a',
          properties: { className: ['gloss-term'], href: `/glossary#${f.slug}` },
          children: [{ type: 'text', value: f.text }],
        })
        linked.add(f.slug)
        last = f.end
        used = true
      }
      if (!used) return null
      if (last < value.length) out.push({ type: 'text', value: value.slice(last) })
      return out
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function walk(node: any, skip: boolean) {
      if (!node.children) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out: any[] = []
      for (const child of node.children) {
        if (child.type === 'text' && !skip) {
          const parts = linkify(child.value)
          if (parts) {
            out.push(...parts)
            continue
          }
          out.push(child)
        } else if (child.type === 'element') {
          walk(child, skip || SKIP_TAGS.has(child.tagName))
          out.push(child)
        } else {
          out.push(child)
        }
      }
      node.children = out
    }

    walk(tree, false)
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react', rehypePlugins: [rehypeGlossary] }) },
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
