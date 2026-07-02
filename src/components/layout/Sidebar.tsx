import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CATEGORIES } from '../../data/categories'
import { architecturesByCategory } from '../../data/architectures'
import { LENS_BY_ID, tierFor, TIER_COLOR } from '../../data/ratings'
import { useLens } from '../../context/LensContext'
import { LensToggle } from './LensToggle'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
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

      <div className="flex flex-col gap-2.5">
        <LensToggle />
        {/* Legend sits directly under the selector, keyed to the active lens. */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-ink-soft">
          {lensMeta.tiers.map((label, tier) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: TIER_COLOR[tier] }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {CATEGORIES.map((cat) => {
          // Climb: order concepts ascending by the active lens's tier (stable within a tier).
          const items = [...architecturesByCategory(cat.id)].sort(
            (a, b) => tierFor(a.slug, lens) - tierFor(b.slug, lens),
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
                        style={{ background: TIER_COLOR[tierFor(a.slug, lens)] }}
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
