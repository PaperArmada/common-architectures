import { useEffect, useState } from 'react'

/**
 * Journey progress, persisted per-browser in localStorage.
 * Shape: { [journeySlug]: [completedStageId, ...] }
 */

const KEY = 'ca-journey-progress'
const EVENT = 'ca-progress-change'

type ProgressMap = Record<string, string[]>

function read(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ProgressMap) : {}
  } catch {
    return {}
  }
}

function write(map: ProgressMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // ignore (private mode, quota)
  }
  window.dispatchEvent(new Event(EVENT))
}

export function completedStages(journey: string): Set<string> {
  return new Set(read()[journey] ?? [])
}

export function setStageDone(journey: string, stage: string, done: boolean) {
  const map = read()
  const set = new Set(map[journey] ?? [])
  if (done) set.add(stage)
  else set.delete(stage)
  map[journey] = [...set]
  write(map)
}

export function resetJourney(journey: string) {
  const map = read()
  delete map[journey]
  write(map)
}

/** Live-updating set of completed stage ids for one journey. */
export function useJourneyProgress(journey: string): Set<string> {
  const [done, setDone] = useState<Set<string>>(() => completedStages(journey))
  useEffect(() => {
    const sync = () => setDone(completedStages(journey))
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [journey])
  return done
}
