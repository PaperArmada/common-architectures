import type { Architecture } from '../types'
import content from '../content/dns.mdx'

const ASK = '#38bdf8'
const ANSWER = '#34d399'
const WALK = '#c084fc'

export const dns: Architecture = {
  slug: 'dns',
  title: 'DNS & Anycast',
  category: 'core-web',
  tagline: 'Translate a name to an address — and steer each user to the nearest healthy region.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client · EU', kind: 'client', x: 10, y: 50 },
    { id: 'resolver', label: 'Resolver', sublabel: 'recursive', kind: 'registry', x: 36, y: 50 },
    { id: 'auth', label: 'Authoritative', sublabel: 'example.com', kind: 'registry', x: 62, y: 50 },
    { id: 'eu', label: 'EU server', kind: 'server', x: 88, y: 26 },
    { id: 'us', label: 'US server', kind: 'server', x: 88, y: 74 },
  ],
  edges: [
    { id: 'e-c-r', from: 'client', to: 'resolver' },
    { id: 'e-r-a', from: 'resolver', to: 'auth' },
    { id: 'e-c-eu', from: 'client', to: 'eu' },
    { id: 'e-c-us', from: 'client', to: 'us' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Names in, addresses out',
      description:
        'Every request starts with a name like example.com, but the network only routes to IP addresses. DNS is the global lookup that translates one to the other — before any load balancer or server is involved.',
      activeNodes: ['client', 'resolver'],
    },
    {
      id: 'lookup',
      title: 'Ask the resolver',
      description:
        'The client asks a recursive resolver to look up example.com. The resolver will do the legwork of finding the answer.',
      activeNodes: ['client', 'resolver'],
      activeEdges: ['e-c-r'],
      packets: [{ from: 'client', to: 'resolver', color: ASK, label: 'example.com?' }],
    },
    {
      id: 'walk',
      title: 'Walk the hierarchy',
      description:
        'The resolver walks root → .com → the authoritative nameserver, caching each step by its TTL. The authoritative server returns the record (an A record with the IP).',
      activeNodes: ['resolver', 'auth'],
      activeEdges: ['e-r-a'],
      annotations: ['root → .com → authoritative · cached by TTL'],
      packets: [
        { from: 'resolver', to: 'auth', color: WALK, label: 'who serves it?' },
        { from: 'auth', to: 'resolver', color: ANSWER, label: 'A → 1.2.3.4', delay: 0.8 },
      ],
    },
    {
      id: 'geo',
      title: 'GeoDNS: answer with the nearest region',
      description:
        'The answer need not be the same for everyone. GeoDNS returns the IP of the region closest to the user — our EU client is pointed at the EU server, cutting latency. Health-based routing also steers around a failed region.',
      activeNodes: ['resolver', 'client', 'eu'],
      activeEdges: ['e-c-r', 'e-c-eu'],
      annotations: ['EU user → EU server'],
      packets: [
        { from: 'resolver', to: 'client', color: ANSWER, label: 'EU IP' },
        { from: 'client', to: 'eu', color: ASK, label: 'connect', delay: 0.6 },
      ],
    },
    {
      id: 'anycast',
      title: 'Anycast: one IP, many locations',
      description:
        'Anycast advertises a single IP from many locations at the network layer, so the internet itself routes each user to the closest instance. It’s how CDNs and big DNS providers put an entry point near everyone.',
      activeNodes: ['eu', 'us'],
      annotations: ['Same IP, network routes to closest'],
    },
    {
      id: 'recap',
      title: 'Powerful, but cached',
      description:
        'DNS is global, cache-friendly, and a natural place for geo-routing and failover. But caching cuts both ways — TTLs mean changes and failovers aren’t instant — and it’s coarse-grained: it picks an endpoint, it doesn’t balance individual requests.',
      activeNodes: ['client', 'resolver', 'auth'],
      annotations: ['TTL caching delays changes'],
    },
  ],
  content,
}
