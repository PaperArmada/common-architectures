import { AnimatePresence, motion } from 'framer-motion'
import { LENSES } from '../../data/ratings'
import { useLens } from '../../context/LensContext'

/**
 * A "lazy Susan" rotary control: click to rotate to the next rating lens,
 * one notch at a time. The label rolls over like a drum and the dial icon
 * spins a quarter turn, reinforcing the rotate metaphor.
 */
export function LensToggle() {
  const { lens, setLens } = useLens()
  const idx = Math.max(0, LENSES.findIndex((l) => l.id === lens))
  const current = LENSES[idx]
  const advance = () => setLens(LENSES[(idx + 1) % LENSES.length].id)

  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        Rate by
      </div>
      <button
        onClick={advance}
        title={`${current.blurb} — click to rotate`}
        aria-label={`Rating lens: ${current.label}. Click to rotate.`}
        className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-left transition hover:border-border-strong"
      >
        <motion.span
          key={`dial-${lens}`}
          className="flex-none text-ink-faint group-hover:text-accent"
          initial={{ rotate: -90 }}
          animate={{ rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 15 }}
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 1 3 6.7" />
            <path d="M3 20v-5h5" />
          </svg>
        </motion.span>

        <span className="relative h-4 flex-1 overflow-hidden [perspective:500px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={lens}
              className="absolute inset-0 block text-[12.5px] font-semibold text-ink"
              initial={{ rotateX: -85, opacity: 0, y: 7 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              exit={{ rotateX: 85, opacity: 0, y: -7 }}
              transition={{ duration: 0.34, ease: 'easeOut' }}
              style={{ transformOrigin: 'center' }}
            >
              {current.label}
            </motion.span>
          </AnimatePresence>
        </span>

        <span className="flex flex-none items-center gap-1" aria-hidden>
          {LENSES.map((l, i) => (
            <span
              key={l.id}
              className="h-1 w-1 rounded-full transition-colors"
              style={{ background: i === idx ? 'var(--color-accent)' : 'var(--color-border-strong)' }}
            />
          ))}
        </span>
      </button>
    </div>
  )
}
