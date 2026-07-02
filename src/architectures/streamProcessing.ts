import type { Architecture } from '../types'
import content from '../content/stream-processing.mdx'

const EVENT = '#38bdf8'
const AGG = '#a78bfa'
const OUT = '#34d399'
const REPLAY = '#fbbf24'

export const streamProcessing: Architecture = {
  slug: 'stream-processing',
  title: 'Stream Processing',
  category: 'async',
  tagline: 'Compute over an endless flow of events in near-real-time from a replayable log.',
  level: 'advanced',
  nodes: [
    { id: 'src1', label: 'App events', kind: 'client', x: 10, y: 26 },
    { id: 'src2', label: 'Sensors', kind: 'client', x: 10, y: 74 },
    { id: 'log', label: 'Event Log', sublabel: 'Kafka · partitioned', kind: 'broker', x: 39, y: 50 },
    { id: 'proc', label: 'Processor', sublabel: '5-min windows', kind: 'server', x: 66, y: 50 },
    { id: 'sink', label: 'Sink', sublabel: 'dashboard · lake', kind: 'storage', x: 90, y: 50 },
  ],
  edges: [
    { id: 'e-1-l', from: 'src1', to: 'log' },
    { id: 'e-2-l', from: 'src2', to: 'log' },
    { id: 'e-l-p', from: 'log', to: 'proc' },
    { id: 'e-p-s', from: 'proc', to: 'sink' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Some data never stops',
      description:
        'Clicks, sensor readings, logs, transactions — an unbounded flow. Collecting it for an overnight batch job is far too slow when you want live results.',
      activeNodes: ['src1', 'src2'],
    },
    {
      id: 'append',
      title: 'Producers append to a partitioned log',
      description:
        'Events are appended to an ordered, append-only log. It keeps events in order within a partition and retains them for a window of time.',
      activeNodes: ['src1', 'src2', 'log'],
      activeEdges: ['e-1-l', 'e-2-l'],
      packets: [
        { from: 'src1', to: 'log', color: EVENT, label: 'event' },
        { from: 'src2', to: 'log', color: EVENT, label: 'event', delay: 0.2 },
        { from: 'src1', to: 'log', color: EVENT, label: 'event', delay: 0.45 },
        { from: 'src2', to: 'log', color: EVENT, label: 'event', delay: 0.65 },
      ],
    },
    {
      id: 'consume',
      title: 'A processor consumes it continuously',
      description:
        'The stream processor reads the log as events arrive, tracking its own offset. Many consumers can read the same log independently at their own positions.',
      activeNodes: ['log', 'proc'],
      activeEdges: ['e-l-p'],
      annotations: ['Reads at its own offset'],
      packets: [
        { from: 'log', to: 'proc', color: EVENT, label: 'stream' },
        { from: 'log', to: 'proc', color: EVENT, delay: 0.3 },
        { from: 'log', to: 'proc', color: EVENT, delay: 0.6 },
      ],
    },
    {
      id: 'window',
      title: 'Aggregate over time windows',
      description:
        'Because the stream is infinite, results are computed over windows — here, a tumbling 5-minute count. The processor emits a rolling result as each window closes.',
      activeNodes: ['proc', 'sink'],
      activeEdges: ['e-p-s'],
      annotations: ['Tumbling 5-min window'],
      packets: [{ from: 'proc', to: 'sink', color: AGG, label: 'orders/5min' }],
    },
    {
      id: 'sink',
      title: 'Results land in sinks, near-real-time',
      description:
        'Aggregates flow to dashboards, alerts, or a data lake within seconds of the events happening — not hours later.',
      activeNodes: ['proc', 'sink'],
      activeEdges: ['e-p-s'],
      packets: [{ from: 'proc', to: 'sink', color: OUT, label: 'live metric' }],
    },
    {
      id: 'replay',
      title: 'Rewind the offset to replay history',
      description:
        'Because the log is retained rather than consumed-and-deleted, you can reprocess the past — to backfill a new metric or recover from a bug. The log is the durable source of truth.',
      activeNodes: ['log', 'proc'],
      activeEdges: ['e-l-p'],
      annotations: ['Offset rewound → reprocessing'],
      packets: [
        { from: 'proc', to: 'log', color: REPLAY, label: 'seek(0)' },
        { from: 'log', to: 'proc', color: REPLAY, label: 'replay', delay: 0.6 },
      ],
    },
  ],
  content,
}
