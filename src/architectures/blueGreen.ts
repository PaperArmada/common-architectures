import type { Architecture } from '../types'
import content from '../content/blue-green.mdx'

const LIVE = '#38bdf8'
const DEPLOY = '#a78bfa'
const SWITCH = '#34d399'
const BACK = '#fbbf24'

export const blueGreen: Architecture = {
  slug: 'blue-green',
  title: 'Blue-Green Deployment',
  category: 'delivery',
  tagline: 'Flip traffic between two identical environments for instant cutover and rollback.',
  level: 'intro',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 12, y: 50 },
    { id: 'router', label: 'Router', sublabel: 'traffic switch', kind: 'lb', x: 41, y: 50 },
    { id: 'blue', label: 'Blue · v1', sublabel: 'live', kind: 'server', x: 79, y: 26 },
    { id: 'green', label: 'Green · v2', sublabel: 'idle', kind: 'server', x: 79, y: 74 },
  ],
  edges: [
    { id: 'e-c-r', from: 'client', to: 'router' },
    { id: 'e-r-b', from: 'router', to: 'blue' },
    { id: 'e-r-g', from: 'router', to: 'green' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Two identical environments',
      description:
        'Blue is the current live environment; Green is an idle, identical copy. Only one serves traffic at a time.',
      activeNodes: ['blue', 'green'],
    },
    {
      id: 'blue-live',
      title: 'Blue serves all traffic',
      description:
        'Right now the router sends 100% of requests to Blue running v1. Green sits idle, taking nothing.',
      activeNodes: ['client', 'router', 'blue'],
      activeEdges: ['e-c-r', 'e-r-b'],
      annotations: ['Blue = 100% live'],
      packets: [
        { from: 'client', to: 'router', color: LIVE, label: 'request' },
        { from: 'router', to: 'blue', color: LIVE, delay: 0.4 },
      ],
    },
    {
      id: 'deploy',
      title: 'Deploy the new version to Green',
      description:
        'v2 goes onto Green and you smoke-test it in a real production environment — while it still serves zero live traffic. Nothing user-facing has changed.',
      activeNodes: ['green'],
      annotations: ['v2 deployed to Green', '0 live traffic — safe to test'],
      packets: [{ from: 'router', to: 'green', color: DEPLOY, label: 'test only' }],
    },
    {
      id: 'switch',
      title: 'Flip: cut all traffic to Green',
      description:
        'Satisfied, you flip the router. In one move, every request now goes to Green running v2. Blue is no longer live.',
      activeNodes: ['client', 'router', 'green'],
      activeEdges: ['e-c-r', 'e-r-g'],
      annotations: ['Instant cutover → Green'],
      packets: [
        { from: 'client', to: 'router', color: SWITCH, label: 'request' },
        { from: 'router', to: 'green', color: SWITCH, delay: 0.4 },
      ],
    },
    {
      id: 'standby',
      title: 'Blue stays as a warm rollback',
      description:
        'Green is live; Blue keeps running untouched. If Green misbehaves, flip straight back to Blue — rollback is instant, no redeploy.',
      activeNodes: ['green', 'blue'],
      annotations: ['Green live · Blue = instant rollback'],
    },
    {
      id: 'rollback',
      title: 'Bad release? Flip back',
      description:
        'If v2 shows problems, the router flips traffic back to Blue in one move and users are on the known-good version again. The cost is double infrastructure during the window — and careful handling of DB migrations both versions must tolerate.',
      activeNodes: ['client', 'router', 'blue'],
      activeEdges: ['e-c-r', 'e-r-b'],
      annotations: ['Roll back → Blue, instantly'],
      packets: [
        { from: 'client', to: 'router', color: BACK, label: 'request' },
        { from: 'router', to: 'blue', color: BACK, delay: 0.4 },
      ],
    },
  ],
  content,
}
