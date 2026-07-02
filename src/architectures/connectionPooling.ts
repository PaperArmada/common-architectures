import type { Architecture } from '../types'
import content from '../content/connection-pooling.mdx'

const BORROW = '#38bdf8'
const RETURN = '#34d399'
const QUERY = '#a78bfa'

export const connectionPooling: Architecture = {
  slug: 'connection-pooling',
  title: 'Connection Pooling',
  category: 'data-scaling',
  tagline: 'Reuse a small set of warm database connections instead of one per request.',
  level: 'core',
  nodes: [
    { id: 'app1', label: 'App 1', kind: 'server', x: 12, y: 20 },
    { id: 'app2', label: 'App 2', kind: 'server', x: 12, y: 50 },
    { id: 'app3', label: 'App 3', kind: 'server', x: 12, y: 80 },
    { id: 'pool', label: 'Conn Pool', sublabel: 'pgbouncer · 20 conns', kind: 'queue', x: 47, y: 50 },
    { id: 'db', label: 'Database', sublabel: 'max 100 conns', kind: 'db', x: 82, y: 50 },
  ],
  edges: [
    { id: 'e-1-p', from: 'app1', to: 'pool' },
    { id: 'e-2-p', from: 'app2', to: 'pool' },
    { id: 'e-3-p', from: 'app3', to: 'pool' },
    { id: 'e-p-db', from: 'pool', to: 'db' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Opening a connection is expensive',
      description:
        'Every new database connection means a TCP handshake, TLS negotiation, and authentication before a single query runs — and the database caps how many it will accept.',
      activeNodes: ['app1', 'app2', 'app3', 'db'],
    },
    {
      id: 'warm',
      title: 'The pool keeps warm connections ready',
      description:
        'Instead of connecting per request, a pool opens a fixed, modest number of connections to the database up front and holds them open and ready.',
      activeNodes: ['pool', 'db'],
      activeEdges: ['e-p-db'],
      annotations: ['20 warm connections held open'],
      packets: [{ from: 'pool', to: 'db', color: RETURN, label: 'keep-alive' }],
    },
    {
      id: 'borrow',
      title: 'A request borrows a connection',
      description:
        'When App 1 needs the database, it borrows an already-open connection from the pool and runs its query immediately — no handshake, no auth delay.',
      activeNodes: ['app1', 'pool', 'db'],
      activeEdges: ['e-1-p', 'e-p-db'],
      packets: [
        { from: 'app1', to: 'pool', color: BORROW, label: 'borrow' },
        { from: 'pool', to: 'db', color: QUERY, label: 'query', delay: 0.5 },
        { from: 'db', to: 'pool', color: QUERY, label: 'result', delay: 1.1 },
      ],
    },
    {
      id: 'return',
      title: 'When done, the connection returns to the pool',
      description:
        'The connection is handed back — not closed. It stays warm, ready for the next request to reuse. That reuse is the whole point.',
      activeNodes: ['app1', 'pool'],
      activeEdges: ['e-1-p'],
      packets: [{ from: 'pool', to: 'app1', color: RETURN, label: 'result + release' }],
    },
    {
      id: 'share',
      title: 'Many requests share few connections',
      description:
        'Under load, all three app instances funnel through the same small pool. Hundreds of app requests are served by tens of database connections.',
      activeNodes: ['app1', 'app2', 'app3', 'pool', 'db'],
      activeEdges: ['e-1-p', 'e-2-p', 'e-3-p', 'e-p-db'],
      packets: [
        { from: 'app1', to: 'pool', color: BORROW, label: 'borrow' },
        { from: 'app2', to: 'pool', color: BORROW, label: 'borrow', delay: 0.15 },
        { from: 'app3', to: 'pool', color: BORROW, label: 'wait…', delay: 0.3 },
        { from: 'pool', to: 'db', color: QUERY, delay: 0.7 },
        { from: 'pool', to: 'db', color: QUERY, delay: 0.9 },
      ],
    },
    {
      id: 'tune',
      title: 'The database stays under its ceiling',
      description:
        'Without the pool, a traffic burst would open thousands of connections and the database would start rejecting them. The pool keeps it comfortably below its 100-connection cap. Size it right: too small and requests wait, too big and you overload the DB.',
      activeNodes: ['pool', 'db'],
      activeEdges: ['e-p-db'],
      annotations: ['20 conns ≪ 100 cap ✓'],
      packets: [{ from: 'pool', to: 'db', color: QUERY, label: 'steady load' }],
    },
  ],
  content,
}
