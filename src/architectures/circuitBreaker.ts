import type { Architecture } from '../types'
import content from '../content/circuit-breaker.mdx'

const OK = '#34d399'
const FAIL = '#f87171'
const FALLBACK = '#fb7185'
const PROBE = '#fbbf24'

export const circuitBreaker: Architecture = {
  slug: 'circuit-breaker',
  title: 'Circuit Breaker',
  category: 'distributed',
  tagline: 'Stop calling a failing dependency and fail fast, so failures don’t cascade.',
  level: 'core',
  nodes: [
    { id: 'caller', label: 'Order svc', sublabel: 'caller', kind: 'server', x: 14, y: 42 },
    { id: 'breaker', label: 'Circuit Breaker', sublabel: 'resilience proxy', kind: 'gateway', x: 47, y: 42 },
    { id: 'dep', label: 'Payment svc', sublabel: 'dependency', kind: 'server', x: 82, y: 42 },
    { id: 'fallback', label: 'Fallback', sublabel: 'cached / queued', kind: 'cache', x: 82, y: 84 },
  ],
  edges: [
    { id: 'e-c-b', from: 'caller', to: 'breaker' },
    { id: 'e-b-d', from: 'breaker', to: 'dep' },
    { id: 'e-b-f', from: 'breaker', to: 'fallback', dashed: true },
  ],
  steps: [
    {
      id: 'intro',
      title: 'A failing dependency cascades upward',
      description:
        'When Payments gets slow, callers pile up waiting on it. Their threads and connections exhaust, so they can’t serve their own callers — and the outage spreads.',
      activeNodes: ['caller', 'dep'],
    },
    {
      id: 'closed',
      title: 'Closed: calls flow through normally',
      description:
        'In its normal state the breaker is closed — it passes calls to the dependency and returns the result, quietly counting failures.',
      activeNodes: ['caller', 'breaker', 'dep'],
      activeEdges: ['e-c-b', 'e-b-d'],
      annotations: ['State: CLOSED'],
      packets: [
        { from: 'caller', to: 'breaker', color: OK, label: 'charge' },
        { from: 'breaker', to: 'dep', color: OK, delay: 0.4 },
        { from: 'dep', to: 'breaker', color: OK, label: '200', delay: 1.0 },
        { from: 'breaker', to: 'caller', color: OK, delay: 1.5 },
      ],
    },
    {
      id: 'failing',
      title: 'Failures mount',
      description:
        'The dependency starts timing out and erroring. The breaker tracks the rising error rate against its threshold.',
      activeNodes: ['caller', 'breaker'],
      failedNodes: ['dep'],
      activeEdges: ['e-c-b', 'e-b-d'],
      annotations: ['Error rate climbing…'],
      packets: [
        { from: 'caller', to: 'breaker', color: OK, label: 'charge' },
        { from: 'breaker', to: 'dep', color: FAIL, delay: 0.4 },
        { from: 'breaker', to: 'dep', color: FAIL, label: 'timeout', delay: 0.8 },
      ],
    },
    {
      id: 'open',
      title: 'Open: trip and fail fast',
      description:
        'Past the threshold the breaker opens. It now rejects calls instantly without touching the dependency — freeing the caller and giving Payments room to recover. A fallback returns a degraded-but-useful response.',
      activeNodes: ['caller', 'breaker', 'fallback'],
      failedNodes: ['dep'],
      activeEdges: ['e-c-b', 'e-b-f'],
      annotations: ['State: OPEN', 'Fail fast · no call to dependency'],
      packets: [
        { from: 'caller', to: 'breaker', color: OK, label: 'charge' },
        { from: 'breaker', to: 'caller', color: FAIL, label: 'fail fast', delay: 0.45 },
        { from: 'breaker', to: 'fallback', color: FALLBACK, label: 'fallback', delay: 0.6 },
      ],
    },
    {
      id: 'half-open',
      title: 'Half-open: let one trial through',
      description:
        'After a cooldown the breaker sends a single probe request. If it succeeds, the breaker closes and normal traffic resumes; if it fails, it re-opens and waits again.',
      activeNodes: ['breaker', 'dep'],
      activeEdges: ['e-b-d'],
      annotations: ['State: HALF-OPEN', 'One probe decides'],
      packets: [
        { from: 'breaker', to: 'dep', color: PROBE, label: 'probe' },
        { from: 'dep', to: 'breaker', color: OK, label: '200 ✓', delay: 0.9 },
      ],
    },
    {
      id: 'recap',
      title: 'Fail fast, isolate, recover',
      description:
        'The breaker contains a failure instead of letting it spread, and probes for recovery. It pairs with timeouts, retries with backoff, and bulkheads for full resilience.',
      activeNodes: ['caller', 'breaker', 'dep'],
      activeEdges: ['e-c-b', 'e-b-d'],
      annotations: ['State: CLOSED again'],
      packets: [
        { from: 'caller', to: 'breaker', color: OK },
        { from: 'breaker', to: 'dep', color: OK, delay: 0.4 },
      ],
    },
  ],
  content,
}
