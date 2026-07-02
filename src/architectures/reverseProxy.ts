import type { Architecture } from '../types'
import content from '../content/reverse-proxy.mdx'

const REQ = '#38bdf8'
const RESP = '#34d399'
const STATIC = '#34d399'

export const reverseProxy: Architecture = {
  slug: 'reverse-proxy',
  title: 'Reverse Proxy',
  category: 'core-web',
  tagline: 'A single front door that terminates TLS, serves static, and routes to backends.',
  level: 'intro',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 11, y: 50 },
    { id: 'proxy', label: 'Reverse Proxy', sublabel: 'TLS · routing', kind: 'gateway', x: 43, y: 50 },
    { id: 'app', label: 'App server', sublabel: 'plain HTTP', kind: 'server', x: 81, y: 28 },
    { id: 'static', label: 'Static files', kind: 'storage', x: 81, y: 74 },
  ],
  edges: [
    { id: 'e-c-p', from: 'client', to: 'proxy' },
    { id: 'e-p-a', from: 'proxy', to: 'app' },
    { id: 'e-p-s', from: 'proxy', to: 'static' },
  ],
  steps: [
    {
      id: 'intro',
      title: "Don't expose app servers directly",
      description:
        'The public internet should not talk straight to your application. Something needs to present one address, handle encryption, and hide the internal layout.',
      activeNodes: ['app', 'static'],
    },
    {
      id: 'entry',
      title: 'One public entry point',
      description:
        'Clients connect only to the reverse proxy over HTTPS. Whatever the backend topology, the outside world sees a single address.',
      activeNodes: ['client', 'proxy'],
      activeEdges: ['e-c-p'],
      packets: [{ from: 'client', to: 'proxy', color: REQ, label: 'HTTPS request' }],
    },
    {
      id: 'tls',
      title: 'TLS terminated once, at the edge',
      description:
        'The proxy decrypts HTTPS here, so backends can speak plain HTTP internally and none of them need their own certificates.',
      activeNodes: ['proxy'],
      activeEdges: ['e-c-p'],
      annotations: ['Decrypt HTTPS once', 'Backends stay plain HTTP'],
      packets: [{ from: 'client', to: 'proxy', color: REQ, label: '🔒 → 📄' }],
    },
    {
      id: 'route',
      title: 'Route by path to the right backend',
      description:
        'The proxy forwards /api to the application server and everything else to the static bundle — routing on path or host.',
      activeNodes: ['proxy', 'app', 'static'],
      activeEdges: ['e-p-a', 'e-p-s'],
      packets: [
        { from: 'proxy', to: 'app', color: REQ, label: '/api → app' },
        { from: 'proxy', to: 'static', color: STATIC, label: '/ → static', delay: 0.3 },
      ],
    },
    {
      id: 'response',
      title: 'The response flows back through',
      description:
        'The backend answers, the proxy re-encrypts and can compress the response, and the client gets a single clean reply. Backends stay hidden.',
      activeNodes: ['app', 'proxy', 'client'],
      activeEdges: ['e-p-a', 'e-c-p'],
      packets: [
        { from: 'app', to: 'proxy', color: RESP, label: '200' },
        { from: 'proxy', to: 'client', color: RESP, label: '🔒 200 gzip', delay: 0.5 },
      ],
    },
  ],
  content,
}
