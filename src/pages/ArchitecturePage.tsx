import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getArchitecture } from '../data/architectures'
import { CATEGORY_LABEL } from '../data/categories'
import { getJourney } from '../data/journeys'
import { LENSES, tierFor, tierColor } from '../data/ratings'
import { RELATED } from '../data/related'
import { useLens } from '../context/LensContext'
import { StepPlayer } from '../components/StepPlayer'
import { NotFoundPage } from './NotFoundPage'

export function ArchitecturePage() {
  const { slug } = useParams()
  const arch = slug ? getArchitecture(slug) : undefined
  // Set when this page was reached from a journey stage — offer the way back.
  const from = (useLocation().state ?? {}) as { journey?: string; stage?: number }
  const journey = from.journey ? getJourney(from.journey) : undefined

  if (!arch) return <NotFoundPage />
  const Content = arch.content

  return (
    <motion.article
      key={arch.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-5xl"
    >
      {journey && (
        <Link
          to={`/j/${journey.slug}`}
          className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:brightness-110"
          style={{ borderColor: `${journey.accent}55`, background: `${journey.accent}14`, color: journey.accent }}
        >
          ← Back to journey: {journey.title}
          {typeof from.stage === 'number' && (
            <span className="font-mono opacity-70">stage {from.stage + 1}</span>
          )}
        </Link>
      )}
      <div className="mb-1 flex items-center gap-2 text-xs">
        <Link to="/" className="text-ink-faint hover:text-ink-soft">
          Home
        </Link>
        <span className="text-ink-faint">/</span>
        <span className="text-ink-soft">{CATEGORY_LABEL[arch.category]}</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{arch.title}</h1>
      <p className="mt-1.5 text-base text-ink-soft">{arch.tagline}</p>

      <div className="mt-6">
        <StepPlayer arch={arch} />
      </div>

      <div className="mt-12 grid gap-8 border-t border-border pt-8 lg:grid-cols-[1fr_260px]">
        <div className="prose-arch min-w-0">
          <Content />
        </div>
        <aside className="order-first lg:order-none">
          <div className="rounded-2xl border border-border bg-surface/60 p-4 lg:sticky lg:top-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              At a glance
            </div>
            <dl className="mt-3 flex flex-col gap-2.5 text-sm">
              <div>
                <dt className="text-ink-faint">Category</dt>
                <dd className="text-ink">{CATEGORY_LABEL[arch.category]}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Steps</dt>
                <dd className="text-ink">{arch.steps.length}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                Ratings
              </div>
              <dl className="flex flex-col gap-2 text-sm">
                {LENSES.map((l) => {
                  const tier = tierFor(arch.slug, l.id)
                  const c = tierColor(l.id, tier)
                  return (
                    <div key={l.id} className="flex items-center justify-between gap-2">
                      <dt className="text-ink-faint" title={l.blurb}>
                        {l.legendTitle}
                      </dt>
                      <dd className="flex items-center gap-1.5 font-medium" style={{ color: c }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                        {l.tiers[tier]}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </div>
        </aside>
      </div>

      <RelatedPatterns slug={arch.slug} />
    </motion.article>
  )
}

/** Curated neighbors — complements, contrasts, prerequisites. */
function RelatedPatterns({ slug }: { slug: string }) {
  const { lens } = useLens()
  const related = (RELATED[slug] ?? [])
    .map((s) => getArchitecture(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
  if (related.length === 0) return null
  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        Related patterns
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((a) => {
          const tier = tierFor(a.slug, lens)
          return (
            <Link
              key={a.slug}
              to={`/a/${a.slug}`}
              className="group rounded-xl border border-border bg-surface/60 px-4 py-3 transition hover:border-border-strong"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: tierColor(lens, tier) }}
                />
                <span className="text-[13.5px] font-semibold text-ink group-hover:text-white">
                  {a.title}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{a.tagline}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
