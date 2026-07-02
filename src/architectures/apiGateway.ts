import type { Architecture } from '../types'
import content from '../content/api-gateway.mdx'

const REQ = '#38bdf8'
const RESP = '#34d399'
const GUARD = '#c084fc'

export const apiGateway: Architecture = {
  slug: 'api-gateway',
  title: 'API Gateway',
  category: 'core-web',
  tagline: 'One front door that authenticates, routes, and aggregates across services.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 11, y: 50 },
    { id: 'gw', label: 'API Gateway', sublabel: 'auth · routing', kind: 'gateway', x: 40, y: 50 },
    { id: 'users', label: 'Users svc', kind: 'server', x: 79, y: 18 },
    { id: 'orders', label: 'Orders svc', kind: 'server', x: 79, y: 50 },
    { id: 'pay', label: 'Payments svc', kind: 'server', x: 79, y: 82 },
  ],
  edges: [
    { id: 'e-c-gw', from: 'client', to: 'gw' },
    { id: 'e-gw-u', from: 'gw', to: 'users' },
    { id: 'e-gw-o', from: 'gw', to: 'orders' },
    { id: 'e-gw-p', from: 'gw', to: 'pay' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Many services, one confused client',
      description:
        'Split into services, the system exposes a dozen addresses. Where does auth happen? Rate limiting? Which service owns which path? Clients should not have to know.',
      activeNodes: ['users', 'orders', 'pay'],
    },
    {
      id: 'entry',
      title: 'Everything enters through the gateway',
      description:
        'Clients call one address — the gateway. They never talk to individual services directly.',
      activeNodes: ['client', 'gw'],
      activeEdges: ['e-c-gw'],
      packets: [{ from: 'client', to: 'gw', color: REQ, label: 'GET /orders/42' }],
    },
    {
      id: 'guard',
      title: 'Cross-cutting concerns, handled once',
      description:
        'Before routing anywhere, the gateway verifies the auth token, enforces rate limits, and logs the request — so every service does not reimplement them.',
      activeNodes: ['gw'],
      activeEdges: ['e-c-gw'],
      annotations: ['Verify token ✓', 'Check rate limit ✓', 'Log request'],
      packets: [{ from: 'client', to: 'gw', color: GUARD, label: 'Bearer …' }],
    },
    {
      id: 'route',
      title: 'Route by path to the right service',
      description:
        'With the request vetted, the gateway forwards it to the service that owns that path: /orders → the Orders service.',
      activeNodes: ['gw', 'orders'],
      activeEdges: ['e-gw-o'],
      packets: [{ from: 'gw', to: 'orders', color: REQ, label: '→ Orders' }],
    },
    {
      id: 'aggregate',
      title: 'Aggregate several services into one response',
      description:
        'A single screen often needs data from multiple services. The gateway fans out, calls each, and combines the results — saving the client many round-trips.',
      activeNodes: ['gw', 'users', 'orders', 'pay'],
      activeEdges: ['e-gw-u', 'e-gw-o', 'e-gw-p'],
      packets: [
        { from: 'gw', to: 'users', color: REQ, label: 'user' },
        { from: 'gw', to: 'orders', color: REQ, label: 'orders', delay: 0.15 },
        { from: 'gw', to: 'pay', color: REQ, label: 'balance', delay: 0.3 },
        { from: 'users', to: 'gw', color: RESP, delay: 1.0 },
        { from: 'orders', to: 'gw', color: RESP, delay: 1.15 },
        { from: 'pay', to: 'gw', color: RESP, delay: 1.3 },
      ],
    },
    {
      id: 'return',
      title: 'One combined answer to the client',
      description:
        'The gateway merges everything into a single response. To the client, the whole distributed system looks like one tidy API.',
      activeNodes: ['gw', 'client'],
      activeEdges: ['e-c-gw'],
      packets: [{ from: 'gw', to: 'client', color: RESP, label: '200 · combined' }],
    },
  ],
  content,
}
