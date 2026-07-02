import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ARCHITECTURES } from '../data/architectures'
import { CATEGORY_LABEL } from '../data/categories'
import { GLOSSARY } from '../data/glossary'

interface Hit {
  kind: 'pattern' | 'term'
  title: string
  subtitle: string
  to: string
  score: number
}

/** Simple, dependency-free scoring: prefix > word-boundary > substring. */
function scoreText(q: string, text: string): number {
  const t = text.toLowerCase()
  if (t.startsWith(q)) return 3
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(t)) return 2
  if (t.includes(q)) return 1
  return 0
}

function search(query: string): Hit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits: Hit[] = []
  for (const a of ARCHITECTURES) {
    const s = Math.max(
      scoreText(q, a.title) * 3,
      scoreText(q, a.tagline),
      scoreText(q, CATEGORY_LABEL[a.category] ?? ''),
    )
    if (s > 0)
      hits.push({ kind: 'pattern', title: a.title, subtitle: a.tagline, to: `/a/${a.slug}`, score: s + 1 })
  }
  for (const t of GLOSSARY) {
    const s = Math.max(
      scoreText(q, t.term) * 3,
      ...(t.aliases ?? []).map((al) => scoreText(q, al) * 2),
      scoreText(q, t.short),
    )
    if (s > 0)
      hits.push({ kind: 'term', title: t.term, subtitle: t.short, to: `/glossary#${t.slug}`, score: s })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 10)
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const hits = useMemo(() => search(query), [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setSel(0), [query])

  const go = (hit: Hit) => {
    onClose()
    navigate(hit.to)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.97, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-none text-ink-faint">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setSel((s) => Math.min(s + 1, hits.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setSel((s) => Math.max(s - 1, 0))
                  } else if (e.key === 'Enter' && hits[sel]) {
                    go(hits[sel])
                  } else if (e.key === 'Escape') {
                    onClose()
                  }
                }}
                placeholder="Search patterns and glossary…"
                className="w-full bg-transparent py-3.5 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <kbd className="flex-none rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                esc
              </kbd>
            </div>

            {query.trim() !== '' && (
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {hits.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-ink-faint">
                    Nothing matches “{query}”.
                  </div>
                ) : (
                  hits.map((h, i) => (
                    <button
                      key={h.to + h.title}
                      onClick={() => go(h)}
                      onMouseEnter={() => setSel(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                        i === sel ? 'bg-accent/15' : ''
                      }`}
                    >
                      <span
                        className={`flex-none rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${
                          h.kind === 'pattern'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-surface-2 text-ink-faint'
                        }`}
                      >
                        {h.kind}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">{h.title}</span>
                        <span className="block truncate text-xs text-ink-soft">{h.subtitle}</span>
                      </span>
                      {i === sel && <span className="flex-none font-mono text-[10px] text-ink-faint">↵</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
