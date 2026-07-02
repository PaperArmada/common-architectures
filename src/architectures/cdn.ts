import type { Architecture } from '../types'
import content from '../content/cdn.mdx'

const REQ = '#38bdf8'
const HIT = '#34d399'
const MISS = '#fbbf24'

export const cdn: Architecture = {
  slug: 'cdn',
  title: 'Content Delivery Network',
  category: 'core-web',
  tagline: 'Cache content at the edge, close to users — so the origin is rarely touched.',
  level: 'intro',
  nodes: [
    { id: 'eu-user', label: 'User · EU', kind: 'client', x: 10, y: 24 },
    { id: 'us-user', label: 'User · US', kind: 'client', x: 10, y: 76 },
    { id: 'eu-edge', label: 'Edge · EU', sublabel: 'nearest PoP', kind: 'cdn', x: 42, y: 24 },
    { id: 'us-edge', label: 'Edge · US', sublabel: 'nearest PoP', kind: 'cdn', x: 42, y: 76 },
    { id: 'origin', label: 'Origin', sublabel: 'your server', kind: 'server', x: 82, y: 50 },
  ],
  edges: [
    { id: 'e-eu', from: 'eu-user', to: 'eu-edge' },
    { id: 'e-us', from: 'us-user', to: 'us-edge' },
    { id: 'e-eu-o', from: 'eu-edge', to: 'origin' },
    { id: 'e-us-o', from: 'us-edge', to: 'origin' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Users are far from your origin',
      description:
        'Your servers live in one region, but users are worldwide. Every asset fetched from the origin pays for the full round-trip distance — twice.',
      activeNodes: ['eu-user', 'us-user', 'origin'],
    },
    {
      id: 'nearest',
      title: 'Requests go to the nearest edge',
      description:
        'Instead of the far-away origin, each user is routed to the closest edge location (point of presence). The EU user hits the EU edge.',
      activeNodes: ['eu-user', 'eu-edge'],
      activeEdges: ['e-eu'],
      packets: [{ from: 'eu-user', to: 'eu-edge', color: REQ, label: 'GET /logo.png' }],
    },
    {
      id: 'miss',
      title: 'Cache miss → fetch from origin once',
      description:
        "The edge doesn't have the asset yet, so it fetches it from the origin a single time. This is the only request that travels the long distance.",
      activeNodes: ['eu-edge', 'origin'],
      activeEdges: ['e-eu-o'],
      annotations: ['Cache MISS at EU edge'],
      packets: [
        { from: 'eu-edge', to: 'origin', color: MISS, label: 'miss → origin' },
        { from: 'origin', to: 'eu-edge', color: MISS, label: 'asset', delay: 0.7 },
      ],
    },
    {
      id: 'cache-serve',
      title: 'Edge caches it and serves the user',
      description:
        'The edge stores the asset and returns it to the user. Now a copy lives close to everyone in that region.',
      activeNodes: ['eu-edge', 'eu-user'],
      activeEdges: ['e-eu'],
      packets: [{ from: 'eu-edge', to: 'eu-user', color: HIT, label: '200 · cached' }],
    },
    {
      id: 'hit',
      title: 'Every later request is a cache hit',
      description:
        'More EU users request the same asset. The edge answers instantly from cache — the origin is never contacted. Latency drops to a few milliseconds.',
      activeNodes: ['eu-user', 'eu-edge'],
      activeEdges: ['e-eu'],
      annotations: ['Cache HIT — origin untouched'],
      packets: [
        { from: 'eu-user', to: 'eu-edge', color: REQ, label: 'GET' },
        { from: 'eu-edge', to: 'eu-user', color: HIT, label: 'hit', delay: 0.6 },
      ],
    },
    {
      id: 'global',
      title: 'The same happens in every region',
      description:
        'A US user warms the US edge with its own one-time fetch, then that region is fast too. The origin serves one request per region, not per user.',
      activeNodes: ['us-user', 'us-edge', 'origin'],
      activeEdges: ['e-us', 'e-us-o'],
      packets: [
        { from: 'us-user', to: 'us-edge', color: REQ, label: 'GET' },
        { from: 'us-edge', to: 'origin', color: MISS, label: 'miss', delay: 0.5 },
        { from: 'origin', to: 'us-edge', color: MISS, delay: 1.1 },
        { from: 'us-edge', to: 'us-user', color: HIT, delay: 1.6 },
      ],
    },
  ],
  content,
}
