import type { Architecture } from '../types'
import content from '../content/event-driven.mdx'

const EMIT = '#2dd4bf'
const REACT = '#38bdf8'

export const eventDriven: Architecture = {
  slug: 'event-driven',
  title: 'Event-Driven Architecture',
  category: 'async',
  tagline: 'Services emit facts and react to each other through a shared event bus.',
  level: 'advanced',
  nodes: [
    { id: 'order', label: 'Order svc', kind: 'server', x: 16, y: 24 },
    { id: 'payment', label: 'Payment svc', kind: 'server', x: 16, y: 76 },
    { id: 'bus', label: 'Event Bus', kind: 'broker', x: 50, y: 50 },
    { id: 'ship', label: 'Shipping svc', kind: 'server', x: 84, y: 24 },
    { id: 'notify', label: 'Notify svc', kind: 'server', x: 84, y: 76 },
  ],
  edges: [
    { id: 'e-order', from: 'order', to: 'bus' },
    { id: 'e-pay', from: 'payment', to: 'bus' },
    { id: 'e-ship', from: 'bus', to: 'ship' },
    { id: 'e-notify', from: 'bus', to: 'notify' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Coordinate without direct calls',
      description:
        'Instead of services calling each other in a brittle chain, each one announces facts that have happened — events — and others react. Control flow is inverted.',
      activeNodes: ['order', 'payment', 'ship', 'notify'],
    },
    {
      id: 'emit',
      title: 'A service emits an event',
      description:
        'The order service does its job and publishes OrderPlaced to the event bus. It does not call anyone directly, or know who will react.',
      activeNodes: ['order', 'bus'],
      activeEdges: ['e-order'],
      packets: [{ from: 'order', to: 'bus', color: EMIT, label: 'OrderPlaced' }],
    },
    {
      id: 'react-emit',
      title: 'A subscriber reacts — and emits its own event',
      description:
        'Payment is subscribed to OrderPlaced. It captures the charge, then emits PaymentCaptured back to the bus. Reactions cascade as new events.',
      activeNodes: ['bus', 'payment'],
      activeEdges: ['e-pay'],
      packets: [
        { from: 'bus', to: 'payment', color: REACT, label: 'OrderPlaced' },
        { from: 'payment', to: 'bus', color: EMIT, label: 'PaymentCaptured', delay: 0.9 },
      ],
    },
    {
      id: 'cascade',
      title: 'Multiple services react to one event',
      description:
        'Both Shipping and Notify are subscribed to PaymentCaptured, so both react — shipping schedules a delivery, notify sends a receipt. No coordinator told them to.',
      activeNodes: ['bus', 'ship', 'notify'],
      activeEdges: ['e-ship', 'e-notify'],
      packets: [
        { from: 'bus', to: 'ship', color: REACT, label: 'PaymentCaptured' },
        { from: 'bus', to: 'notify', color: REACT, label: 'PaymentCaptured', delay: 0.2 },
      ],
    },
    {
      id: 'choreography',
      title: 'Choreography: an emergent workflow',
      description:
        'The whole "place order" process emerged from small independent reactions — no central conductor. Each service knows only its own events, which makes the system easy to extend.',
      activeNodes: ['order', 'payment', 'ship', 'notify', 'bus'],
      activeEdges: ['e-order', 'e-pay', 'e-ship', 'e-notify'],
      annotations: ['No central coordinator'],
    },
    {
      id: 'tradeoff',
      title: 'The catch: the flow is implicit',
      description:
        'Because no one owns the end-to-end process, tracing "what happens when an order is placed" means following events across services. You need strong observability, and everything is eventually consistent.',
      activeNodes: ['bus'],
      annotations: ['Decoupled, but harder to trace', 'Eventually consistent'],
    },
  ],
  content,
}
