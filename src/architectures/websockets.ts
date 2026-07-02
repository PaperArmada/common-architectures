import type { Architecture } from '../types'
import content from '../content/websockets.mdx'

const UP = '#38bdf8'
const OK = '#34d399'
const PUSH = '#c084fc'
const SEND = '#38bdf8'

export const websockets: Architecture = {
  slug: 'websockets',
  title: 'WebSockets / Real-time',
  category: 'core-web',
  tagline: 'One long-lived, two-way connection so the server can push the instant data changes.',
  level: 'core',
  nodes: [
    { id: 'alice', label: 'Alice', kind: 'client', x: 14, y: 26 },
    { id: 'bob', label: 'Bob', kind: 'client', x: 14, y: 74 },
    { id: 'server', label: 'WS Server', kind: 'server', x: 72, y: 50 },
  ],
  edges: [
    { id: 'e-a-s', from: 'alice', to: 'server' },
    { id: 'e-b-s', from: 'bob', to: 'server' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'HTTP can’t push',
      description:
        'Request/response means the client must ask before it can learn anything. For live features — chat, presence, dashboards — the server needs to send data the moment it changes.',
      activeNodes: ['alice', 'bob', 'server'],
    },
    {
      id: 'upgrade',
      title: 'Upgrade the connection',
      description:
        'The client sends an ordinary HTTP request with an Upgrade header. The server agrees with 101 Switching Protocols, and that same TCP connection becomes a WebSocket.',
      activeNodes: ['alice', 'server'],
      activeEdges: ['e-a-s'],
      packets: [
        { from: 'alice', to: 'server', color: UP, label: 'Upgrade: websocket' },
        { from: 'server', to: 'alice', color: OK, label: '101 Switching', delay: 0.7 },
      ],
    },
    {
      id: 'open',
      title: 'The socket stays open',
      description:
        'Both Alice and Bob now hold a persistent, two-way connection. No new request per message, no polling — either side can send at any time.',
      activeNodes: ['alice', 'bob', 'server'],
      activeEdges: ['e-a-s', 'e-b-s'],
      annotations: ['Long-lived sockets, both directions'],
    },
    {
      id: 'send',
      title: 'A client sends a message',
      description:
        'Alice posts to the chat. Her message travels up the open socket as a small frame — far cheaper than a fresh HTTP request.',
      activeNodes: ['alice', 'server'],
      activeEdges: ['e-a-s'],
      packets: [{ from: 'alice', to: 'server', color: SEND, label: 'hello 👋' }],
    },
    {
      id: 'push',
      title: 'The server pushes, unprompted',
      description:
        'The server immediately broadcasts the new message down Bob’s socket — he never asked for it. This server-initiated push is what plain HTTP can’t do.',
      activeNodes: ['server', 'bob'],
      activeEdges: ['e-b-s'],
      annotations: ['Server → client, no request'],
      packets: [{ from: 'server', to: 'bob', color: PUSH, label: 'push: hello 👋' }],
    },
    {
      id: 'recap',
      title: 'Real-time, at a cost',
      description:
        'You get low-latency, bidirectional communication. The price is stateful, long-lived connections: scaling means many open sockets, sticky-aware balancing, and a shared pub/sub layer to broadcast across server instances.',
      activeNodes: ['alice', 'bob', 'server'],
      activeEdges: ['e-a-s', 'e-b-s'],
      annotations: ['Stateful connections complicate scaling'],
    },
  ],
  content,
}
