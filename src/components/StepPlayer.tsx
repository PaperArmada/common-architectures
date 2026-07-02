import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Architecture } from '../types'
import { Diagram } from './diagram/Diagram'

const ACCENT = '#818cf8'
const AUTOPLAY_MS = 3600

export function StepPlayer({ arch }: { arch: Architecture }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [bump, setBump] = useState(0) // forces packet replay on the current step
  const steps = arch.steps
  const step = steps[index]

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, next))
      setIndex(clamped)
      setBump((b) => b + 1)
    },
    [steps.length],
  )

  // Autoplay
  useEffect(() => {
    if (!playing) return
    if (index >= steps.length - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [playing, index, steps.length, go])

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
      else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, go])

  const stepKey = useMemo(() => index * 1000 + bump, [index, bump])
  const atEnd = index === steps.length - 1

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
      {/* Stage */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
          <Diagram
            nodes={arch.nodes}
            edges={arch.edges}
            step={step}
            stepKey={stepKey}
            accent={ACCENT}
          />
          {/* annotations */}
          {step.annotations && step.annotations.length > 0 && (
            <div className="pointer-events-none absolute left-3 top-3 flex max-w-[70%] flex-col gap-1.5">
              <AnimatePresence mode="popLayout">
                {step.annotations.map((a) => (
                  <motion.span
                    key={a}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-fit rounded-full border border-border-strong bg-surface/85 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur"
                  >
                    {a}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Transport controls */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Previous step"
          >
            ← Prev
          </button>
          <button
            onClick={() => {
              if (atEnd) go(0)
              else setPlaying((p) => !p)
            }}
            className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-accent/25"
          >
            {atEnd ? '↺ Replay' : playing ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => go(index + 1)}
            disabled={atEnd}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Next step"
          >
            Next →
          </button>
          <button
            onClick={() => setBump((b) => b + 1)}
            className="ml-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink"
            aria-label="Replay this step's animation"
          >
            ⟲ Replay step
          </button>
        </div>

        {/* Step dots */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              title={s.title}
              className="h-1.5 flex-1 rounded-full transition"
              style={{
                minWidth: 18,
                background: i === index ? ACCENT : i < index ? '#3a4c78' : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Narration */}
      <div className="lg:w-[340px] lg:flex-none">
        <div className="sticky top-6 rounded-2xl border border-border bg-surface/70 p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-ink-faint">
              Step {index + 1} / {steps.length}
            </span>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-medium text-accent">
              {arch.title}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <h3 className="mt-3 text-lg font-bold leading-snug text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
