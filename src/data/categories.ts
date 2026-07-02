import type { CategoryMeta } from '../types'

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'core-web',
    label: 'Core web infrastructure',
    blurb: 'How requests travel from a browser to your servers and back.',
  },
  {
    id: 'data-scaling',
    label: 'Data & scaling',
    blurb: 'Growing a database past a single machine without losing your mind.',
  },
  {
    id: 'async',
    label: 'Async & messaging',
    blurb: 'Decoupling work with queues, events, and background processing.',
  },
  {
    id: 'distributed',
    label: 'Distributed patterns',
    blurb: 'Coordination, resilience, and failure handling across services.',
  },
  {
    id: 'delivery',
    label: 'Deployment & delivery',
    blurb: 'Shipping new versions safely, and scaling to meet demand.',
  },
  {
    id: 'observability',
    label: 'Observability',
    blurb: 'Knowing what your running system is actually doing.',
  },
  {
    id: 'security',
    label: 'Security & auth',
    blurb: 'Authenticating requests and shielding services from abuse.',
  },
]

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
)
