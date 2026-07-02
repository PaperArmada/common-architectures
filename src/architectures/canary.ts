import type { Architecture } from '../types'
import content from '../content/canary.mdx'

const STABLE = '#38bdf8'
const CANARY = '#a78bfa'
const WATCH = '#a3e635'
const RAMP = '#34d399'
const BAD = '#f87171'

export const canary: Architecture = {
  slug: 'canary',
  title: 'Canary Release',
  category: 'delivery',
  tagline: 'Expose a new version to a small slice of traffic, watch, then ramp or roll back.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Traffic', kind: 'client', x: 11, y: 50 },
    { id: 'split', label: 'Traffic Split', sublabel: 'weighted', kind: 'lb', x: 40, y: 50 },
    { id: 'stable', label: 'Stable · v1', sublabel: '95%', kind: 'server', x: 80, y: 26 },
    { id: 'canary', label: 'Canary · v2', sublabel: '5%', kind: 'server', x: 80, y: 72 },
    { id: 'monitor', label: 'Metrics', sublabel: 'vs. baseline', kind: 'monitor', x: 40, y: 86 },
  ],
  edges: [
    { id: 'e-c-s', from: 'client', to: 'split' },
    { id: 'e-s-st', from: 'split', to: 'stable' },
    { id: 'e-s-ca', from: 'split', to: 'canary' },
    { id: 'e-ca-m', from: 'canary', to: 'monitor', dashed: true },
    { id: 'e-m-s', from: 'monitor', to: 'split', dashed: true },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Don’t ship to everyone at once',
      description:
        'A release that passed testing can still fail under real traffic. Sending it to all users turns a subtle bug into a full outage.',
      activeNodes: ['stable', 'canary'],
    },
    {
      id: 'split',
      title: 'Send a small slice to the canary',
      description:
        'Most traffic stays on stable v1; a small percentage — the canary — goes to v2. Only a few users are exposed to the new version.',
      activeNodes: ['client', 'split', 'stable', 'canary'],
      activeEdges: ['e-c-s', 'e-s-st', 'e-s-ca'],
      annotations: ['95% stable · 5% canary'],
      packets: [
        { from: 'client', to: 'split', color: STABLE, label: 'requests' },
        { from: 'split', to: 'stable', color: STABLE, delay: 0.4 },
        { from: 'split', to: 'stable', color: STABLE, delay: 0.55 },
        { from: 'split', to: 'canary', color: CANARY, label: '5%', delay: 0.7 },
      ],
    },
    {
      id: 'watch',
      title: 'Watch the canary’s metrics',
      description:
        'Error rate, latency, resource use, and business signals from the canary are compared against the stable baseline. This is the decision point.',
      activeNodes: ['canary', 'monitor'],
      activeEdges: ['e-ca-m'],
      annotations: ['Compare error rate · latency vs. baseline'],
      packets: [{ from: 'canary', to: 'monitor', color: WATCH, label: 'metrics' }],
    },
    {
      id: 'ramp',
      title: 'Healthy → ramp it up',
      description:
        'The canary looks good, so shift progressively more traffic to v2 — 5% → 25% → 50% → 100% — until it fully replaces stable.',
      activeNodes: ['split', 'canary'],
      activeEdges: ['e-s-ca'],
      annotations: ['Promote: 5% → 25% → 50% → 100%'],
      packets: [
        { from: 'split', to: 'canary', color: RAMP, label: '→ more' },
        { from: 'split', to: 'canary', color: RAMP, delay: 0.2 },
        { from: 'split', to: 'canary', color: RAMP, delay: 0.4 },
      ],
    },
    {
      id: 'abort',
      title: 'Unhealthy → auto-rollback',
      description:
        'If the metrics regress instead, the controller routes the canary’s traffic back to stable — automatically, in minutes. Only the small canary slice was ever affected: the blast radius stayed tiny.',
      activeNodes: ['monitor', 'split', 'stable'],
      failedNodes: ['canary'],
      activeEdges: ['e-m-s', 'e-s-st'],
      annotations: ['Metrics regressed → abort', 'Tiny blast radius'],
      packets: [
        { from: 'monitor', to: 'split', color: BAD, label: 'abort' },
        { from: 'split', to: 'stable', color: STABLE, label: 'back to v1', delay: 0.5 },
      ],
    },
  ],
  content,
}
