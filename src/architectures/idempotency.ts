import type { Architecture } from '../types'
import content from '../content/idempotency.mdx'

const REQ = '#38bdf8'
const SAVE = '#f472b6'
const LOST = '#f87171'
const OK = '#34d399'

export const idempotency: Architecture = {
  slug: 'idempotency',
  title: 'Idempotency Keys',
  category: 'distributed',
  tagline: 'Make retried writes safe to repeat — charge once, no matter how many times it arrives.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 13, y: 50 },
    { id: 'api', label: 'Payment API', kind: 'server', x: 47, y: 50 },
    { id: 'store', label: 'Keys + results', sublabel: 'dedup store', kind: 'db', x: 82, y: 50 },
  ],
  edges: [
    { id: 'e-c-a', from: 'client', to: 'api' },
    { id: 'e-a-s', from: 'api', to: 'store' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'A lost response causes a double charge',
      description:
        'The client submits a payment; it succeeds, but the response is lost to a timeout — so the client retries. Without protection, the customer is charged twice.',
      activeNodes: ['client', 'api'],
    },
    {
      id: 'first',
      title: 'First request carries a unique key',
      description:
        'The client generates an idempotency key and sends it with the request. The API processes the charge and records the key with its result — atomically.',
      activeNodes: ['client', 'api', 'store'],
      activeEdges: ['e-c-a', 'e-a-s'],
      packets: [
        { from: 'client', to: 'api', color: REQ, label: 'charge · key=abc' },
        { from: 'api', to: 'store', color: SAVE, label: 'save key=abc + result', delay: 0.6 },
      ],
    },
    {
      id: 'lost',
      title: 'The response is lost',
      description:
        'The charge succeeded on the server, but the 200 never reaches the client — a network timeout swallows it. The client only knows it didn’t hear back.',
      activeNodes: ['api', 'client'],
      activeEdges: ['e-c-a'],
      annotations: ['Response lost — client will retry'],
      packets: [{ from: 'api', to: 'client', color: LOST, label: '200 (lost)' }],
    },
    {
      id: 'retry',
      title: 'The client retries with the same key',
      description:
        'Assuming failure, the client re-sends the identical request — crucially, with the same idempotency key it used the first time.',
      activeNodes: ['client', 'api'],
      activeEdges: ['e-c-a'],
      packets: [{ from: 'client', to: 'api', color: REQ, label: 'charge · key=abc (retry)' }],
    },
    {
      id: 'dedup',
      title: 'Key already seen → return the stored result',
      description:
        'The API looks up the key, finds it already processed, and returns the saved result instead of charging again. Exactly one charge, no matter how many retries arrive.',
      activeNodes: ['api', 'store', 'client'],
      activeEdges: ['e-a-s', 'e-c-a'],
      annotations: ['key=abc exists → charged once ✓'],
      packets: [
        { from: 'api', to: 'store', color: REQ, label: 'key=abc?' },
        { from: 'store', to: 'api', color: OK, label: 'exists → cached result', delay: 0.6 },
        { from: 'api', to: 'client', color: OK, label: '200 (same)', delay: 1.2 },
      ],
    },
    {
      id: 'recap',
      title: 'At-least-once becomes effectively-once',
      description:
        'This is what makes aggressive retries and at-least-once messaging safe. The check-and-record must be atomic, keys expire on a TTL, and the subtle part is choosing what makes two requests “the same”. Queue consumers dedupe the same way.',
      activeNodes: ['client', 'api', 'store'],
      annotations: ['Reads are idempotent · writes need keys'],
    },
  ],
  content,
}
