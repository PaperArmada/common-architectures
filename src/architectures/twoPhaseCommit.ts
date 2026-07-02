import type { Architecture } from '../types'
import content from '../content/two-phase-commit.mdx'

const ASK = '#38bdf8'
const YES = '#34d399'
const COMMIT = '#a78bfa'
const FAIL = '#f87171'

export const twoPhaseCommit: Architecture = {
  slug: 'two-phase-commit',
  title: 'Two-Phase Commit',
  category: 'data-scaling',
  tagline: 'Commit across multiple databases atomically — the classic (blocking) distributed transaction.',
  level: 'advanced',
  nodes: [
    { id: 'coord', label: 'Coordinator', kind: 'gateway', x: 14, y: 50 },
    { id: 'p1', label: 'Bank A DB', kind: 'db', x: 80, y: 24 },
    { id: 'p2', label: 'Bank B DB', kind: 'db', x: 80, y: 76 },
  ],
  edges: [
    { id: 'e-1', from: 'coord', to: 'p1' },
    { id: 'e-2', from: 'coord', to: 'p2' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One operation, two databases',
      description:
        'Move money out of Bank A and into Bank B — it must be all-or-nothing across both. Neither database knows about the other’s transaction, so a plain commit on each risks money vanishing or duplicating.',
      activeNodes: ['coord', 'p1', 'p2'],
    },
    {
      id: 'prepare',
      title: 'Phase 1 — prepare (vote)',
      description:
        'The coordinator asks every participant “can you commit?” Each does the work tentatively, locks the rows, writes to its log, and votes Yes — a promise that it can commit if told to.',
      activeNodes: ['coord', 'p1', 'p2'],
      activeEdges: ['e-1', 'e-2'],
      annotations: ['Rows locked · votes collected'],
      packets: [
        { from: 'coord', to: 'p1', color: ASK, label: 'prepare?' },
        { from: 'coord', to: 'p2', color: ASK, label: 'prepare?', delay: 0.15 },
        { from: 'p1', to: 'coord', color: YES, label: 'Yes', delay: 0.9 },
        { from: 'p2', to: 'coord', color: YES, label: 'Yes', delay: 1.05 },
      ],
    },
    {
      id: 'commit',
      title: 'Phase 2 — commit',
      description:
        'All participants voted Yes, so the coordinator tells everyone to commit. Because each already promised in phase 1, this step cannot fail on their end — that’s what makes it atomic.',
      activeNodes: ['coord', 'p1', 'p2'],
      activeEdges: ['e-1', 'e-2'],
      annotations: ['All Yes → commit everywhere'],
      packets: [
        { from: 'coord', to: 'p1', color: COMMIT, label: 'commit' },
        { from: 'coord', to: 'p2', color: COMMIT, label: 'commit', delay: 0.15 },
      ],
    },
    {
      id: 'abort',
      title: 'Any No → abort everywhere',
      description:
        'If even one participant votes No — or doesn’t answer — the coordinator tells everyone to abort and roll back. The transaction commits on all resources or on none.',
      activeNodes: ['coord', 'p1', 'p2'],
      activeEdges: ['e-1', 'e-2'],
      annotations: ['One No → everyone rolls back'],
      packets: [
        { from: 'p2', to: 'coord', color: FAIL, label: 'No' },
        { from: 'coord', to: 'p1', color: FAIL, label: 'abort', delay: 0.6 },
      ],
    },
    {
      id: 'blocking',
      title: 'The blocking problem',
      description:
        'Participants hold their locks from prepare until the final decision. If the coordinator crashes after they voted Yes, they’re stuck holding locks — unsure whether to commit or abort. This is 2PC’s notorious failure mode.',
      activeNodes: ['p1', 'p2'],
      failedNodes: ['coord'],
      annotations: ['Coordinator crash → participants stuck holding locks'],
    },
    {
      id: 'recap',
      title: 'Why microservices avoid it',
      description:
        'True cross-resource atomicity — but blocking, coordinator-dependent, and slow, so it scales poorly. This is exactly why microservices reach for the saga pattern instead, trading strict atomicity for availability and eventual consistency.',
      activeNodes: ['coord', 'p1', 'p2'],
      annotations: ['Atomic but blocking → prefer sagas at scale'],
    },
  ],
  content,
}
