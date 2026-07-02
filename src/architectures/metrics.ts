import type { Architecture } from '../types'
import content from '../content/metrics.mdx'

const SCRAPE = '#a3e635'
const VIZ = '#38bdf8'
const ALERT = '#f87171'

export const metrics: Architecture = {
  slug: 'metrics',
  title: 'Metrics & Monitoring',
  category: 'observability',
  tagline: 'Cheap numeric time-series that surface trends and drive alerts.',
  level: 'intro',
  nodes: [
    { id: 'svcA', label: 'Service A', kind: 'server', x: 12, y: 26 },
    { id: 'svcB', label: 'Service B', kind: 'server', x: 12, y: 74 },
    { id: 'collector', label: 'Collector', sublabel: 'time-series DB', kind: 'monitor', x: 47, y: 50 },
    { id: 'dash', label: 'Dashboards', kind: 'monitor', x: 82, y: 28 },
    { id: 'pager', label: 'On-call', sublabel: 'alerts', kind: 'client', x: 82, y: 74 },
  ],
  edges: [
    { id: 'e-a', from: 'collector', to: 'svcA' },
    { id: 'e-b', from: 'collector', to: 'svcB' },
    { id: 'e-d', from: 'collector', to: 'dash' },
    { id: 'e-p', from: 'collector', to: 'pager' },
  ],
  steps: [
    {
      id: 'intro',
      title: "You can't operate what you can't see",
      description:
        'When latency creeps up or errors spike, you need to know immediately — not from an angry user. Metrics give a continuous, quantified view of health.',
      activeNodes: ['svcA', 'svcB'],
    },
    {
      id: 'expose',
      title: 'Services expose metrics',
      description:
        'Each service publishes counters, gauges, and histograms — requests served, memory used, latency distribution — at a metrics endpoint.',
      activeNodes: ['svcA', 'svcB'],
      annotations: ['counters · gauges · histograms'],
    },
    {
      id: 'scrape',
      title: 'A collector gathers them over time',
      description:
        'The collector scrapes each service on an interval (or receives pushed samples) and stores the series in a time-series database.',
      activeNodes: ['collector', 'svcA', 'svcB'],
      activeEdges: ['e-a', 'e-b'],
      annotations: ['Scraped every 15s'],
      packets: [
        { from: 'svcA', to: 'collector', color: SCRAPE, label: 'metrics' },
        { from: 'svcB', to: 'collector', color: SCRAPE, label: 'metrics', delay: 0.2 },
      ],
    },
    {
      id: 'dashboard',
      title: 'Dashboards show the trends',
      description:
        'The series feed dashboards that visualize rate, errors, and latency. Percentiles matter — p95/p99 reveal the slow tail an average hides.',
      activeNodes: ['collector', 'dash'],
      activeEdges: ['e-d'],
      packets: [{ from: 'collector', to: 'dash', color: VIZ, label: 'p99 latency ↑' }],
    },
    {
      id: 'alert',
      title: 'Thresholds fire alerts',
      description:
        'An alerting rule watches the numbers and pages on-call when one crosses a line — "error rate > 2% for 5 minutes." This is what makes metrics always-on and actionable.',
      activeNodes: ['collector', 'pager'],
      activeEdges: ['e-p'],
      annotations: ['error rate > 2% → page'],
      packets: [{ from: 'collector', to: 'pager', color: ALERT, label: '🚨 alert' }],
    },
    {
      id: 'recap',
      title: 'The "that", not the "why"',
      description:
        'Metrics are cheap and perfect for detection, but they’re aggregates — they tell you that something is wrong, not why. To investigate a specific request you reach for logs and traces. Mind label cardinality.',
      activeNodes: ['collector', 'dash', 'pager'],
      annotations: ['Detect with metrics · investigate with logs & traces'],
    },
  ],
  content,
}
