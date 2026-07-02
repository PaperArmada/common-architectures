import { NavLink } from 'react-router-dom'
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

      <LensToggle />

      <div className="flex flex-col gap-5">
        {CATEGORIES.map((cat) => {
          const items = architecturesByCategory(cat.id)
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
                  <NavLink
                    key={a.slug}
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
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 px-2 pt-4">
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {lensMeta.legendTitle}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-soft">
            {lensMeta.tiers.map((label, tier) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: TIER_COLOR[tier] }} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="text-[11px] leading-relaxed text-ink-faint">
          <kbd className="rounded bg-surface-2 px-1">←</kbd>{' '}
          <kbd className="rounded bg-surface-2 px-1">→</kbd> to step, {' '}
          <kbd className="rounded bg-surface-2 px-1">space</kbd> to play.
        </div>
      </div>
    </nav>
  )
}
