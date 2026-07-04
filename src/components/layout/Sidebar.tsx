import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CATEGORIES } from '../../data/categories'
import { architecturesByCategory } from '../../data/architectures'
import { JOURNEYS } from '../../data/journeys'
import { LENS_BY_ID, tierFor, tierColor, severity } from '../../data/ratings'
import { useJourneyProgress } from '../../lib/progress'
import { useLens } from '../../context/LensContext'
import { LensToggle } from './LensToggle'

export function Sidebar({
  onNavigate,
  onSearch,
}: {
  onNavigate?: () => void
  onSearch?: () => void
}) {
  const { lens } = useLens()
  const lensMeta = LENS_BY_ID[lens]

  return (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto p-5">
      <NavLink to="/" onClick={onNavigate} className="flex items-center gap-2.5">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-8 w-8" />
        <div>
          <div className="text-sm font-bold leading-tight text-ink">Common Architectures</div>
          <div className="text-[11px] leading-tight text-ink-faint">a visual systems-design guide</div>
        </div>
      </NavLink>

      {onSearch && (
        <button
          onClick={onSearch}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px] text-ink-faint transition hover:border-border-strong hover:text-ink-soft"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded border border-border bg-surface-2 px-1 font-mono text-[10px]">⌘K</kbd>
        </button>
      )}

      <div className="flex flex-col gap-2.5">
        <LensToggle />
        {/* Legend sits directly under the selector, ordered green → pink (approachable → edge). */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-ink-soft">
          {([0, 1, 2] as const).map((s) => {
            const tier = (lens === 'prevalence' ? 2 - s : s) as 0 | 1 | 2
            return (
              <span key={s} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: tierColor(lens, tier) }} />
                {lensMeta.tiers[tier]}
              </span>
            )
          })}
        </div>
      </div>

      <div>
        <NavLink
          to="/journeys"
          onClick={onNavigate}
          className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint transition hover:text-ink-soft"
        >
          Journeys
        </NavLink>
        <div className="flex flex-col gap-0.5">
          {JOURNEYS.map((j) => (
            <JourneySidebarLink key={j.slug} slug={j.slug} title={j.title} accent={j.accent} total={j.stages.length} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {CATEGORIES.map((cat) => {
          // Climb: order concepts green → pink (approachable → edge) for the active lens.
          const items = [...architecturesByCategory(cat.id)].sort(
            (a, b) => severity(lens, tierFor(a.slug, lens)) - severity(lens, tierFor(b.slug, lens)),
          )
          return (
            <div key={cat.id}>
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {cat.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {items.length === 0 && (
                  <span className="px-2 py-1.5 text-[12px] italic text-ink-faint/70">Coming soon</span>
                )}
                {items.map((a) => (
                  <motion.div key={a.slug} layout transition={{ type: 'spring', stiffness: 520, damping: 42 }}>
                    <NavLink
                      to={`/a/${a.slug}`}
                      onClick={onNavigate}
                      title={`${lensMeta.legendTitle}: ${lensMeta.tiers[tierFor(a.slug, lens)]}`}
                      className={({ isActive }) =>
                        `group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition ${
                          isActive
                            ? 'bg-accent/15 text-ink'
                            : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
                        }`
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 flex-none rounded-full transition-colors"
                        style={{ background: tierColor(lens, tierFor(a.slug, lens)) }}
                      />
                      {a.title}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 px-2 pt-4">
        <NavLink
          to="/glossary"
          onClick={onNavigate}
          className="flex items-center gap-1.5 text-[11px] text-ink-faint transition hover:text-ink-soft"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </svg>
          Glossary
        </NavLink>
        <NavLink
          to="/feedback"
          onClick={onNavigate}
          className="flex items-center gap-1.5 text-[11px] text-ink-faint transition hover:text-ink-soft"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Feedback inbox
        </NavLink>
        <div className="text-[11px] leading-relaxed text-ink-faint">
          <kbd className="rounded bg-surface-2 px-1">←</kbd>{' '}
          <kbd className="rounded bg-surface-2 px-1">→</kbd> to step, {' '}
          <kbd className="rounded bg-surface-2 px-1">space</kbd> to play.
        </div>
      </div>
    </nav>
  )
}

function JourneySidebarLink({
  slug,
  title,
  accent,
  total,
  onNavigate,
}: {
  slug: string
  title: string
  accent: string
  total: number
  onNavigate?: () => void
}) {
  const done = useJourneyProgress(slug)
  const count = done.size
  return (
    <NavLink
      to={`/j/${slug}`}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition ${
          isActive ? 'bg-accent/15 text-ink' : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
        }`
      }
    >
      <span
        className="h-1.5 w-1.5 flex-none rounded-full"
        style={{ background: accent, opacity: count > 0 ? 1 : 0.45 }}
      />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {count > 0 && (
        <span className="flex-none font-mono text-[10px] text-ink-faint">
          {count >= total ? '✓' : `${count}/${total}`}
        </span>
      )}
    </NavLink>
  )
}
