import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { HomePage } from './pages/HomePage'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { FeedbackPage } from './pages/FeedbackPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { FeedbackWidget } from './components/FeedbackWidget'
import { SearchPalette } from './components/SearchPalette'
import { LensProvider } from './context/LensContext'

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Global hotkeys: ⌘K / Ctrl+K anywhere, or "/" when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
        return
      }
      const t = e.target as HTMLElement | null
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if (e.key === '/' && !typing && !searchOpen) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  return (
    <LensProvider>
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-none border-r border-border lg:block">
        <Sidebar onSearch={() => setSearchOpen(true)} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-canvas">
            <Sidebar
              onNavigate={() => setMobileOpen(false)}
              onSearch={() => {
                setMobileOpen(false)
                setSearchOpen(true)
              }}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-canvas/85 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-border p-2 text-ink-soft"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="flex-1 text-sm font-bold text-ink">Common Architectures</span>
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg border border-border p-2 text-ink-soft"
            aria-label="Search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-8 sm:pb-10 sm:pt-7 lg:px-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/a/:slug" element={<ArchitecturePage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <FeedbackWidget />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
    </LensProvider>
  )
}
