import type { Architecture } from '../types'
import content from '../content/pub-sub.mdx'

const EVENT = '#2dd4bf'
const COPY = '#38bdf8'
const NEW = '#34d399'

export const pubSub: Architecture = {
  slug: 'pub-sub',
  title: 'Publish / Subscribe',
  category: 'async',
  tagline: 'One event, delivered to every interested subscriber — publisher stays decoupled.',
  level: 'core',
  nodes: [
    { id: 'pub', label: 'Order svc', sublabel: 'publisher', kind: 'server', x: 12, y: 50 },
    { id: 'topic', label: 'Topic', sublabel: 'orders.created', kind: 'broker', x: 44, y: 50 },
    { id: 'email', label: 'Email svc', kind: 'server', x: 82, y: 18 },
    { id: 'analytics', label: 'Analytics', kind: 'server', x: 82, y: 50 },
    { id: 'inventory', label: 'Inventory', kind: 'server', x: 82, y: 82 },
  ],
  edges: [
    { id: 'e-p-t', from: 'pub', to: 'topic' },
    { id: 'e-t-e', from: 'topic', to: 'email' },
    { id: 'e-t-a', from: 'topic', to: 'analytics' },
    { id: 'e-t-i', from: 'topic', to: 'inventory' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One event, many interested parties',
      description:
        'When an order is placed, several services need to know: email, analytics, inventory. The publisher should not have to call each one directly.',
      activeNodes: ['pub', 'email', 'analytics', 'inventory'],
    },
    {
      id: 'publish',
      title: 'Publish to a topic, not to a service',
      description:
        'The order service emits an event to a topic. It does not know or care who is listening — it just announces that something happened.',
      activeNodes: ['pub', 'topic'],
      activeEdges: ['e-p-t'],
      packets: [{ from: 'pub', to: 'topic', color: EVENT, label: 'OrderCreated' }],
    },
    {
      id: 'fanout',
      title: 'The broker fans out a copy to every subscriber',
      description:
        'Each subscriber of the topic receives its own copy of the event, all at once.',
      activeNodes: ['topic', 'email', 'analytics', 'inventory'],
      activeEdges: ['e-t-e', 'e-t-a', 'e-t-i'],
      packets: [
        { from: 'topic', to: 'email', color: COPY, label: 'copy' },
        { from: 'topic', to: 'analytics', color: COPY, label: 'copy' },
        { from: 'topic', to: 'inventory', color: COPY, label: 'copy' },
      ],
    },
    {
      id: 'react',
      title: 'Each subscriber reacts independently',
      description:
        'Email sends a confirmation, analytics records the sale, inventory decrements stock — all in parallel, none aware of the others.',
      activeNodes: ['email', 'analytics', 'inventory'],
    },
    {
      id: 'extend',
      title: 'Add a subscriber without touching the publisher',
      description:
        'A new recommendations service just subscribes to the topic and starts receiving events. The publisher never changes — this loose coupling is the whole point.',
      activeNodes: ['topic', 'inventory'],
      activeEdges: ['e-t-i'],
      annotations: ['New subscriber, zero publisher changes'],
      packets: [{ from: 'topic', to: 'inventory', color: NEW, label: 'also delivered' }],
    },
    {
      id: 'contrast',
      title: 'Fan-out, not load-balancing',
      description:
        'This is the key difference from a work queue: pub/sub delivers every message to every subscriber. A work queue would give each message to just one consumer to share the work.',
      activeNodes: ['topic', 'email', 'analytics', 'inventory'],
      activeEdges: ['e-t-e', 'e-t-a', 'e-t-i'],
      annotations: ['Every subscriber gets every message'],
      packets: [
        { from: 'topic', to: 'email', color: COPY },
        { from: 'topic', to: 'analytics', color: COPY },
        { from: 'topic', to: 'inventory', color: COPY },
      ],
    },
  ],
  content,
}
