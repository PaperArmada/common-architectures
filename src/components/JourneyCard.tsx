import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Journey } from '../data/journeys'
import { useJourneyProgress } from '../lib/progress'

export function JourneyCard({ journey }: { journey: Journey }) {
  const done = useJourneyProgress(journey.slug)
  const total = journey.stages.length
  const count = journey.stages.filter((s) => done.has(s.id)).length
  const started = count > 0
  const finished = count === total

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
      <Link
        to={`/j/${journey.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-border bg-surface/60 p-5 transition hover:border-border-strong"
        style={{ borderLeft: `3px solid ${journey.accent}55` }}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
            style={{ color: journey.accent, background: `${journey.accent}1a` }}
          >
            journey · {total} stages
          </span>
          {started && (
            <span className="font-mono text-[11px] text-ink-faint">
              {finished ? 'complete ✓' : `${count}/${total}`}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-base font-bold text-ink group-hover:text-white">{journey.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{journey.tagline}</p>
        {/* progress track */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(count / total) * 100}%`, background: journey.accent }}
          />
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium" style={{ color: journey.accent }}>
          {finished ? 'Revisit' : started ? 'Continue' : 'Begin the journey'}
          <span className="transition group-hover:translate-x-0.5">→</span>
        </span>
      </Link>
    </motion.div>
  )
}
