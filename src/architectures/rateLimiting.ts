import type { Architecture } from '../types'
import content from '../content/rate-limiting.mdx'

const OK = '#34d399'
const REQ = '#38bdf8'
const REJECT = '#f87171'

export const rateLimiting: Architecture = {
  slug: 'rate-limiting',
  title: 'Rate Limiting',
  category: 'distributed',
  tagline: 'Cap each client’s request rate to protect the service and share it fairly.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 13, y: 50 },
    { id: 'limiter', label: 'Rate Limiter', sublabel: 'token bucket', kind: 'gateway', x: 47, y: 50 },
    { id: 'api', label: 'API', kind: 'server', x: 82, y: 50 },
  ],
  edges: [
    { id: 'e-c-l', from: 'client', to: 'limiter' },
    { id: 'e-l-a', from: 'limiter', to: 'api' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One client can drown the rest',
      description:
        'A runaway script or an attacker can flood the API, starving legitimate users and running up your bill. Rate limiting caps how fast each client may call.',
      activeNodes: ['client', 'api'],
    },
    {
      id: 'bucket',
      title: 'Each client has a token bucket',
      description:
        'The bucket holds up to N tokens and refills at a steady rate — say 5 tokens, refilling one per second. Every request must spend a token.',
      activeNodes: ['limiter'],
      annotations: ['Bucket: 5 / 5 tokens'],
    },
    {
      id: 'allow',
      title: 'Within limit → request passes',
      description:
        'A token is available, so the limiter spends one and forwards the request to the API. Plenty of headroom remains.',
      activeNodes: ['client', 'limiter', 'api'],
      activeEdges: ['e-c-l', 'e-l-a'],
      annotations: ['Spend token → 4 / 5'],
      packets: [
        { from: 'client', to: 'limiter', color: REQ, label: 'request' },
        { from: 'limiter', to: 'api', color: OK, label: 'allowed', delay: 0.5 },
      ],
    },
    {
      id: 'burst',
      title: 'A burst drains the bucket',
      description:
        'Rapid-fire requests each spend a token until the bucket is empty. The limiter has allowed a short burst — up to the bucket’s size — but no more.',
      activeNodes: ['client', 'limiter', 'api'],
      activeEdges: ['e-c-l', 'e-l-a'],
      annotations: ['Bucket draining… 0 / 5'],
      packets: [
        { from: 'client', to: 'limiter', color: REQ, label: 'req' },
        { from: 'limiter', to: 'api', color: OK, delay: 0.4 },
        { from: 'client', to: 'limiter', color: REQ, label: 'req', delay: 0.3 },
        { from: 'limiter', to: 'api', color: OK, delay: 0.7 },
        { from: 'client', to: 'limiter', color: REQ, label: 'req', delay: 0.6 },
        { from: 'limiter', to: 'api', color: OK, delay: 1.0 },
      ],
    },
    {
      id: 'reject',
      title: 'Over limit → 429, backend protected',
      description:
        'With the bucket empty, further requests are rejected immediately with 429 Too Many Requests and a Retry-After hint. The API never even sees them.',
      activeNodes: ['client', 'limiter'],
      activeEdges: ['e-c-l'],
      annotations: ['0 tokens → 429 Too Many Requests', 'API shielded'],
      packets: [
        { from: 'client', to: 'limiter', color: REQ, label: 'req' },
        { from: 'limiter', to: 'client', color: REJECT, label: '429', delay: 0.45 },
      ],
    },
    {
      id: 'refill',
      title: 'The bucket refills over time',
      description:
        'Tokens replenish at the fixed rate, so the client can proceed again shortly. This enforces a steady long-run average while still tolerating bursts. In a cluster, the counter lives in a shared store so every node agrees.',
      activeNodes: ['client', 'limiter', 'api'],
      activeEdges: ['e-c-l', 'e-l-a'],
      annotations: ['Refilled → 2 / 5'],
      packets: [
        { from: 'client', to: 'limiter', color: REQ, label: 'request' },
        { from: 'limiter', to: 'api', color: OK, label: 'allowed', delay: 0.5 },
      ],
    },
  ],
  content,
}
