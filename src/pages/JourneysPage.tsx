import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { JOURNEYS } from '../data/journeys'
import { JourneyCard } from '../components/JourneyCard'

export function JourneysPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-8"
      >
        <div className="mb-1 flex items-center gap-2 text-xs">
          <Link to="/" className="text-ink-faint hover:text-ink-soft">
            Home
          </Link>
          <span className="text-ink-faint">/</span>
          <span className="text-ink-soft">Journeys</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Guided journeys</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          Patterns make sense when you know the problem that forced them. Each journey follows one
          system's story: every stage opens with the wall it hits, then adds exactly the pattern that
          gets past it — and the architecture grows on screen as you go. Your progress is saved in this
          browser.
        </p>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-2">
        {JOURNEYS.map((j) => (
          <JourneyCard key={j.slug} journey={j} />
        ))}
      </div>
    </div>
  )
}
