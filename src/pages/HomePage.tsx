import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CATEGORIES } from '../data/categories'
import { architecturesByCategory } from '../data/architectures'
import { JOURNEYS } from '../data/journeys'
import { JourneyCard } from '../components/JourneyCard'
import { NodeIcon, NODE_STYLES } from '../components/diagram/nodeStyles'
import { LENS_BY_ID, tierFor, tierColor, severity } from '../data/ratings'
import { useLens } from '../context/LensContext'
import type { Architecture } from '../types'

export function HomePage() {
  const { lens } = useLens()
  return (
    <div className="mx-auto max-w-4xl">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-10"
      >
        <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-ink-soft">
          systems design, visualized
        </span>
        <h1 className="mt-4 bg-gradient-to-br from-white to-[#a9b4d6] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          See how deployed software
          <br className="hidden sm:block" /> is actually put together.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
          Clean, richly animated, step-by-step walkthroughs of the architectures behind real systems —
          from load balancers and CDNs to sharding and CQRS. Step through each flow at your own pace and
          watch requests, writes, and failures move through the system.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="pb-12"
      >
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-bold text-ink">Not sure where to start?</h2>
            <span className="hidden text-sm text-ink-faint sm:inline">
              Follow a journey — each stage hits a wall, then adds the pattern that fixes it.
            </span>
          </div>
          <Link to="/journeys" className="flex-none text-sm font-medium text-accent hover:underline">
            All journeys →
          </Link>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {JOURNEYS.map((j) => (
            <JourneyCard key={j.slug} journey={j} />
          ))}
        </div>
      </motion.section>

      <div className="flex flex-col gap-10">
        {CATEGORIES.map((cat) => {
          // Climb: order green → pink (approachable → edge) for the active lens.
          const items = [...architecturesByCategory(cat.id)].sort(
            (a, b) => severity(lens, tierFor(a.slug, lens)) - severity(lens, tierFor(b.slug, lens)),
          )
          return (
            <section key={cat.id}>
              <div className="mb-1 flex items-baseline gap-3">
                <h2 className="text-lg font-bold text-ink">{cat.label}</h2>
                <span className="text-sm text-ink-faint">{cat.blurb}</span>
              </div>
              {items.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-ink-faint">
                  More walkthroughs in this section are on the way.
                </div>
              ) : (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {items.map((a) => (
                    <ArchCard key={a.slug} arch={a} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function ArchCard({ arch }: { arch: Architecture }) {
  const preview = arch.nodes.slice(0, 4)
  const { lens } = useLens()
  const tier = tierFor(arch.slug, lens)
  const tierLabel = LENS_BY_ID[lens].tiers[tier]
  const badgeColor = tierColor(lens, tier)
  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
    >
      <Link
        to={`/a/${arch.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-border bg-surface/60 p-5 transition hover:border-border-strong"
      >
        <div className="flex items-center gap-2">
          {preview.map((n) => {
            const c = NODE_STYLES[n.kind].color
            return (
              <span
                key={n.id}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ color: c, background: `${c}1a`, border: `1px solid ${c}33` }}
              >
                <NodeIcon kind={n.kind} />
              </span>
            )
          })}
          <span
            className="ml-auto flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
            style={{ color: badgeColor }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: badgeColor }} />
            {tierLabel}
          </span>
        </div>
        <h3 className="mt-4 text-base font-bold text-ink group-hover:text-white">{arch.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{arch.tagline}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
          Walk through it
          <span className="transition group-hover:translate-x-0.5">→</span>
        </span>
      </Link>
    </motion.div>
  )
}
