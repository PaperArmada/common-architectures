import { useEffect, useState } from 'react'

/**
 * A tiny client-side feedback aggregator backed by localStorage.
 *
 * NOTE ON SCOPE: this stores comments in the visitor's OWN browser only. It is
 * great for the owner's review notes while clicking through, but it does NOT
 * gather feedback from other people onto one server — a static site can't do
 * that without a backend. See the app's docs for the hosted-form upgrade path.
 */

export interface FeedbackEntry {
  id: string
  ts: number
  /** Route the comment was left on, e.g. /a/load-balancer. */
  path: string
  /** Friendly page label, e.g. "Load Balancer". */
  page: string
  text: string
}

const KEY = 'ca-feedback'
export const FEEDBACK_EVENT = 'ca-feedback-change'

export function getFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as FeedbackEntry[]) : []
  } catch {
    return []
  }
}

function save(list: FeedbackEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // ignore write failures (private mode, quota)
  }
  window.dispatchEvent(new Event(FEEDBACK_EVENT))
}

export function addFeedback(entry: Pick<FeedbackEntry, 'path' | 'page' | 'text'>) {
  const list = getFeedback()
  list.push({
    ...entry,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
  })
  save(list)
}

export function removeFeedback(id: string) {
  save(getFeedback().filter((f) => f.id !== id))
}

export function clearFeedback() {
  save([])
}

/** Live-updating list of all stored feedback. */
export function useFeedbackList(): FeedbackEntry[] {
  const [list, setList] = useState<FeedbackEntry[]>(getFeedback)
  useEffect(() => {
    const sync = () => setList(getFeedback())
    window.addEventListener(FEEDBACK_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(FEEDBACK_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return list
}
