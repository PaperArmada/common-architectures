import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Lens } from '../data/ratings'

const STORAGE_KEY = 'ca-lens'

interface LensState {
  lens: Lens
  setLens: (l: Lens) => void
}

const LensContext = createContext<LensState>({ lens: 'conceptual', setLens: () => {} })

function readInitial(): Lens {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'conceptual' || stored === 'operational' || stored === 'prevalence') return stored
  } catch {
    // localStorage unavailable — fall through to default
  }
  return 'conceptual'
}

export function LensProvider({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<Lens>(readInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lens)
    } catch {
      // ignore write failures (private mode, etc.)
    }
  }, [lens])

  return <LensContext.Provider value={{ lens, setLens }}>{children}</LensContext.Provider>
}

export function useLens() {
  return useContext(LensContext)
}
