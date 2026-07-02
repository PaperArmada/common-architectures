import type { Architecture } from '../types'
import content from '../content/quorum-consensus.mdx'

const WRITE = '#f472b6'
const READ = '#38bdf8'
const OK = '#34d399'

export const quorumConsensus: Architecture = {
  slug: 'quorum-consensus',
  title: 'Quorum Consensus',
  category: 'data-scaling',
  tagline: 'Tune consistency vs. latency with W + R > N — no need to contact every replica.',
  level: 'advanced',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 12, y: 50 },
    { id: 'coord', label: 'Coordinator', sublabel: 'N = 3', kind: 'lb', x: 40, y: 50 },
    { id: 'r1', label: 'Replica 1', kind: 'db-replica', x: 80, y: 20 },
    { id: 'r2', label: 'Replica 2', kind: 'db-replica', x: 80, y: 50 },
    { id: 'r3', label: 'Replica 3', kind: 'db-replica', x: 80, y: 80 },
  ],
  edges: [
    { id: 'e-c-co', from: 'client', to: 'coord' },
    { id: 'e-1', from: 'coord', to: 'r1' },
    { id: 'e-2', from: 'coord', to: 'r2' },
    { id: 'e-3', from: 'coord', to: 'r3' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'All replicas is fragile, one is stale',
      description:
        'Wait for every replica to confirm a write and one slow node stalls everything. Ask just one and you risk stale reads. Quorum gives you a dial between the two.',
      activeNodes: ['client', 'r1', 'r2', 'r3'],
    },
    {
      id: 'write',
      title: 'Write to W of N replicas',
      description:
        'A write succeeds as soon as W replicas acknowledge it — here W = 2 of 3. Replica 3 may lag behind; the write doesn’t wait for it.',
      activeNodes: ['coord', 'r1', 'r2'],
      activeEdges: ['e-1', 'e-2'],
      annotations: ['W = 2 of 3 acknowledge'],
      packets: [
        { from: 'coord', to: 'r1', color: WRITE, label: 'write' },
        { from: 'coord', to: 'r2', color: WRITE, label: 'write', delay: 0.15 },
        { from: 'r1', to: 'coord', color: OK, label: 'ack', delay: 0.8 },
        { from: 'r2', to: 'coord', color: OK, label: 'ack', delay: 0.95 },
      ],
    },
    {
      id: 'read',
      title: 'Read from R of N replicas',
      description:
        'A read queries R replicas — here R = 2 — and takes the newest value among the responses.',
      activeNodes: ['coord', 'r2', 'r3'],
      activeEdges: ['e-2', 'e-3'],
      annotations: ['R = 2 of 3 respond'],
      packets: [
        { from: 'coord', to: 'r2', color: READ, label: 'read' },
        { from: 'coord', to: 'r3', color: READ, label: 'read', delay: 0.15 },
        { from: 'r2', to: 'coord', color: READ, label: 'v2', delay: 0.8 },
        { from: 'r3', to: 'coord', color: READ, label: 'v1', delay: 0.95 },
      ],
    },
    {
      id: 'overlap',
      title: 'W + R > N guarantees overlap',
      description:
        'With W = 2 and R = 2 on N = 3, the write set and read set must share at least one replica — Replica 2 here. So the read is guaranteed to see the latest committed write. Strong consistency, without touching every node.',
      activeNodes: ['r2'],
      activeEdges: ['e-2'],
      annotations: ['W + R = 4 > N = 3 → sets overlap ✓', 'Replica 2 has the latest'],
    },
    {
      id: 'dial',
      title: 'The consistency dial',
      description:
        'W = N, R = 1 gives fast reads but slow, fragile writes; W = 1, R = N is the reverse. W + R ≤ N is fastest but eventually consistent — reads may miss recent writes. Concurrent-write conflicts are settled by version vectors or last-write-wins.',
      activeNodes: ['coord', 'r1', 'r2', 'r3'],
      annotations: ['Tune W and R per workload'],
    },
    {
      id: 'recap',
      title: 'The Dynamo-style trade',
      description:
        'Tunable consistency-vs-latency, tolerant of node failures — no single node must be up to make progress. It’s an availability-leaning point on the CAP spectrum, seen in Dynamo, Cassandra, and Riak.',
      activeNodes: ['coord', 'r1', 'r2', 'r3'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
      annotations: ['Availability-leaning (CAP)'],
    },
  ],
  content,
}
