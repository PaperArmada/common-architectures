import { LENSES } from '../../data/ratings'
import { useLens } from '../../context/LensContext'

export function LensToggle() {
  const { lens, setLens } = useLens()
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        Rate by
      </div>
      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        {LENSES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLens(l.id)}
            title={l.blurb}
            aria-pressed={lens === l.id}
            className={`flex-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition ${
              lens === l.id ? 'bg-accent/20 text-ink' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}
