import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearFeedback, removeFeedback, useFeedbackList, type FeedbackEntry } from '../lib/feedback'

function fmt(ts: number) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return String(ts)
  }
}

export function FeedbackPage() {
  const list = useFeedbackList()
  const [copied, setCopied] = useState(false)

  // Group by page, newest first within each group.
  const groups = useMemo(() => {
    const by = new Map<string, FeedbackEntry[]>()
    for (const f of [...list].sort((a, b) => b.ts - a.ts)) {
      const arr = by.get(f.page) ?? []
      arr.push(f)
      by.set(f.page, arr)
    }
    return [...by.entries()]
  }, [list])

  const asText = () =>
    groups
      .map(([page, items]) =>
        [`## ${page}`, ...items.map((f) => `- [${fmt(f.ts)}] ${f.text}`)].join('\n'),
      )
      .join('\n\n')

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(asText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'feedback.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center gap-2 text-xs">
        <Link to="/" className="text-ink-faint hover:text-ink-soft">
          Home
        </Link>
        <span className="text-ink-faint">/</span>
        <span className="text-ink-soft">Feedback inbox</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Feedback inbox</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">
        Comments left through the widget, grouped by page. {list.length} total.
      </p>

      <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[13px] text-ink-soft">
        <strong className="text-ink">Stored in this browser only.</strong> This aggregator keeps
        comments in <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">localStorage</code>,
        so it captures notes from <em>this</em> device — perfect for your own review pass, but it can’t
        gather other visitors’ feedback onto one place without a backend. To collect from everyone, wire
        the widget to a hosted form endpoint or prefilled GitHub issues (ask and I’ll add it).
      </div>

      {list.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={copyAll}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink"
          >
            {copied ? 'Copied ✓' : 'Copy all'}
          </button>
          <button
            onClick={exportJson}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink"
          >
            Export JSON
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all feedback from this browser? This cannot be undone.')) clearFeedback()
            }}
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm text-danger transition hover:bg-danger/20"
          >
            Clear all
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-ink-faint">
          No feedback yet. Use the <span className="text-ink-soft">Feedback</span> button on any page to
          jot a note — it’ll show up here.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {groups.map(([page, items]) => (
            <section key={page}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2 className="text-base font-bold text-ink">{page}</h2>
                <span className="font-mono text-xs text-ink-faint">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((f) => (
                  <div
                    key={f.id}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{f.text}</p>
                      <div className="mt-1 font-mono text-[10.5px] text-ink-faint">{fmt(f.ts)}</div>
                    </div>
                    <button
                      onClick={() => removeFeedback(f.id)}
                      className="flex-none text-ink-faint opacity-0 transition hover:text-danger group-hover:opacity-100"
                      aria-label="Delete comment"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
