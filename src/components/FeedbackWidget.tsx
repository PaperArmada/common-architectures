import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { addFeedback, useFeedbackList } from '../lib/feedback'
import { getArchitecture } from '../data/architectures'
import { FEEDBACK_ENDPOINT, GITHUB_REPO } from '../config'

/** Friendly label for the current route. */
function pageLabel(pathname: string): string {
  if (pathname === '/') return 'Home'
  if (pathname === '/feedback') return 'Feedback inbox'
  const m = pathname.match(/^\/a\/(.+)$/)
  if (m) return getArchitecture(m[1])?.title ?? m[1]
  return pathname
}

function githubIssueUrl(page: string, path: string, text: string): string {
  const title = `Feedback: ${page}`
  const body = `${text}\n\n---\n_Page: ${page} (\`${path}\`)_`
  return `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(
    title,
  )}&body=${encodeURIComponent(body)}`
}

type SendState = 'idle' | 'sending' | 'sent' | 'error'

export function FeedbackWidget() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [state, setState] = useState<SendState>('idle')
  const all = useFeedbackList()

  if (loc.pathname === '/feedback') return null

  const label = pageLabel(loc.pathname)
  const trimmed = text.trim()

  // Always keep a local copy (owner's review notes), regardless of path.
  const saveLocal = () => addFeedback({ path: loc.pathname, page: label, text: trimmed })

  const sendForm = async () => {
    if (!trimmed) return
    saveLocal()
    if (!FEEDBACK_ENDPOINT) {
      // No endpoint configured — the local copy is all we can do here.
      setState('sent')
      setText('')
      setTimeout(() => setState('idle'), 1800)
      return
    }
    setState('sending')
    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ page: label, path: loc.pathname, message: trimmed }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setState('sent')
      setText('')
      setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2500)
    }
  }

  const openGithub = () => {
    if (!trimmed) return
    saveLocal()
    window.open(githubIssueUrl(label, loc.pathname, trimmed), '_blank', 'noopener')
    setText('')
    setOpen(false)
  }

  const primaryLabel =
    state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent ✓' : state === 'error' ? 'Failed — retry' : 'Send'

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-[min(310px,calc(100vw-2rem))] rounded-2xl border border-border bg-surface/95 p-4 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Leave feedback</span>
              <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink" aria-label="Close">
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
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') sendForm()
              }}
              rows={4}
              placeholder="What worked, what confused you, what's missing…"
              className="mt-2 w-full resize-none rounded-lg border border-border bg-canvas/60 p-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />

            <button
              onClick={sendForm}
              disabled={!trimmed || state === 'sending'}
              className="mt-2 w-full rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-[13px] font-semibold text-ink transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {primaryLabel}
            </button>

            <button
              onClick={openGithub}
              disabled={!trimmed}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-ink-soft transition hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
              </svg>
              Open a GitHub issue ↗
            </button>

            {state === 'error' && (
              <p className="mt-1.5 text-[11px] text-danger">Couldn’t reach the form endpoint — try GitHub instead.</p>
            )}

            <div className="mt-2 text-right">
              <Link to="/feedback" onClick={() => setOpen(false)} className="text-[11px] text-ink-faint hover:text-ink-soft">
                Your saved notes ({all.length})
              </Link>
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
          <span className="rounded-full bg-accent/25 px-1.5 py-0.5 font-mono text-[10px] text-accent">{all.length}</span>
        )}
      </button>
    </div>
  )
}
