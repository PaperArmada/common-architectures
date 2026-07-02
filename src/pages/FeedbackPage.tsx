import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearFeedback, removeFeedback, useFeedbackList, type FeedbackEntry } from '../lib/feedback'
import { GITHUB_REPO } from '../config'

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

  const issueTitle = `Feedback — ${list.length} note${list.length === 1 ? '' : 's'}`
  const githubIssueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(
    issueTitle,
  )}&body=${encodeURIComponent(asText())}`

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
        <strong className="text-ink">These notes live in this browser only.</strong> The widget saves
        each one to <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">localStorage</code>{' '}
        on <em>this</em> device — nothing is sent anywhere automatically. When you’re ready, turn the whole
        batch into a <strong className="text-ink">GitHub issue</strong>, or <strong className="text-ink">copy</strong> it
        to paste wherever you like. To collect from other visitors without this step, set{' '}
        <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">FEEDBACK_ENDPOINT</code> (Formspree/Tally/Basin)
        in <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">src/config.ts</code>.
      </div>

      {list.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              Share these notes (your action — nothing automatic)
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={githubIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-accent/25"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
                </svg>
                Create GitHub issue ↗
              </a>
              <button
                onClick={copyAll}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink-soft transition hover:border-border-strong hover:text-ink"
              >
                {copied ? 'Copied ✓' : 'Copy all (Markdown)'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
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
