import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { addFeedback, useFeedbackList } from '../lib/feedback'
import { getArchitecture } from '../data/architectures'

/** Friendly label for the current route. */
function pageLabel(pathname: string): string {
  if (pathname === '/') return 'Home'
  if (pathname === '/feedback') return 'Feedback inbox'
  const m = pathname.match(/^\/a\/(.+)$/)
  if (m) return getArchitecture(m[1])?.title ?? m[1]
  return pathname
}

export function FeedbackWidget() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const all = useFeedbackList()

  // Don't overlay the widget on the inbox page itself.
  if (loc.pathname === '/feedback') return null

  const label = pageLabel(loc.pathname)

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    addFeedback({ path: loc.pathname, page: label, text: trimmed })
    setText('')
    setSent(true)
    setTimeout(() => setSent(false), 1800)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-[300px] rounded-2xl border border-border bg-surface/95 p-4 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Leave feedback</span>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-faint hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-[11px] text-ink-faint">
              On: <span className="text-ink-soft">{label}</span>
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
              }}
              rows={4}
              placeholder="What worked, what confused you, what's missing…"
              className="mt-2 w-full resize-none rounded-lg border border-border bg-canvas/60 p-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <Link
                to="/feedback"
                onClick={() => setOpen(false)}
                className="text-[11px] text-ink-faint hover:text-ink-soft"
              >
                Inbox ({all.length})
              </Link>
              <button
                onClick={submit}
                disabled={!text.trim()}
                className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sent ? 'Saved ✓' : 'Send'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border-strong bg-surface/90 px-4 py-2.5 text-[13px] font-semibold text-ink shadow-lg backdrop-blur transition hover:border-accent"
        aria-label="Leave feedback"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Feedback
        {all.length > 0 && (
          <span className="rounded-full bg-accent/25 px-1.5 py-0.5 font-mono text-[10px] text-accent">
            {all.length}
          </span>
        )}
      </button>
    </div>
  )
}
