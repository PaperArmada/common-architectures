import type { Architecture } from '../types'
import content from '../content/db-replication.mdx'

const WRITE = '#f472b6'
const READ = '#38bdf8'
const REPL = '#fbbf24'

export const dbReplication: Architecture = {
  slug: 'db-replication',
  title: 'Database Replication',
  category: 'data-scaling',
  tagline: 'Scale reads and add redundancy with leader / follower copies.',
  level: 'core',
  nodes: [
    { id: 'app', label: 'App server', kind: 'server', x: 12, y: 50 },
    { id: 'primary', label: 'Primary', sublabel: 'reads + writes', kind: 'db-primary', x: 45, y: 50 },
    { id: 'r1', label: 'Replica 1', sublabel: 'reads', kind: 'db-replica', x: 82, y: 22 },
    { id: 'r2', label: 'Replica 2', sublabel: 'reads', kind: 'db-replica', x: 82, y: 78 },
  ],
  edges: [
    { id: 'e-write', from: 'app', to: 'primary' },
    { id: 'e-rep1', from: 'primary', to: 'r1', dashed: true },
    { id: 'e-rep2', from: 'primary', to: 'r2', dashed: true },
    { id: 'e-read1', from: 'app', to: 'r1', curve: -120 },
    { id: 'e-read2', from: 'app', to: 'r2', curve: 120 },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One database, doing everything',
      description:
        'Every read and every write competes for the same machine. Since most apps read far more than they write, reads are usually the first thing to saturate it.',
      activeNodes: ['app', 'primary'],
    },
    {
      id: 'writes',
      title: 'All writes go to the primary',
      description:
        'One node is the primary (leader). It is the single authority for changes — every insert, update, and delete lands here.',
      activeNodes: ['app', 'primary'],
      activeEdges: ['e-write'],
      packets: [{ from: 'app', to: 'primary', color: WRITE, label: 'WRITE' }],
    },
    {
      id: 'replicate',
      title: 'The primary streams changes to replicas',
      description:
        'Each replica keeps an open connection to the primary and continuously applies its change log, staying a near-live copy of the data.',
      activeNodes: ['primary', 'r1', 'r2'],
      activeEdges: ['e-rep1', 'e-rep2'],
      packets: [
        { from: 'primary', to: 'r1', color: REPL, label: 'replicate' },
        { from: 'primary', to: 'r2', color: REPL, label: 'replicate', delay: 0.2 },
      ],
    },
    {
      id: 'reads',
      title: 'Reads fan out to the replicas',
      description:
        'Read queries are served by the followers instead of the primary. Add more replicas and read throughput scales almost linearly.',
      activeNodes: ['app', 'r1', 'r2'],
      activeEdges: ['e-read1', 'e-read2'],
      packets: [
        { from: 'app', to: 'r1', color: READ, label: 'READ' },
        { from: 'app', to: 'r2', color: READ, label: 'READ', delay: 0.3 },
      ],
    },
    {
      id: 'lag',
      title: 'Replication lag → stale reads',
      description:
        'Replicas apply changes a moment after the primary commits. A read issued right after a write may hit a replica that has not caught up, returning an old value. This is eventual consistency.',
      activeNodes: ['app', 'primary', 'r1'],
      activeEdges: ['e-write', 'e-read1'],
      annotations: ['Write commits on primary', 'Replica still catching up → stale read'],
      packets: [
        { from: 'app', to: 'primary', color: WRITE, label: 'WRITE v2' },
        { from: 'app', to: 'r1', color: READ, label: 'reads v1', delay: 0.7 },
      ],
    },
    {
      id: 'failover',
      title: 'Failover: promote a replica',
      description:
        'If the primary dies, a replica is promoted to become the new primary and writes resume against it. Automatic failover must avoid split-brain — two nodes both claiming to be primary.',
      activeNodes: ['app', 'r1'],
      failedNodes: ['primary'],
      activeEdges: ['e-read1'],
      annotations: ['Primary down', 'Replica 1 promoted → new primary'],
      packets: [{ from: 'app', to: 'r1', color: WRITE, label: 'WRITE', delay: 0.3 }],
    },
    {
      id: 'recap',
      title: 'Scales reads, not writes',
      description:
        'Replication multiplies read capacity and adds redundancy. But every write still funnels through one primary — when writes become the bottleneck, you reach for sharding instead.',
      activeNodes: ['app', 'primary', 'r1', 'r2'],
      activeEdges: ['e-write', 'e-rep1', 'e-rep2', 'e-read1', 'e-read2'],
    },
  ],
  content,
}
