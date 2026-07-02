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

const phraseToSlug: Record<string, string> = {}
const phrases: string[] = []
for (const t of GLOSSARY) {
  for (const p of [t.term, ...(t.aliases ?? [])]) {
    phraseToSlug[p.toLowerCase()] = t.slug
    phrases.push(p)
  }
}
phrases.sort((a, b) => b.length - a.length) // prefer longer matches in the alternation
const TERM_RE = new RegExp(`\\b(${phrases.map(escapeRe).join('|')})\\b`, 'gi')
const SKIP_TAGS = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rehypeGlossary() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    const linked = new Set<string>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function linkify(value: string): any[] | null {
      TERM_RE.lastIndex = 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let out: any[] | null = null
      let last = 0
      let m: RegExpExecArray | null
      while ((m = TERM_RE.exec(value))) {
        const matched = m[0]
        const slug = phraseToSlug[matched.toLowerCase()]
        if (!slug || linked.has(slug)) continue
        out = out ?? []
        if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) })
        out.push({
          type: 'element',
          tagName: 'a',
          properties: { className: ['gloss-term'], href: `/glossary#${slug}` },
          children: [{ type: 'text', value: matched }],
        })
        linked.add(slug)
        last = m.index + matched.length
      }
      if (out && last < value.length) out.push({ type: 'text', value: value.slice(last) })
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
