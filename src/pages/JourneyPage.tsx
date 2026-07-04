import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Step } from '../types'
import { getJourney } from '../data/journeys'
import { getArchitecture } from '../data/architectures'
import { LENS_BY_ID, tierFor, tierColor } from '../data/ratings'
import { useLens } from '../context/LensContext'
import { resetJourney, setStageDone, useJourneyProgress } from '../lib/progress'
import { Diagram } from '../components/diagram/Diagram'
import { NotFoundPage } from './NotFoundPage'

export function JourneyPage() {
  const { slug } = useParams()
  const journey = slug ? getJourney(slug) : undefined
  const done = useJourneyProgress(slug ?? '')
  const [index, setIndex] = useState(0)
  const [bump, setBump] = useState(0)
  const { lens } = useLens()

  // Start at the first incomplete stage when entering a journey.
  useEffect(() => {
    if (!journey) return
    const first = journey.stages.findIndex((s) => !completedHas(s.id))
    setIndex(first === -1 ? 0 : first)
    setBump((b) => b + 1)
    // Only on journey change — `done` updating mid-visit must not yank the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.slug])

  // Snapshot completion at mount time for the effect above.
  function completedHas(id: string) {
    return done.has(id)
  }

  const total = journey?.stages.length ?? 0

  const go = (next: number) => {
    if (!journey) return
    const clamped = Math.max(0, Math.min(total - 1, next))
    setIndex(clamped)
    setBump((b) => b + 1)
  }

  // Keyboard nav (guarded so typing elsewhere isn't hijacked).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Cumulative reveal: the system grows as stages advance.
  const { nodes, edges } = useMemo(() => {
    if (!journey) return { nodes: [], edges: [] }
    const visibleNodes = new Set<string>()
    const visibleEdges = new Set<string>()
    for (let i = 0; i <= index; i++) {
      const st = journey.stages[i]
      st.reveals?.forEach((n) => visibleNodes.add(n))
      st.revealEdges?.forEach((e) => visibleEdges.add(e))
      st.retireEdges?.forEach((e) => visibleEdges.delete(e))
    }
    return {
      nodes: journey.nodes.filter((n) => visibleNodes.has(n.id)),
      edges: journey.edges.filter((e) => visibleEdges.has(e.id)),
    }
  }, [journey, index])

  if (!journey) return <NotFoundPage />

  const stage = journey.stages[index]
  const step: Step = {
    id: stage.id,
    title: stage.title,
    description: stage.fix,
    ...stage.scene,
  }
  const isDone = done.has(stage.id)
  const doneCount = journey.stages.filter((s) => done.has(s.id)).length
  const atEnd = index === total - 1
  const lensMeta = LENS_BY_ID[lens]

  const completeAndContinue = () => {
    if (!isDone) setStageDone(journey.slug, stage.id, true)
    if (!atEnd) go(index + 1)
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-1 flex items-center gap-2 text-xs">
        <Link to="/" className="text-ink-faint hover:text-ink-soft">
          Home
        </Link>
        <span className="text-ink-faint">/</span>
        <Link to="/journeys" className="text-ink-faint hover:text-ink-soft">
          Journeys
        </Link>
        <span className="text-ink-faint">/</span>
        <span className="text-ink-soft">{journey.title}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{journey.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{journey.tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-faint">
            {doneCount}/{total} stages
          </span>
          {doneCount > 0 && (
            <button
              onClick={() => {
                if (confirm('Reset your progress on this journey?')) resetJourney(journey.slug)
              }}
              className="rounded-lg border border-border px-2.5 py-1 text-xs text-ink-faint transition hover:border-border-strong hover:text-ink-soft"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {/* progress track */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${(doneCount / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          style={{ background: journey.accent }}
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:gap-5">
        {/* Stage — the growing system */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
            <Diagram nodes={nodes} edges={edges} step={step} stepKey={index * 1000 + bump} accent={journey.accent} />
          </div>

          {/* Transport */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            >
              ← Prev
            </button>
            <button
              onClick={() => go(index + 1)}
              disabled={atEnd}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next →
            </button>
            <button
              onClick={() => setBump((b) => b + 1)}
              className="ml-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink"
              aria-label="Replay this stage's animation"
            >
              ⟲ Replay
            </button>
          </div>

          {/* Stage dots: done = journey accent fill, current = ring */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {journey.stages.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                title={s.title}
                className="h-1.5 flex-1 rounded-full transition"
                style={{
                  minWidth: 18,
                  background:
                    i === index
                      ? journey.accent
                      : done.has(s.id)
                        ? `${journey.accent}66`
                        : 'var(--color-border)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Narration */}
        <div className="lg:w-[380px] lg:flex-none">
          <div className="rounded-2xl border border-border bg-surface/70 p-5 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink-faint">
                Stage {index + 1} / {total}
              </span>
              {isDone && (
                <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-medium" style={{ color: journey.accent, background: `${journey.accent}1f` }}>
                  done ✓
                </span>
              )}
            </div>

            {/* Keyed fade-in, no exit phase (same rationale as StepPlayer). */}
            <motion.div key={stage.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
              {/* The wall */}
              <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3.5 py-2.5">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
                  The wall
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{stage.wall}</p>
              </div>

              <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{stage.fix}</p>

              {/* Patterns introduced at this stage */}
              {stage.archSlugs.length > 0 && (
                <div className="mt-4">
                  <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    {atEnd && stage.reveals === undefined ? 'Where to go next' : 'Walk through the pattern'}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {stage.archSlugs.map((s) => {
                      const a = getArchitecture(s)
                      if (!a) return null
                      const tier = tierFor(a.slug, lens)
                      return (
                        <Link
                          key={s}
                          to={`/a/${s}`}
                          state={{ journey: journey.slug, stage: index }}
                          className="group flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 transition hover:border-border-strong"
                        >
                          <span
                            className="h-1.5 w-1.5 flex-none rounded-full"
                            style={{ background: tierColor(lens, tier) }}
                            title={`${lensMeta.legendTitle}: ${lensMeta.tiers[tier]}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold text-ink">{a.title}</span>
                            <span className="block truncate text-[11px] text-ink-faint">{a.tagline}</span>
                          </span>
                          <span className="flex-none text-xs text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-ink-soft">
                            →
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Primary action */}
            <button
              onClick={completeAndContinue}
              className="mt-4 w-full rounded-lg px-3 py-2.5 text-[13px] font-semibold text-ink transition"
              style={{
                background: `${journey.accent}26`,
                border: `1px solid ${journey.accent}66`,
              }}
            >
              {atEnd
                ? isDone
                  ? 'Journey complete ✓'
                  : 'Mark final stage complete'
                : isDone
                  ? 'Continue →'
                  : 'Mark complete & continue →'}
            </button>
            {isDone && (
              <button
                onClick={() => setStageDone(journey.slug, stage.id, false)}
                className="mt-1.5 w-full text-center text-[11px] text-ink-faint hover:text-ink-soft"
              >
                Un-mark this stage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
