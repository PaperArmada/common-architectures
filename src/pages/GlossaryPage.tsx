import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GLOSSARY } from '../data/glossary'

export function GlossaryPage() {
  const location = useLocation()
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = GLOSSARY.filter(
      (t) =>
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        (t.aliases ?? []).some((a) => a.toLowerCase().includes(q)),
    )
    const sorted = [...filtered].sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()))
    const by = new Map<string, typeof GLOSSARY>()
    for (const t of sorted) {
      const letter = t.term[0].toUpperCase()
      const arr = by.get(letter) ?? []
      arr.push(t)
      by.set(letter, arr)
    }
    return [...by.entries()]
  }, [query])

  // Scroll to and briefly highlight the term named in the URL hash.
  useEffect(() => {
    const slug = location.hash.replace('#', '')
    if (!slug) return
    const el = document.getElementById(slug)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('gloss-flash')
    const t = setTimeout(() => el.classList.remove('gloss-flash'), 1600)
    return () => clearTimeout(t)
  }, [location.hash])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center gap-2 text-xs">
        <Link to="/" className="text-ink-faint hover:text-ink-soft">
          Home
        </Link>
        <span className="text-ink-faint">/</span>
        <span className="text-ink-soft">Glossary</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Glossary</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">
        The vocabulary of systems design. Terms are linked from the walkthroughs — hover any dotted term
        to see its definition, or click through to here. {GLOSSARY.length} terms.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter terms…"
        className="mt-5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
      />

      {groups.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-faint">
          No terms match “{query}”.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-7">
          {groups.map(([letter, terms]) => (
            <section key={letter}>
              <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {letter}
              </div>
              <dl className="flex flex-col gap-2.5">
                {terms.map((t) => (
                  <div
                    key={t.slug}
                    id={t.slug}
                    className="scroll-mt-6 rounded-xl border border-border bg-surface/60 px-4 py-3"
                  >
                    <dt className="text-[15px] font-semibold text-ink">{t.term}</dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-ink-soft">{t.short}</dd>
                    {t.aliases && t.aliases.length > 0 && (
                      <div className="mt-1 font-mono text-[10.5px] text-ink-faint">
                        also: {t.aliases.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
