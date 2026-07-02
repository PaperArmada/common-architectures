import type { Architecture } from '../types'
import content from '../content/message-queue.mdx'

const JOB = '#c084fc'
const ACK = '#34d399'
const RETRY = '#f87171'

export const messageQueue: Architecture = {
  slug: 'message-queue',
  title: 'Message Queue',
  category: 'async',
  tagline: 'Hand off slow work to background workers that process at their own pace.',
  level: 'intro',
  nodes: [
    { id: 'app', label: 'Web app', sublabel: 'producer', kind: 'server', x: 12, y: 50 },
    { id: 'queue', label: 'Queue', sublabel: 'FIFO buffer', kind: 'queue', x: 44, y: 50 },
    { id: 'w1', label: 'Worker 1', kind: 'worker', x: 82, y: 22 },
    { id: 'w2', label: 'Worker 2', kind: 'worker', x: 82, y: 50 },
    { id: 'w3', label: 'Worker 3', kind: 'worker', x: 82, y: 78 },
  ],
  edges: [
    { id: 'e-a-q', from: 'app', to: 'queue' },
    { id: 'e-q-1', from: 'queue', to: 'w1' },
    { id: 'e-q-2', from: 'queue', to: 'w2' },
    { id: 'e-q-3', from: 'queue', to: 'w3' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Some work is too slow to do inline',
      description:
        'Sending email, encoding video, generating a report — doing it during the request makes the user wait, and a spike can overwhelm the server.',
      activeNodes: ['app'],
    },
    {
      id: 'enqueue',
      title: 'Enqueue the job and return immediately',
      description:
        'The app drops a job onto the queue and instantly responds to the user. The slow work will happen later, off the request path.',
      activeNodes: ['app', 'queue'],
      activeEdges: ['e-a-q'],
      annotations: ['User gets an instant response'],
      packets: [{ from: 'app', to: 'queue', color: JOB, label: 'enqueue job' }],
    },
    {
      id: 'workers',
      title: 'Workers pull jobs and process them',
      description:
        'Workers take jobs off the queue and do the slow work. Each job is handled by exactly one worker.',
      activeNodes: ['queue', 'w1', 'w2'],
      activeEdges: ['e-q-1', 'e-q-2'],
      packets: [
        { from: 'queue', to: 'w1', color: JOB, label: 'job' },
        { from: 'queue', to: 'w2', color: JOB, label: 'job', delay: 0.3 },
      ],
    },
    {
      id: 'leveling',
      title: 'Load leveling absorbs spikes',
      description:
        'When a traffic burst produces jobs faster than they can run, the queue buffers the backlog. Workers drain it steadily instead of the system falling over.',
      activeNodes: ['app', 'queue', 'w1', 'w2', 'w3'],
      activeEdges: ['e-a-q', 'e-q-1', 'e-q-2', 'e-q-3'],
      annotations: ['Burst buffered · workers drain steadily'],
      packets: [
        { from: 'app', to: 'queue', color: JOB, label: 'job' },
        { from: 'app', to: 'queue', color: JOB, label: 'job', delay: 0.15 },
        { from: 'app', to: 'queue', color: JOB, label: 'job', delay: 0.3 },
        { from: 'queue', to: 'w1', color: JOB, delay: 0.6 },
        { from: 'queue', to: 'w2', color: JOB, delay: 0.8 },
        { from: 'queue', to: 'w3', color: JOB, delay: 1.0 },
      ],
    },
    {
      id: 'retry',
      title: 'A crash → the job is redelivered',
      description:
        "Worker 2 dies mid-job before acknowledging it. Because the job wasn't acked, the queue redelivers it to another worker — at-least-once delivery, so workers must be idempotent.",
      activeNodes: ['queue', 'w3'],
      failedNodes: ['w2'],
      activeEdges: ['e-q-3'],
      annotations: ['Job not acked → redelivered', 'At-least-once delivery'],
      packets: [{ from: 'queue', to: 'w3', color: RETRY, label: 'redeliver', delay: 0.3 }],
    },
    {
      id: 'scale',
      title: 'Scale throughput by adding workers',
      description:
        'The queue decouples how fast work arrives from how fast it is processed. Need more capacity? Add workers — the queue spreads jobs across all of them.',
      activeNodes: ['queue', 'w1', 'w2', 'w3'],
      activeEdges: ['e-q-1', 'e-q-2', 'e-q-3'],
      packets: [
        { from: 'queue', to: 'w1', color: ACK, label: 'done' },
        { from: 'queue', to: 'w2', color: ACK, label: 'done', delay: 0.15 },
        { from: 'queue', to: 'w3', color: ACK, label: 'done', delay: 0.3 },
      ],
    },
  ],
  content,
}
