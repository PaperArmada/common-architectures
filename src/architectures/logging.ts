import type { Architecture } from '../types'
import content from '../content/logging.mdx'

const SHIP = '#a3e635'
const QUERY = '#38bdf8'
const RESULT = '#34d399'

export const logging: Architecture = {
  slug: 'logging',
  title: 'Centralized Logging',
  category: 'observability',
  tagline: 'Ship every log line to one searchable place, correlated by request.',
  level: 'intro',
  nodes: [
    { id: 's1', label: 'Service A', kind: 'server', x: 12, y: 22 },
    { id: 's2', label: 'Service B', kind: 'server', x: 12, y: 50 },
    { id: 's3', label: 'Service C', kind: 'server', x: 12, y: 78 },
    { id: 'agg', label: 'Log Aggregator', sublabel: 'indexed & searchable', kind: 'storage', x: 50, y: 50 },
    { id: 'eng', label: 'Engineer', sublabel: 'search', kind: 'client', x: 85, y: 50 },
  ],
  edges: [
    { id: 'e-1', from: 's1', to: 'agg' },
    { id: 'e-2', from: 's2', to: 'agg' },
    { id: 'e-3', from: 's3', to: 'agg' },
    { id: 'e-e', from: 'agg', to: 'eng' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Detail scattered across servers',
      description:
        'When you need to know exactly what happened, the lines you want are spread across dozens of machines — and SSH-and-grep doesn’t scale, especially once autoscaling has replaced the box.',
      activeNodes: ['s1', 's2', 's3'],
    },
    {
      id: 'structured',
      title: 'Write structured logs',
      description:
        'Services log structured JSON — level, service, request_id, message — to stdout, rather than free-form text that’s hard to query.',
      activeNodes: ['s1', 's2', 's3'],
      annotations: ['JSON: {level, service, request_id, …}'],
    },
    {
      id: 'ship',
      title: 'Ship every line to one place',
      description:
        'An agent on each host forwards log lines to a central aggregator that indexes them for search across the whole fleet.',
      activeNodes: ['s1', 's2', 's3', 'agg'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
      packets: [
        { from: 's1', to: 'agg', color: SHIP, label: 'ship' },
        { from: 's2', to: 'agg', color: SHIP, label: 'ship', delay: 0.15 },
        { from: 's3', to: 'agg', color: SHIP, label: 'ship', delay: 0.3 },
      ],
    },
    {
      id: 'correlate',
      title: 'Correlate by request ID',
      description:
        'Every line a request produces — across every service it touches — carries the same request/trace ID. That’s the superpower: one ID reassembles the whole story.',
      activeNodes: ['agg'],
      annotations: ['request_id ties lines across services'],
    },
    {
      id: 'search',
      title: 'Search reassembles the story',
      description:
        'An engineer queries one request_id and gets back every line it produced, in order, from all three services — a pile of lines turned into a narrative.',
      activeNodes: ['eng', 'agg'],
      activeEdges: ['e-e'],
      packets: [
        { from: 'eng', to: 'agg', color: QUERY, label: 'request_id=abc123' },
        { from: 'agg', to: 'eng', color: RESULT, label: '42 lines', delay: 0.7 },
      ],
    },
    {
      id: 'recap',
      title: 'Detect vs. investigate',
      description:
        'Logs give full-fidelity detail for debugging specific incidents — but they’re expensive to store and index, so high volume gets sampled or retention-limited. Use metrics to detect, logs to investigate.',
      activeNodes: ['agg', 'eng'],
      annotations: ['Expensive at scale → sample / limit retention'],
    },
  ],
  content,
}
