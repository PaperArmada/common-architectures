import type { Architecture } from '../types'
import content from '../content/load-balancer.mdx'

const CLIENT = '#38bdf8'
const RESP = '#34d399'

export const loadBalancer: Architecture = {
  slug: 'load-balancer',
  title: 'Load Balancer',
  category: 'core-web',
  tagline: 'Spread traffic across a pool of identical servers.',
  level: 'intro',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 11, y: 50 },
    { id: 'lb', label: 'Load Balancer', sublabel: 'round-robin', kind: 'lb', x: 40, y: 50 },
    { id: 's1', label: 'Server A', kind: 'server', x: 78, y: 20 },
    { id: 's2', label: 'Server B', kind: 'server', x: 78, y: 50 },
    { id: 's3', label: 'Server C', kind: 'server', x: 78, y: 80 },
  ],
  edges: [
    { id: 'e-c-lb', from: 'client', to: 'lb' },
    { id: 'e-lb-s1', from: 'lb', to: 's1' },
    { id: 'e-lb-s2', from: 'lb', to: 's2' },
    { id: 'e-lb-s3', from: 'lb', to: 's3' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One server has a ceiling',
      description:
        'A single machine can only handle so many concurrent requests. To grow past it, we run several identical servers — but clients only know one address.',
      activeNodes: ['client'],
    },
    {
      id: 'request',
      title: 'Everything hits the balancer first',
      description:
        'Clients connect to the load balancer, not to any individual server. It is the single public entry point for the whole pool.',
      activeNodes: ['client', 'lb'],
      activeEdges: ['e-c-lb'],
      packets: [{ from: 'client', to: 'lb', color: CLIENT, label: 'request' }],
    },
    {
      id: 'rr-1',
      title: 'Round-robin: request → Server A',
      description:
        'The balancer forwards the request to the next server in rotation. With round-robin, the first request goes to Server A.',
      activeNodes: ['lb', 's1'],
      activeEdges: ['e-c-lb', 'e-lb-s1'],
      packets: [
        { from: 'client', to: 'lb', color: CLIENT, label: 'req 1' },
        { from: 'lb', to: 's1', color: CLIENT, delay: 0.5 },
      ],
    },
    {
      id: 'rr-2',
      title: 'Next request → Server B',
      description:
        'The next request rotates to Server B, then the one after to Server C. Load is spread evenly across the pool.',
      activeNodes: ['lb', 's2'],
      activeEdges: ['e-c-lb', 'e-lb-s2'],
      packets: [
        { from: 'client', to: 'lb', color: CLIENT, label: 'req 2' },
        { from: 'lb', to: 's2', color: CLIENT, delay: 0.5 },
      ],
    },
    {
      id: 'health',
      title: 'Health checks catch a failure',
      description:
        'The balancer constantly probes each backend. Server B stops responding, so it is pulled from rotation — no client ever sees the outage.',
      activeNodes: ['lb'],
      failedNodes: ['s2'],
      annotations: ['Server B failed health check', 'Removed from rotation'],
    },
    {
      id: 'reroute',
      title: 'Traffic routes around the dead node',
      description:
        'With Server B out, requests are distributed only among the healthy servers. Capacity dips, but the service stays up.',
      activeNodes: ['lb', 's1', 's3'],
      failedNodes: ['s2'],
      activeEdges: ['e-lb-s1', 'e-lb-s3'],
      packets: [
        { from: 'client', to: 'lb', color: CLIENT, label: 'req 3' },
        { from: 'lb', to: 's1', color: CLIENT, delay: 0.5 },
        { from: 'client', to: 'lb', color: CLIENT, label: 'req 4', delay: 0.9 },
        { from: 'lb', to: 's3', color: CLIENT, delay: 1.4 },
      ],
    },
    {
      id: 'response',
      title: 'The response travels back',
      description:
        'The chosen server handles the request and its response flows back through the balancer to the client. To the client, the pool looks like one big server.',
      activeNodes: ['client', 'lb', 's1'],
      failedNodes: ['s2'],
      activeEdges: ['e-lb-s1', 'e-c-lb'],
      packets: [
        { from: 's1', to: 'lb', color: RESP, label: '200 OK' },
        { from: 'lb', to: 'client', color: RESP, delay: 0.5 },
      ],
    },
  ],
  content,
}
