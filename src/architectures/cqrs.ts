import type { Architecture } from '../types'
import content from '../content/cqrs.mdx'

const CMD = '#f472b6'
const QUERY = '#38bdf8'
const PROJECT = '#fbbf24'
const RESP = '#34d399'

export const cqrs: Architecture = {
  slug: 'cqrs',
  title: 'CQRS',
  category: 'data-scaling',
  tagline: 'Separate the write model from the read model so each is optimized on its own.',
  level: 'advanced',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 10, y: 50 },
    { id: 'cmd', label: 'Command API', sublabel: 'writes', kind: 'server', x: 40, y: 24 },
    { id: 'query', label: 'Query API', sublabel: 'reads', kind: 'server', x: 40, y: 76 },
    { id: 'wstore', label: 'Write store', sublabel: 'normalized', kind: 'db', x: 78, y: 24 },
    { id: 'rstore', label: 'Read store', sublabel: 'denormalized', kind: 'db-replica', x: 78, y: 76 },
  ],
  edges: [
    { id: 'e-c-cmd', from: 'client', to: 'cmd' },
    { id: 'e-c-q', from: 'client', to: 'query' },
    { id: 'e-cmd-w', from: 'cmd', to: 'wstore' },
    { id: 'e-q-r', from: 'query', to: 'rstore' },
    { id: 'e-w-r', from: 'wstore', to: 'rstore', dashed: true },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Reads and writes want opposite things',
      description:
        'Writes want a normalized model with integrity constraints; reads want data pre-joined and denormalized for one-lookup page loads. Serving both from one model compromises both.',
      activeNodes: ['client', 'cmd', 'query'],
    },
    {
      id: 'command',
      title: 'Commands flow through the write model',
      description:
        'Writes go through the Command API into a normalized write store — the source of truth, focused purely on correctness.',
      activeNodes: ['client', 'cmd', 'wstore'],
      activeEdges: ['e-c-cmd', 'e-cmd-w'],
      packets: [
        { from: 'client', to: 'cmd', color: CMD, label: 'PLACE ORDER' },
        { from: 'cmd', to: 'wstore', color: CMD, label: 'INSERT', delay: 0.5 },
      ],
    },
    {
      id: 'project',
      title: 'A change feed projects into the read store',
      description:
        'Each write is projected into a read-optimized store — denormalized and precomputed, shaped exactly for how it will be queried.',
      activeNodes: ['wstore', 'rstore'],
      activeEdges: ['e-w-r'],
      annotations: ['Projection · async'],
      packets: [{ from: 'wstore', to: 'rstore', color: PROJECT, label: 'project event' }],
    },
    {
      id: 'query',
      title: 'Queries hit the read model directly',
      description:
        'Reads go through the Query API to the denormalized read store — fast, no joins, and no contention with writes.',
      activeNodes: ['client', 'query', 'rstore'],
      activeEdges: ['e-c-q', 'e-q-r'],
      packets: [
        { from: 'client', to: 'query', color: QUERY, label: 'GET dashboard' },
        { from: 'query', to: 'rstore', color: QUERY, label: 'SELECT', delay: 0.4 },
        { from: 'rstore', to: 'query', color: RESP, label: 'view', delay: 1.0 },
        { from: 'query', to: 'client', color: RESP, delay: 1.5 },
      ],
    },
    {
      id: 'scale',
      title: 'Scale each side independently',
      description:
        'Because the paths are separate, you can scale them on their own terms — many cheap read replicas for a read-heavy load without touching the write side. Each side can even use a different database.',
      activeNodes: ['cmd', 'wstore', 'query', 'rstore'],
      activeEdges: ['e-cmd-w', 'e-q-r'],
      annotations: ['Write side: correctness', 'Read side: throughput'],
    },
    {
      id: 'consistency',
      title: 'The catch: eventual consistency',
      description:
        'The read store lags the write store by however long projection takes. A read right after a write may not reflect it yet — so read from the write side when a user must see their own change immediately. Powerful for complex domains; overkill for simple CRUD.',
      activeNodes: ['client', 'cmd', 'wstore', 'rstore'],
      activeEdges: ['e-c-cmd', 'e-cmd-w', 'e-w-r'],
      annotations: ['Write committed', 'Read store catching up…'],
      packets: [
        { from: 'client', to: 'cmd', color: CMD, label: 'WRITE' },
        { from: 'cmd', to: 'wstore', color: CMD, delay: 0.4 },
        { from: 'wstore', to: 'rstore', color: PROJECT, label: 'lag', delay: 0.9 },
      ],
    },
  ],
  content,
}
