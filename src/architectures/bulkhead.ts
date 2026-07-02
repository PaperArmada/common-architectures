import type { Architecture } from '../types'
import content from '../content/bulkhead.mdx'

const OK = '#34d399'
const REQ = '#38bdf8'
const FAIL = '#f87171'

export const bulkhead: Architecture = {
  slug: 'bulkhead',
  title: 'Bulkhead',
  category: 'distributed',
  tagline: 'Isolate resource pools so one flooded dependency can’t sink the whole service.',
  level: 'core',
  nodes: [
    { id: 'svc', label: 'Service', kind: 'server', x: 13, y: 50 },
    { id: 'poolA', label: 'Pool A', sublabel: '→ Payments', kind: 'queue', x: 47, y: 26 },
    { id: 'poolB', label: 'Pool B', sublabel: '→ Search', kind: 'queue', x: 47, y: 74 },
    { id: 'pay', label: 'Payments', kind: 'server', x: 82, y: 26 },
    { id: 'search', label: 'Search', kind: 'server', x: 82, y: 74 },
  ],
  edges: [
    { id: 'e-s-a', from: 'svc', to: 'poolA' },
    { id: 'e-s-b', from: 'svc', to: 'poolB' },
    { id: 'e-a-p', from: 'poolA', to: 'pay' },
    { id: 'e-b-s', from: 'poolB', to: 'search' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One shared pool is a single point of failure',
      description:
        'With one pool of threads or connections for everything, a single slow dependency ties them all up — and requests that had nothing to do with it start failing too.',
      activeNodes: ['svc', 'pay', 'search'],
    },
    {
      id: 'isolate',
      title: 'Give each dependency its own pool',
      description:
        'Partition the resources: calls to Payments draw from Pool A, calls to Search from Pool B. Each dependency can only ever consume its own compartment.',
      activeNodes: ['svc', 'poolA', 'poolB'],
      activeEdges: ['e-s-a', 'e-s-b'],
      annotations: ['Separate pools per dependency'],
    },
    {
      id: 'normal',
      title: 'Normal operation',
      description:
        'Both dependencies are healthy and each pool comfortably serves its traffic.',
      activeNodes: ['svc', 'poolA', 'poolB', 'pay', 'search'],
      activeEdges: ['e-s-a', 'e-s-b', 'e-a-p', 'e-b-s'],
      packets: [
        { from: 'svc', to: 'poolA', color: REQ },
        { from: 'poolA', to: 'pay', color: REQ, delay: 0.3 },
        { from: 'svc', to: 'poolB', color: REQ, delay: 0.15 },
        { from: 'poolB', to: 'search', color: REQ, delay: 0.45 },
      ],
    },
    {
      id: 'flood',
      title: 'Payments goes slow — Pool A saturates',
      description:
        'Payments hangs, and every one of Pool A’s slots fills with stuck requests. Pool A is exhausted; new Payments calls queue or fail fast.',
      activeNodes: ['svc', 'poolA'],
      failedNodes: ['pay'],
      activeEdges: ['e-s-a', 'e-a-p'],
      annotations: ['Pool A saturated by slow Payments'],
      packets: [
        { from: 'svc', to: 'poolA', color: FAIL, label: 'stuck' },
        { from: 'poolA', to: 'pay', color: FAIL, label: 'hang', delay: 0.3 },
      ],
    },
    {
      id: 'contained',
      title: 'Search keeps serving — damage contained',
      description:
        'Because Search has its own Pool B, it is completely unaffected. The failure is confined to the Payments compartment; the rest of the service stays healthy.',
      activeNodes: ['svc', 'poolB', 'search'],
      failedNodes: ['pay'],
      activeEdges: ['e-s-b', 'e-b-s'],
      annotations: ['Pool B / Search unaffected ✓'],
      packets: [
        { from: 'svc', to: 'poolB', color: OK, label: 'request' },
        { from: 'poolB', to: 'search', color: OK, delay: 0.3 },
        { from: 'search', to: 'poolB', color: OK, label: '200', delay: 0.9 },
      ],
    },
    {
      id: 'recap',
      title: 'Contain the blast radius',
      description:
        'A bulkhead limits how much of your capacity any one dependency can consume. Pair it with a circuit breaker (which stops calling the failing one) for full resilience. The cost is reserved-but-idle capacity — sizing each pool is the tuning work.',
      activeNodes: ['poolA', 'poolB'],
      annotations: ['Bulkhead limits · circuit breaker cuts off'],
    },
  ],
  content,
}
