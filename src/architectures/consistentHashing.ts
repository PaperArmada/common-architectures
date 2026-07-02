import type { Architecture } from '../types'
import content from '../content/consistent-hashing.mdx'

const KEY = '#38bdf8'
const MOVE = '#fbbf24'
const STAY = '#34d399'

export const consistentHashing: Architecture = {
  slug: 'consistent-hashing',
  title: 'Consistent Hashing',
  category: 'distributed',
  tagline: 'Add or remove a node and only ~1/N of keys move — not the whole cache.',
  level: 'advanced',
  nodes: [
    { id: 'ring', label: 'Hash ring', sublabel: 'hash(key) → clockwise', kind: 'lb', x: 50, y: 50 },
    { id: 'a', label: 'Cache A', kind: 'cache', x: 50, y: 13 },
    { id: 'b', label: 'Cache B', kind: 'cache', x: 84, y: 72 },
    { id: 'c', label: 'Cache C', kind: 'cache', x: 16, y: 72 },
    { id: 'd', label: 'Cache D', sublabel: 'added', kind: 'cache', x: 84, y: 26 },
  ],
  edges: [
    { id: 'e-a', from: 'ring', to: 'a' },
    { id: 'e-b', from: 'ring', to: 'b' },
    { id: 'e-c', from: 'ring', to: 'c' },
    { id: 'e-d', from: 'ring', to: 'd' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'hash(key) % N reshuffles everything',
      description:
        'Spread keys across N servers with modulo, then change N, and almost every key maps somewhere new — the whole cache is invalidated at once and stampedes the database.',
      activeNodes: ['a', 'b', 'c'],
    },
    {
      id: 'ring',
      title: 'Place servers on a ring',
      description:
        'Hash the servers onto a ring of hash values. Each server owns the arc of the ring leading up to it, clockwise.',
      activeNodes: ['ring', 'a', 'b', 'c'],
      activeEdges: ['e-a', 'e-b', 'e-c'],
      annotations: ['Servers positioned by hash(server)'],
    },
    {
      id: 'lookup',
      title: 'A key maps to the next server clockwise',
      description:
        'Hash the key to a point on the ring, then walk clockwise to the first server — that’s where it lives. Here user:42 lands on Cache A.',
      activeNodes: ['ring', 'a'],
      activeEdges: ['e-a'],
      packets: [{ from: 'ring', to: 'a', color: KEY, label: 'user:42 → A' }],
    },
    {
      id: 'lookup2',
      title: 'Another key, another arc',
      description:
        'Keys are spread around the ring, each owned by whichever server’s arc it falls in. user:99 falls to Cache B.',
      activeNodes: ['ring', 'b'],
      activeEdges: ['e-b'],
      packets: [{ from: 'ring', to: 'b', color: KEY, label: 'user:99 → B' }],
    },
    {
      id: 'add',
      title: 'Add a server: only its arc moves',
      description:
        'Insert Cache D on the ring and it steals only the keys in the arc between it and the previous server — taken from Cache A. Every other key stays exactly where it was.',
      activeNodes: ['ring', 'd', 'a'],
      activeEdges: ['e-d', 'e-a'],
      annotations: ['Only ~1/N keys remap', 'Rest stay put ✓'],
      packets: [
        { from: 'a', to: 'd', color: MOVE, label: 'small slice moves' },
        { from: 'ring', to: 'b', color: STAY, label: 'unchanged', delay: 0.4 },
        { from: 'ring', to: 'c', color: STAY, label: 'unchanged', delay: 0.5 },
      ],
    },
    {
      id: 'vnodes',
      title: 'Virtual nodes smooth the load',
      description:
        'A few servers placed once cluster unevenly. So each physical server is placed at many points on the ring — virtual nodes — evening out both the distribution and the rebalancing.',
      activeNodes: ['a', 'b', 'c', 'd'],
      annotations: ['Each server → many ring points'],
    },
  ],
  content,
}
