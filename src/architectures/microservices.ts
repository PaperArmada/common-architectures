import type { Architecture } from '../types'
import content from '../content/microservices.mdx'

const REQ = '#38bdf8'
const DATA = '#fbbf24'
const CALL = '#c084fc'

export const microservices: Architecture = {
  slug: 'microservices',
  title: 'Microservices',
  category: 'distributed',
  tagline: 'Split the system by capability into independently deployable, self-owned services.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 8, y: 50 },
    { id: 'gw', label: 'Gateway', kind: 'gateway', x: 30, y: 50 },
    { id: 'users', label: 'Users', kind: 'server', x: 58, y: 20 },
    { id: 'orders', label: 'Orders', kind: 'server', x: 58, y: 50 },
    { id: 'pay', label: 'Payments', kind: 'server', x: 58, y: 80 },
    { id: 'usersdb', label: 'Users DB', kind: 'db', x: 88, y: 20 },
    { id: 'ordersdb', label: 'Orders DB', kind: 'db', x: 88, y: 50 },
    { id: 'paydb', label: 'Payments DB', kind: 'db', x: 88, y: 80 },
  ],
  edges: [
    { id: 'e-c-gw', from: 'client', to: 'gw' },
    { id: 'e-gw-u', from: 'gw', to: 'users' },
    { id: 'e-gw-o', from: 'gw', to: 'orders' },
    { id: 'e-gw-p', from: 'gw', to: 'pay' },
    { id: 'e-u-db', from: 'users', to: 'usersdb' },
    { id: 'e-o-db', from: 'orders', to: 'ordersdb' },
    { id: 'e-p-db', from: 'pay', to: 'paydb' },
    { id: 'e-o-u', from: 'orders', to: 'users' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Split the monolith by capability',
      description:
        'A monolith is one codebase and one deploy for everything. Microservices break it into services aligned to business capabilities — Users, Orders, Payments.',
      activeNodes: ['users', 'orders', 'pay'],
    },
    {
      id: 'own-data',
      title: 'Each service owns its own database',
      description:
        'No shared tables. A service never reaches into another’s data directly — it goes through that service’s API. This "database per service" rule is what keeps them truly independent.',
      activeNodes: ['users', 'orders', 'pay', 'usersdb', 'ordersdb', 'paydb'],
      activeEdges: ['e-u-db', 'e-o-db', 'e-p-db'],
      annotations: ['Database per service'],
    },
    {
      id: 'route',
      title: 'The gateway routes to the owning service',
      description:
        'A client request enters through the API gateway, which forwards it to the service that owns that capability — here, Orders reads from its own database.',
      activeNodes: ['client', 'gw', 'orders', 'ordersdb'],
      activeEdges: ['e-c-gw', 'e-gw-o', 'e-o-db'],
      packets: [
        { from: 'client', to: 'gw', color: REQ, label: 'GET /orders/42' },
        { from: 'gw', to: 'orders', color: REQ, delay: 0.4 },
        { from: 'orders', to: 'ordersdb', color: DATA, label: 'query', delay: 0.8 },
      ],
    },
    {
      id: 'inter-service',
      title: 'Services talk over the network, not via joins',
      description:
        'When Orders needs the customer’s name, it cannot join across databases — it makes a network call to the Users service. Every such call can be slow or fail, which shapes the whole design.',
      activeNodes: ['orders', 'users'],
      activeEdges: ['e-o-u'],
      annotations: ['Network call, not a DB join'],
      packets: [
        { from: 'orders', to: 'users', color: CALL, label: 'GET user' },
        { from: 'users', to: 'orders', color: CALL, delay: 0.7 },
      ],
    },
    {
      id: 'scale',
      title: 'Deploy and scale each service on its own',
      description:
        'The core payoff: ship Orders without redeploying Users, and run many copies of a hot service and one of the rest. Teams own their services end to end.',
      activeNodes: ['orders', 'ordersdb'],
      activeEdges: ['e-gw-o', 'e-o-db'],
      annotations: ['Scale Orders independently'],
    },
    {
      id: 'tradeoff',
      title: 'Trade: code complexity for distributed complexity',
      description:
        'You gain independent teams, deploys, and scaling — but inherit network failures, no cross-service transactions, eventual consistency, and much harder debugging. Start with a monolith; split when the seams are clear.',
      activeNodes: ['gw', 'users', 'orders', 'pay'],
      activeEdges: ['e-gw-u', 'e-gw-o', 'e-gw-p'],
      annotations: ['Distributed-systems complexity is the cost'],
    },
  ],
  content,
}
