import type { Architecture } from '../types'
import content from '../content/outbox.mdx'

const TXN = '#f472b6'
const READ = '#38bdf8'
const PUB = '#2dd4bf'
const RETRY = '#fbbf24'

export const outbox: Architecture = {
  slug: 'outbox',
  title: 'Transactional Outbox',
  category: 'async',
  tagline: 'Commit a change and its event atomically, then relay the event to the broker.',
  level: 'core',
  nodes: [
    { id: 'svc', label: 'Order svc', kind: 'server', x: 11, y: 50 },
    { id: 'db', label: 'DB + outbox', sublabel: 'one transaction', kind: 'db', x: 40, y: 50 },
    { id: 'relay', label: 'Relay', sublabel: 'poll / CDC', kind: 'worker', x: 68, y: 50 },
    { id: 'broker', label: 'Broker', kind: 'broker', x: 91, y: 50 },
  ],
  edges: [
    { id: 'e-s-db', from: 'svc', to: 'db' },
    { id: 'e-db-r', from: 'db', to: 'relay' },
    { id: 'e-r-b', from: 'relay', to: 'broker' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'The dual-write problem',
      description:
        'A service must commit an order to its database AND publish an event to a broker — two different systems, no shared transaction. A crash between the two loses the event or leaves a phantom one.',
      activeNodes: ['svc', 'db', 'broker'],
    },
    {
      id: 'atomic',
      title: 'Write the change and event in one transaction',
      description:
        'In the same local DB transaction as the order, the service inserts the event into an outbox table. One transaction means both commit, or neither does.',
      activeNodes: ['svc', 'db'],
      activeEdges: ['e-s-db'],
      annotations: ['order + event → one atomic commit'],
      packets: [{ from: 'svc', to: 'db', color: TXN, label: 'INSERT order + event' }],
    },
    {
      id: 'relay',
      title: 'A relay reads the outbox',
      description:
        'A separate relay process reads unpublished rows from the outbox — by polling the table, or by tailing the DB transaction log with Change Data Capture.',
      activeNodes: ['db', 'relay'],
      activeEdges: ['e-db-r'],
      annotations: ['Polling or CDC (e.g. Debezium)'],
      packets: [{ from: 'db', to: 'relay', color: READ, label: 'unpublished rows' }],
    },
    {
      id: 'publish',
      title: 'Publish, then mark as sent',
      description:
        'The relay publishes each event to the broker and marks the outbox row sent once the broker acknowledges it.',
      activeNodes: ['relay', 'broker'],
      activeEdges: ['e-r-b'],
      packets: [
        { from: 'relay', to: 'broker', color: PUB, label: 'OrderPlaced' },
        { from: 'broker', to: 'relay', color: PUB, label: 'ack', delay: 0.7 },
      ],
    },
    {
      id: 'crash',
      title: 'Crash-safe: re-read and re-publish',
      description:
        'If the relay dies mid-publish, it simply re-reads the still-unmarked row and publishes again. Events are delivered at-least-once — so consumers dedupe with idempotency keys.',
      activeNodes: ['relay', 'broker'],
      activeEdges: ['e-r-b'],
      annotations: ['At-least-once → consumers must be idempotent'],
      packets: [{ from: 'relay', to: 'broker', color: RETRY, label: 're-publish' }],
    },
    {
      id: 'recap',
      title: 'Reliable events, guaranteed',
      description:
        'The event is published if and only if the business change committed — the reliable backbone under event-driven systems and sagas. The cost is an outbox table and a relay to operate.',
      activeNodes: ['svc', 'db', 'relay', 'broker'],
      activeEdges: ['e-s-db', 'e-db-r', 'e-r-b'],
      annotations: ['Publish iff the change committed'],
    },
  ],
  content,
}
