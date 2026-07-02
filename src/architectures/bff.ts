import type { Architecture } from '../types'
import content from '../content/bff.mdx'

const RICH = '#38bdf8'
const TRIM = '#34d399'
const CALL = '#c084fc'

export const bff: Architecture = {
  slug: 'bff',
  title: 'Backend for Frontend',
  category: 'core-web',
  tagline: 'A dedicated backend per client, aggregating services into exactly what each one needs.',
  level: 'core',
  nodes: [
    { id: 'web', label: 'Web app', kind: 'client', x: 11, y: 26 },
    { id: 'mobile', label: 'Mobile app', kind: 'client', x: 11, y: 74 },
    { id: 'webbff', label: 'Web BFF', kind: 'server', x: 42, y: 26 },
    { id: 'mobbff', label: 'Mobile BFF', kind: 'server', x: 42, y: 74 },
    { id: 'users', label: 'Users', kind: 'server', x: 80, y: 18 },
    { id: 'orders', label: 'Orders', kind: 'server', x: 80, y: 50 },
    { id: 'catalog', label: 'Catalog', kind: 'server', x: 80, y: 82 },
  ],
  edges: [
    { id: 'e-w-wb', from: 'web', to: 'webbff' },
    { id: 'e-m-mb', from: 'mobile', to: 'mobbff' },
    { id: 'e-wb-u', from: 'webbff', to: 'users' },
    { id: 'e-wb-o', from: 'webbff', to: 'orders' },
    { id: 'e-wb-c', from: 'webbff', to: 'catalog' },
    { id: 'e-mb-u', from: 'mobbff', to: 'users' },
    { id: 'e-mb-o', from: 'mobbff', to: 'orders' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'One API can’t please every client',
      description:
        'A web dashboard wants everything in one rich call; a phone wants a trimmed payload; a watch wants almost nothing. A single general-purpose API leads to over-fetching, chatty round-trips, and client-specific bloat.',
      activeNodes: ['web', 'mobile', 'users', 'orders', 'catalog'],
    },
    {
      id: 'perclient',
      title: 'A backend per client',
      description:
        'Each frontend gets its own BFF, built and owned for it, sitting between that client and the shared downstream services.',
      activeNodes: ['web', 'webbff', 'mobile', 'mobbff'],
      activeEdges: ['e-w-wb', 'e-m-mb'],
      annotations: ['Web BFF · Mobile BFF'],
    },
    {
      id: 'web',
      title: 'Web BFF aggregates a rich payload',
      description:
        'The web dashboard makes one call; its BFF fans out to Users, Orders, and Catalog, then combines everything into a single rich response — no chatty round-trips from the browser.',
      activeNodes: ['web', 'webbff', 'users', 'orders', 'catalog'],
      activeEdges: ['e-w-wb', 'e-wb-u', 'e-wb-o', 'e-wb-c'],
      annotations: ['Everything in one call'],
      packets: [
        { from: 'web', to: 'webbff', color: RICH, label: 'GET dashboard' },
        { from: 'webbff', to: 'users', color: CALL, delay: 0.4 },
        { from: 'webbff', to: 'orders', color: CALL, delay: 0.5 },
        { from: 'webbff', to: 'catalog', color: CALL, delay: 0.6 },
      ],
    },
    {
      id: 'mobile',
      title: 'Mobile BFF trims to essentials',
      description:
        'The mobile BFF calls only the services the phone needs and returns a lean, mobile-shaped payload. Client-specific concerns live here, keeping the downstream services generic.',
      activeNodes: ['mobile', 'mobbff', 'users', 'orders'],
      activeEdges: ['e-m-mb', 'e-mb-u', 'e-mb-o'],
      annotations: ['Trimmed, mobile-shaped payload'],
      packets: [
        { from: 'mobile', to: 'mobbff', color: TRIM, label: 'GET home' },
        { from: 'mobbff', to: 'users', color: CALL, delay: 0.4 },
        { from: 'mobbff', to: 'orders', color: CALL, delay: 0.5 },
      ],
    },
    {
      id: 'vs-gateway',
      title: 'BFF vs. a shared gateway',
      description:
        'A single API gateway is one front door for everyone; a BFF is one front door per client type. You often see both — a gateway for cross-cutting concerns, BFFs for client-specific shaping. A BFF is essentially “a gateway per experience.”',
      activeNodes: ['webbff', 'mobbff'],
      annotations: ['One door per client, not per system'],
    },
    {
      id: 'recap',
      title: 'Tailored, at a cost',
      description:
        'Each client gets an efficient API its team can evolve independently. The trade-off is more services to run and a risk of duplicated logic across BFFs — best when clients genuinely diverge, overkill when they’d share one API happily.',
      activeNodes: ['webbff', 'mobbff', 'users', 'orders', 'catalog'],
      annotations: ['Watch for duplicated logic'],
    },
  ],
  content,
}
