import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <div className="font-mono text-5xl font-bold text-ink-faint">404</div>
      <h1 className="mt-4 text-xl font-bold text-ink">This walkthrough doesn't exist (yet)</h1>
      <p className="mt-2 text-sm text-ink-soft">
        The architecture you're looking for isn't here. Head back and pick one from the list.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-accent/25"
      >
        ← Back to all architectures
      </Link>
    </div>
  )
}
