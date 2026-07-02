import type { Architecture } from '../types'
import content from '../content/retry.mdx'

const REQ = '#38bdf8'
const FAIL = '#f87171'
const OK = '#34d399'
const WAIT = '#fbbf24'

export const retry: Architecture = {
  slug: 'retry',
  title: 'Retry with Backoff',
  category: 'distributed',
  tagline: 'Turn transient failures into successes — without hammering a recovering dependency.',
  level: 'core',
  nodes: [
    { id: 'c1', label: 'Client A', kind: 'client', x: 13, y: 24 },
    { id: 'c2', label: 'Client B', kind: 'client', x: 13, y: 50 },
    { id: 'c3', label: 'Client C', kind: 'client', x: 13, y: 76 },
    { id: 'dep', label: 'Service', sublabel: 'recovering', kind: 'server', x: 78, y: 50 },
  ],
  edges: [
    { id: 'e1', from: 'c1', to: 'dep' },
    { id: 'e2', from: 'c2', to: 'dep' },
    { id: 'e3', from: 'c3', to: 'dep' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Many failures are just transient',
      description:
        'A blip, a reset, a node restart — the same request would often succeed a moment later. A retry turns those momentary failures into successes instead of errors.',
      activeNodes: ['c1', 'dep'],
    },
    {
      id: 'fail',
      title: 'A request fails — so retry it',
      description:
        'Client A gets a 503. Rather than surfacing an error, it will try again shortly.',
      activeNodes: ['c1', 'dep'],
      activeEdges: ['e1'],
      packets: [
        { from: 'c1', to: 'dep', color: REQ, label: 'request' },
        { from: 'dep', to: 'c1', color: FAIL, label: '503', delay: 0.7 },
      ],
    },
    {
      id: 'backoff',
      title: 'Exponential backoff',
      description:
        'Wait longer between each attempt — 100ms, 200ms, 400ms — giving the dependency room to recover instead of instantly hammering it again.',
      activeNodes: ['c1', 'dep'],
      activeEdges: ['e1'],
      annotations: ['Wait ×2 each try: 100 → 200 → 400ms'],
      packets: [
        { from: 'c1', to: 'dep', color: WAIT, label: 'retry after 200ms' },
        { from: 'dep', to: 'c1', color: FAIL, delay: 0.7 },
      ],
    },
    {
      id: 'storm',
      title: 'Without jitter: a retry storm',
      description:
        'If every client backs off by the same schedule, they all retry in lockstep — synchronized waves that hammer the recovering service exactly when it is weakest.',
      activeNodes: ['c1', 'c2', 'c3', 'dep'],
      failedNodes: ['dep'],
      activeEdges: ['e1', 'e2', 'e3'],
      annotations: ['Thundering herd — retries in lockstep'],
      packets: [
        { from: 'c1', to: 'dep', color: FAIL, label: 'retry' },
        { from: 'c2', to: 'dep', color: FAIL, label: 'retry' },
        { from: 'c3', to: 'dep', color: FAIL, label: 'retry' },
      ],
    },
    {
      id: 'jitter',
      title: 'Add jitter to spread them out',
      description:
        'Randomizing each delay scatters the retries across time instead of synchronizing them. The load smooths out and the dependency can actually recover.',
      activeNodes: ['c1', 'c2', 'c3', 'dep'],
      activeEdges: ['e1', 'e2', 'e3'],
      annotations: ['+ random jitter → retries spread out'],
      packets: [
        { from: 'c1', to: 'dep', color: REQ, label: 'retry' },
        { from: 'c2', to: 'dep', color: REQ, label: 'retry', delay: 0.4 },
        { from: 'c3', to: 'dep', color: REQ, label: 'retry', delay: 0.8 },
      ],
    },
    {
      id: 'recap',
      title: 'Succeed — or give up cleanly',
      description:
        'The retry eventually succeeds. Cap attempts with a retry budget, only retry transient failures on idempotent operations, and pair with a circuit breaker so you stop retrying a dependency that is genuinely down.',
      activeNodes: ['c1', 'dep'],
      activeEdges: ['e1'],
      annotations: ['Idempotent + transient only', 'Cap with a budget + circuit breaker'],
      packets: [
        { from: 'c1', to: 'dep', color: REQ, label: 'retry' },
        { from: 'dep', to: 'c1', color: OK, label: '200 ✓', delay: 0.7 },
      ],
    },
  ],
  content,
}
