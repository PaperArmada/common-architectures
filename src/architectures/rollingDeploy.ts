import type { Architecture } from '../types'
import content from '../content/rolling-deploy.mdx'

const REQ = '#38bdf8'
const NEW = '#34d399'
const UPD = '#a78bfa'

export const rollingDeploy: Architecture = {
  slug: 'rolling-deploy',
  title: 'Rolling Deployment',
  category: 'delivery',
  tagline: 'Replace instances a few at a time — zero downtime, no second environment.',
  level: 'intro',
  nodes: [
    { id: 'lb', label: 'Load Balancer', kind: 'lb', x: 16, y: 50 },
    { id: 's1', label: 'srv 1', sublabel: 'v1', kind: 'server', x: 58, y: 18 },
    { id: 's2', label: 'srv 2', sublabel: 'v1', kind: 'server', x: 58, y: 50 },
    { id: 's3', label: 'srv 3', sublabel: 'v1', kind: 'server', x: 58, y: 82 },
  ],
  edges: [
    { id: 'e-1', from: 'lb', to: 's1' },
    { id: 'e-2', from: 'lb', to: 's2' },
    { id: 'e-3', from: 'lb', to: 's3' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'The whole fleet is on v1',
      description:
        'Three instances sit behind the load balancer, all serving version 1. We want to move to v2 with no downtime and no second environment.',
      activeNodes: ['lb', 's1', 's2', 's3'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
    },
    {
      id: 'drain1',
      title: 'Batch 1: drain and upgrade srv 1',
      description:
        'Take srv 1 out of the load balancer rotation and upgrade it to v2. Traffic keeps flowing to srv 2 and srv 3 — capacity dips only by one instance.',
      activeNodes: ['lb', 's2', 's3'],
      failedNodes: ['s1'],
      activeEdges: ['e-2', 'e-3'],
      annotations: ['srv 1 out of rotation → upgrading'],
      packets: [
        { from: 'lb', to: 's2', color: REQ, label: 'traffic' },
        { from: 'lb', to: 's3', color: REQ, delay: 0.2 },
      ],
    },
    {
      id: 'rejoin1',
      title: 'Health check passes → rejoin',
      description:
        'Once srv 1 comes up healthy on v2, it returns to the load balancer and starts taking traffic again. One down, two to go.',
      activeNodes: ['lb', 's1'],
      activeEdges: ['e-1'],
      annotations: ['srv 1 → v2 ✓, back in rotation'],
      packets: [{ from: 'lb', to: 's1', color: NEW, label: 'v2 traffic' }],
    },
    {
      id: 'batch2',
      title: 'Roll the next batch',
      description:
        'Repeat with srv 2: drain, upgrade, health-check, rejoin — while srv 1 (v2) and srv 3 (v1) keep serving. Mid-roll, both versions are live at once.',
      activeNodes: ['lb', 's1', 's3'],
      failedNodes: ['s2'],
      activeEdges: ['e-1', 'e-3'],
      annotations: ['srv 2 upgrading', 'v1 and v2 serving together'],
      packets: [
        { from: 'lb', to: 's1', color: NEW, label: 'v2' },
        { from: 'lb', to: 's3', color: REQ, label: 'v1', delay: 0.2 },
      ],
    },
    {
      id: 'done',
      title: 'The whole fleet reaches v2',
      description:
        'Batch by batch, every instance is now on v2 — with no downtime and no extra environment. If a batch had come up unhealthy, you’d simply stop the roll with most of the fleet still good.',
      activeNodes: ['lb', 's1', 's2', 's3'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
      annotations: ['All on v2 ✓'],
      packets: [
        { from: 'lb', to: 's1', color: NEW },
        { from: 'lb', to: 's2', color: NEW, delay: 0.15 },
        { from: 'lb', to: 's3', color: NEW, delay: 0.3 },
      ],
    },
    {
      id: 'caveat',
      title: 'The mixed-version constraint',
      description:
        'Because v1 and v2 serve simultaneously during the roll, changes must be backward compatible — API shapes and especially database schemas have to work for both at once (expand-then-contract migrations).',
      activeNodes: ['s1', 's2', 's3'],
      annotations: ['Changes must be backward compatible'],
      packets: [{ from: 'lb', to: 's2', color: UPD, label: 'compat required' }],
    },
  ],
  content,
}
