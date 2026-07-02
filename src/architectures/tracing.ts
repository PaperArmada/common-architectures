import type { Architecture } from '../types'
import content from '../content/tracing.mdx'

const REQ = '#38bdf8'
const PROP = '#c084fc'
const SPAN = '#a3e635'
const SLOW = '#f87171'

export const tracing: Architecture = {
  slug: 'tracing',
  title: 'Distributed Tracing',
  category: 'observability',
  tagline: 'Follow one request across every service to find where the time went.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 9, y: 42 },
    { id: 'gw', label: 'Gateway', kind: 'gateway', x: 33, y: 42 },
    { id: 'checkout', label: 'Checkout', kind: 'server', x: 58, y: 26 },
    { id: 'inventory', label: 'Inventory', kind: 'server', x: 85, y: 42 },
    { id: 'tracer', label: 'Trace backend', sublabel: 'waterfall', kind: 'monitor', x: 46, y: 85 },
  ],
  edges: [
    { id: 'e-c-gw', from: 'client', to: 'gw' },
    { id: 'e-gw-co', from: 'gw', to: 'checkout' },
    { id: 'e-co-inv', from: 'checkout', to: 'inventory' },
    { id: 'e-gw-t', from: 'gw', to: 'tracer', dashed: true },
    { id: 'e-co-t', from: 'checkout', to: 'tracer', dashed: true },
    { id: 'e-inv-t', from: 'inventory', to: 'tracer', dashed: true },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Which hop is slow?',
      description:
        'One request fans out across many services. When checkout feels slow, metrics say "checkout is slow" and logs are scattered per service — but which call actually cost the time?',
      activeNodes: ['client', 'gw', 'checkout', 'inventory'],
    },
    {
      id: 'trace-id',
      title: 'Assign a trace ID at the entry',
      description:
        'As the request enters, it’s stamped with a trace ID. Every unit of work it triggers will record itself as a span against this same trace.',
      activeNodes: ['client', 'gw'],
      activeEdges: ['e-c-gw'],
      annotations: ['trace 7f3a… started'],
      packets: [{ from: 'client', to: 'gw', color: REQ, label: 'request' }],
    },
    {
      id: 'propagate',
      title: 'Propagate the context downstream',
      description:
        'The trace ID and parent span travel in headers from service to service, so each hop knows it belongs to the same trace.',
      activeNodes: ['gw', 'checkout', 'inventory'],
      activeEdges: ['e-gw-co', 'e-co-inv'],
      annotations: ['trace ID passed in headers'],
      packets: [
        { from: 'gw', to: 'checkout', color: PROP, label: 'trace 7f3a' },
        { from: 'checkout', to: 'inventory', color: PROP, label: 'trace 7f3a', delay: 0.5 },
      ],
    },
    {
      id: 'spans',
      title: 'Each hop reports a span',
      description:
        'Every service sends its span — with timing and parent link — to the tracing backend, all tagged with the shared trace ID.',
      activeNodes: ['gw', 'checkout', 'inventory', 'tracer'],
      activeEdges: ['e-gw-t', 'e-co-t', 'e-inv-t'],
      packets: [
        { from: 'gw', to: 'tracer', color: SPAN, label: 'span' },
        { from: 'checkout', to: 'tracer', color: SPAN, label: 'span', delay: 0.15 },
        { from: 'inventory', to: 'tracer', color: SPAN, label: 'span', delay: 0.3 },
      ],
    },
    {
      id: 'waterfall',
      title: 'The waterfall reveals the culprit',
      description:
        'The backend reassembles the spans into a timeline of the whole request. The picture is unmistakable: the Inventory call took 800ms — that’s where the time went.',
      activeNodes: ['tracer', 'inventory'],
      activeEdges: ['e-inv-t'],
      annotations: ['Inventory span = 800ms 🐌'],
      packets: [{ from: 'inventory', to: 'tracer', color: SLOW, label: '800ms' }],
    },
    {
      id: 'recap',
      title: 'The third pillar',
      description:
        'Tracing answers "why was this request slow?" — the question metrics and logs can’t directly answer. The cost is instrumentation and disciplined context propagation everywhere, plus sampling at high volume.',
      activeNodes: ['client', 'gw', 'checkout', 'inventory', 'tracer'],
      annotations: ['Instrument + propagate · sample at volume'],
    },
  ],
  content,
}
