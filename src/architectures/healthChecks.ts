import type { Architecture } from '../types'
import content from '../content/health-checks.mdx'

const PROBE = '#38bdf8'
const OK = '#34d399'
const FAIL = '#f87171'
const RESTART = '#a78bfa'

export const healthChecks: Architecture = {
  slug: 'health-checks',
  title: 'Health Checks',
  category: 'observability',
  tagline: 'Endpoints that tell the platform whether an instance can serve — the basis of self-healing.',
  level: 'intro',
  nodes: [
    { id: 'lb', label: 'LB / Orchestrator', sublabel: 'prober', kind: 'lb', x: 16, y: 50 },
    { id: 's1', label: 'instance 1', kind: 'server', x: 62, y: 20 },
    { id: 's2', label: 'instance 2', kind: 'server', x: 62, y: 50 },
    { id: 's3', label: 'instance 3', kind: 'server', x: 62, y: 80 },
  ],
  edges: [
    { id: 'e-1', from: 'lb', to: 's1' },
    { id: 'e-2', from: 'lb', to: 's2' },
    { id: 'e-3', from: 'lb', to: 's3' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Should this instance get traffic?',
      description:
        'Load balancers, orchestrators, and autoscalers constantly make one decision — is this instance able to serve? They can’t guess; each instance must report for itself.',
      activeNodes: ['s1', 's2', 's3'],
    },
    {
      id: 'probe',
      title: 'Probe the health endpoint',
      description:
        'The prober hits each instance’s /healthz on an interval. A good check verifies the instance can actually do its job — e.g. reach its database.',
      activeNodes: ['lb', 's1', 's2', 's3'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
      packets: [
        { from: 'lb', to: 's1', color: PROBE, label: 'GET /healthz' },
        { from: 'lb', to: 's2', color: PROBE, label: 'GET /healthz', delay: 0.12 },
        { from: 'lb', to: 's3', color: PROBE, label: 'GET /healthz', delay: 0.24 },
      ],
    },
    {
      id: 'pass',
      title: 'Pass → stay in rotation',
      description:
        'Healthy instances answer 200 and keep receiving traffic. Everything is nominal.',
      activeNodes: ['s1', 's2', 's3', 'lb'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
      packets: [
        { from: 's1', to: 'lb', color: OK, label: '200' },
        { from: 's2', to: 'lb', color: OK, label: '200', delay: 0.12 },
        { from: 's3', to: 'lb', color: OK, label: '200', delay: 0.24 },
      ],
    },
    {
      id: 'readiness',
      title: 'Readiness fails → out of rotation',
      description:
        'Instance 2 can’t reach a dependency, so its readiness check fails. It’s pulled from traffic — but not killed. Used during startup, warm-up, or a brief dependency blip.',
      activeNodes: ['lb', 's1', 's3'],
      failedNodes: ['s2'],
      activeEdges: ['e-1', 'e-3'],
      annotations: ['Readiness fail → removed from traffic (not killed)'],
      packets: [
        { from: 's2', to: 'lb', color: FAIL, label: '503 not ready' },
        { from: 'lb', to: 's1', color: PROBE, label: 'traffic', delay: 0.5 },
        { from: 'lb', to: 's3', color: PROBE, label: 'traffic', delay: 0.6 },
      ],
    },
    {
      id: 'liveness',
      title: 'Liveness fails → restart',
      description:
        'If instead the process is wedged and won’t recover, the liveness check fails and the orchestrator restarts (or replaces) the instance. When it passes again, it rejoins.',
      activeNodes: ['lb', 's2'],
      failedNodes: ['s2'],
      activeEdges: ['e-2'],
      annotations: ['Liveness fail → restart the instance'],
      packets: [{ from: 'lb', to: 's2', color: RESTART, label: 'restart' }],
    },
    {
      id: 'recap',
      title: 'The engine of self-healing',
      description:
        'Health checks are the quiet mechanism behind zero-downtime deploys and traffic routing around failure. Tune them carefully: too sensitive and healthy instances flap; too lax and traffic keeps hitting a broken one.',
      activeNodes: ['lb', 's1', 's2', 's3'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
      annotations: ['Liveness restarts · readiness gates traffic'],
    },
  ],
  content,
}
