// App-level configuration for feedback delivery.

/** Repo used for the "open a GitHub issue" feedback path. */
export const GITHUB_REPO = 'PaperArmada/common-architectures'

/**
 * Hosted form endpoint for the "quick form" feedback path — a Formspree, Tally,
 * Basin, etc. URL. When set, the widget POSTs comments there so you receive
 * them from any visitor.
 *
 * Set it either by pasting the URL below, or via a build-time env var
 * (VITE_FEEDBACK_ENDPOINT). Leave empty to hide the quick-form option and rely
 * on the GitHub-issue path only.
 *
 * Example: 'https://formspree.io/f/xxxxxxx'
 */
export const FEEDBACK_ENDPOINT: string =
  (import.meta.env.VITE_FEEDBACK_ENDPOINT as string | undefined)?.trim() || ''
