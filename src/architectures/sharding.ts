import type { Architecture } from '../types'
import content from '../content/sharding.mdx'

const REQ = '#38bdf8'
const HIT = '#34d399'
const FAN = '#fbbf24'

export const sharding: Architecture = {
  slug: 'sharding',
  title: 'Database Sharding',
  category: 'data-scaling',
  tagline: 'Partition data across independent databases to scale writes and storage.',
  level: 'advanced',
  nodes: [
    { id: 'app', label: 'App', kind: 'server', x: 11, y: 50 },
    { id: 'router', label: 'Shard Router', sublabel: 'hash(user_id)', kind: 'lb', x: 41, y: 50 },
    { id: 's1', label: 'Shard A', sublabel: 'users 0–33%', kind: 'db', x: 81, y: 18 },
    { id: 's2', label: 'Shard B', sublabel: 'users 34–66%', kind: 'db', x: 81, y: 50 },
    { id: 's3', label: 'Shard C', sublabel: 'users 67–100%', kind: 'db', x: 81, y: 82 },
  ],
  edges: [
    { id: 'e-a-r', from: 'app', to: 'router' },
    { id: 'e-r-1', from: 'router', to: 's1' },
    { id: 'e-r-2', from: 'router', to: 's2' },
    { id: 'e-r-3', from: 'router', to: 's3' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One database, too much data',
      description:
        'Replication scales reads, but every write still hits one primary — and eventually the data is simply too big for a single machine. We split it.',
      activeNodes: ['app', 's1', 's2', 's3'],
    },
    {
      id: 'partition',
      title: 'Split the data by a shard key',
      description:
        'Each row is assigned to a shard by a key — here, a hash of user_id. Every shard holds only its slice of the data and handles only that slice of traffic.',
      activeNodes: ['s1', 's2', 's3'],
      annotations: ['Partitioned by hash(user_id)'],
    },
    {
      id: 'route-42',
      title: 'Query user 42 → route to its shard',
      description:
        'The router hashes the key, finds that user 42 lives on Shard B, and sends the query there — and only there.',
      activeNodes: ['app', 'router', 's2'],
      activeEdges: ['e-a-r', 'e-r-2'],
      packets: [
        { from: 'app', to: 'router', color: REQ, label: 'user 42' },
        { from: 'router', to: 's2', color: REQ, label: '→ Shard B', delay: 0.5 },
        { from: 's2', to: 'app', color: HIT, label: 'row', delay: 1.2 },
      ],
    },
    {
      id: 'route-7',
      title: 'A different key lands on a different shard',
      description:
        'User 7 hashes to Shard A. A single-key lookup always touches exactly one shard, so it stays fast no matter how large the whole dataset grows.',
      activeNodes: ['app', 'router', 's1'],
      activeEdges: ['e-a-r', 'e-r-1'],
      packets: [
        { from: 'app', to: 'router', color: REQ, label: 'user 7' },
        { from: 'router', to: 's1', color: REQ, label: '→ Shard A', delay: 0.5 },
      ],
    },
    {
      id: 'scale',
      title: 'Writes scale horizontally',
      description:
        'Because each shard owns a distinct slice, writes to different users proceed in parallel on different machines. Need more capacity? Add another shard.',
      activeNodes: ['router', 's1', 's2', 's3'],
      activeEdges: ['e-r-1', 'e-r-2', 'e-r-3'],
      packets: [
        { from: 'router', to: 's1', color: REQ, label: 'WRITE' },
        { from: 'router', to: 's2', color: REQ, label: 'WRITE', delay: 0.2 },
        { from: 'router', to: 's3', color: REQ, label: 'WRITE', delay: 0.4 },
      ],
    },
    {
      id: 'cross-shard',
      title: 'The hard part: cross-shard queries',
      description:
        "A query that doesn't include the shard key — like “count all active users” — must fan out to every shard and merge the results. Joins and transactions across shards are hard by design.",
      activeNodes: ['app', 'router', 's1', 's2', 's3'],
      activeEdges: ['e-a-r', 'e-r-1', 'e-r-2', 'e-r-3'],
      annotations: ['No shard key → fan out to all', 'Slow · avoid on hot paths'],
      packets: [
        { from: 'router', to: 's1', color: FAN, label: 'scan' },
        { from: 'router', to: 's2', color: FAN, label: 'scan', delay: 0.15 },
        { from: 'router', to: 's3', color: FAN, label: 'scan', delay: 0.3 },
        { from: 's1', to: 'router', color: FAN, delay: 1.0 },
        { from: 's2', to: 'router', color: FAN, delay: 1.2 },
        { from: 's3', to: 'router', color: FAN, delay: 1.4 },
      ],
    },
  ],
  content,
}
