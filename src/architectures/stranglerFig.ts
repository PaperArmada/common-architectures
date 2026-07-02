import type { Architecture } from '../types'
import content from '../content/strangler-fig.mdx'

const LEGACY = '#38bdf8'
const NEW = '#34d399'
const BACK = '#fbbf24'

export const stranglerFig: Architecture = {
  slug: 'strangler-fig',
  title: 'Strangler Fig',
  category: 'delivery',
  tagline: 'Migrate a monolith to services incrementally, keeping everything running the whole time.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 13, y: 50 },
    { id: 'facade', label: 'Facade', sublabel: 'proxy / routing', kind: 'gateway', x: 45, y: 50 },
    { id: 'mono', label: 'Monolith', sublabel: 'legacy', kind: 'server', x: 82, y: 28 },
    { id: 'svc', label: 'New service', sublabel: 'search', kind: 'server', x: 82, y: 72 },
  ],
  edges: [
    { id: 'e-c-f', from: 'client', to: 'facade' },
    { id: 'e-f-m', from: 'facade', to: 'mono' },
    { id: 'e-f-s', from: 'facade', to: 'svc' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'The monolith is risky — but so is a rewrite',
      description:
        'A big, aging system is dangerous to change, yet a big-bang rewrite (build a replacement for a year, switch over in one weekend) almost always fails. The strangler fig grows the new system around the old one.',
      activeNodes: ['client', 'mono'],
    },
    {
      id: 'facade',
      title: 'Put a facade in front — 100% to legacy',
      description:
        'A proxy or gateway sits in front of the monolith and, at first, routes all traffic straight through to it. Nothing changes for users; this step is invisible.',
      activeNodes: ['client', 'facade', 'mono'],
      activeEdges: ['e-c-f', 'e-f-m'],
      annotations: ['100% → monolith'],
      packets: [
        { from: 'client', to: 'facade', color: LEGACY, label: 'request' },
        { from: 'facade', to: 'mono', color: LEGACY, delay: 0.4 },
      ],
    },
    {
      id: 'peel',
      title: 'Peel off one capability',
      description:
        'Build one capability — say search — as a new service, then flip the facade so requests for /search go to it. Just that slice moves; nothing else is touched.',
      activeNodes: ['facade', 'svc'],
      activeEdges: ['e-c-f', 'e-f-s'],
      annotations: ['Route /search → new service'],
      packets: [
        { from: 'client', to: 'facade', color: NEW, label: 'GET /search' },
        { from: 'facade', to: 'svc', color: NEW, delay: 0.4 },
      ],
    },
    {
      id: 'parallel',
      title: 'Both systems run at once',
      description:
        'Everything except /search still routes to the monolith. The old and new systems serve production side by side — which is why sharing or syncing their data during the transition is usually the hardest part.',
      activeNodes: ['facade', 'mono', 'svc'],
      activeEdges: ['e-f-m', 'e-f-s'],
      annotations: ['Two systems in parallel'],
      packets: [
        { from: 'facade', to: 'svc', color: NEW, label: '/search' },
        { from: 'facade', to: 'mono', color: LEGACY, label: 'everything else', delay: 0.2 },
      ],
    },
    {
      id: 'reversible',
      title: 'Each step is reversible',
      description:
        'If a migrated slice misbehaves, point the facade back at the monolith for that route. No weekend-long cutover, no all-or-nothing risk — every step is small and safe to undo.',
      activeNodes: ['facade', 'mono'],
      activeEdges: ['e-f-m'],
      annotations: ['Misbehaves? Route back — instantly'],
      packets: [{ from: 'facade', to: 'mono', color: BACK, label: '/search → back to legacy' }],
    },
    {
      id: 'retire',
      title: 'Repeat until the monolith is gone',
      description:
        'Capability by capability, the monolith shrinks as the new system grows, until the last route is migrated and the old system can finally be retired. Value ships continuously the whole way.',
      activeNodes: ['facade', 'svc'],
      failedNodes: ['mono'],
      activeEdges: ['e-f-s'],
      annotations: ['Monolith retired ✓'],
    },
  ],
  content,
}
