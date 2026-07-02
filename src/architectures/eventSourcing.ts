import type { Architecture } from '../types'
import content from '../content/event-sourcing.mdx'

const WRITE = '#f472b6'
const REPLAY = '#fbbf24'
const OK = '#34d399'

export const eventSourcing: Architecture = {
  slug: 'event-sourcing',
  title: 'Event Sourcing',
  category: 'data-scaling',
  tagline: 'Store the sequence of events, not the current state — the log is the source of truth.',
  level: 'advanced',
  nodes: [
    { id: 'app', label: 'App', kind: 'server', x: 12, y: 50 },
    { id: 'log', label: 'Event store', sublabel: 'append-only', kind: 'db', x: 45, y: 50 },
    { id: 'state', label: 'Current state', sublabel: 'projection', kind: 'db-replica', x: 82, y: 26 },
    { id: 'snap', label: 'Snapshot', kind: 'storage', x: 82, y: 74 },
  ],
  edges: [
    { id: 'e-a-l', from: 'app', to: 'log' },
    { id: 'e-l-st', from: 'log', to: 'state' },
    { id: 'e-l-sn', from: 'log', to: 'snap', dashed: true },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Normal databases overwrite history',
      description:
        'A regular store keeps only the current state and overwrites it on every change. You know the balance is $40, but not how it got there — the history is gone.',
      activeNodes: ['app', 'log'],
    },
    {
      id: 'append',
      title: 'Append immutable events',
      description:
        'Every change is captured as an event and appended to the event store — never updated, never deleted. Deposited $100, then Withdrew $60.',
      activeNodes: ['app', 'log'],
      activeEdges: ['e-a-l'],
      annotations: ['Append-only, immutable'],
      packets: [
        { from: 'app', to: 'log', color: WRITE, label: 'Deposited $100' },
        { from: 'app', to: 'log', color: WRITE, label: 'Withdrew $60', delay: 0.5 },
      ],
    },
    {
      id: 'replay',
      title: 'Replay events to get state',
      description:
        'Current state is just the events folded together: $0 → +100 → −60 = $40. The projection is derived from the log, not stored as the truth.',
      activeNodes: ['log', 'state'],
      activeEdges: ['e-l-st'],
      packets: [{ from: 'log', to: 'state', color: OK, label: 'replay → $40' }],
    },
    {
      id: 'audit',
      title: 'Free audit log and time travel',
      description:
        'Because every change is retained with its cause, you get a complete audit trail for free — and can reconstruct the exact state at any past moment.',
      activeNodes: ['log'],
      annotations: ['Every change retained → reconstruct any past state'],
    },
    {
      id: 'snapshot',
      title: 'Snapshots keep replay fast',
      description:
        'Replaying from the beginning gets slow as the log grows. Periodic snapshots capture state at a point in time, so you only replay the events since the last one.',
      activeNodes: ['log', 'snap'],
      activeEdges: ['e-l-sn'],
      annotations: ['Replay only since last snapshot'],
      packets: [{ from: 'log', to: 'snap', color: REPLAY, label: 'snapshot' }],
    },
    {
      id: 'recap',
      title: 'Pairs naturally with CQRS',
      description:
        'Replay history into a brand-new read model you didn’t anticipate when the events were written — which is why event sourcing and CQRS go together. The cost: a mindset shift, immutable event-schema evolution, and no simple SELECT for current state. Overkill for simple CRUD.',
      activeNodes: ['app', 'log', 'state'],
      annotations: ['New read models from old events'],
    },
  ],
  content,
}
