import type { Architecture } from '../types'
import content from '../content/saga.mdx'

const DO = '#38bdf8'
const OK = '#34d399'
const FAIL = '#f87171'
const UNDO = '#fb7185'

export const saga: Architecture = {
  slug: 'saga',
  title: 'Saga Pattern',
  category: 'async',
  tagline: 'Coordinate a multi-service workflow with local steps and compensating undo.',
  level: 'advanced',
  nodes: [
    { id: 'orch', label: 'Orchestrator', sublabel: 'saga', kind: 'gateway', x: 14, y: 50 },
    { id: 'inv', label: 'Inventory', kind: 'server', x: 50, y: 20 },
    { id: 'pay', label: 'Payment', kind: 'server', x: 50, y: 80 },
    { id: 'ship', label: 'Shipping', kind: 'server', x: 85, y: 50 },
  ],
  edges: [
    { id: 'e-o-i', from: 'orch', to: 'inv' },
    { id: 'e-o-p', from: 'orch', to: 'pay' },
    { id: 'e-o-s', from: 'orch', to: 'ship' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'No shared transaction across services',
      description:
        'Placing an order spans inventory, payment, and shipping — but each service owns its own database, so there is no single transaction to commit or roll back together.',
      activeNodes: ['inv', 'pay', 'ship'],
    },
    {
      id: 'step1',
      title: 'Step 1 — reserve inventory',
      description:
        'The saga runs the first local transaction: the Inventory service reserves the item and reports success.',
      activeNodes: ['orch', 'inv'],
      activeEdges: ['e-o-i'],
      packets: [
        { from: 'orch', to: 'inv', color: DO, label: 'reserve' },
        { from: 'inv', to: 'orch', color: OK, label: 'ok ✓', delay: 0.8 },
      ],
    },
    {
      id: 'step2',
      title: 'Step 2 — charge payment',
      description:
        'With inventory held, the next local transaction charges the customer. Payment succeeds too.',
      activeNodes: ['orch', 'pay'],
      activeEdges: ['e-o-p'],
      packets: [
        { from: 'orch', to: 'pay', color: DO, label: 'charge' },
        { from: 'pay', to: 'orch', color: OK, label: 'ok ✓', delay: 0.8 },
      ],
    },
    {
      id: 'fail',
      title: 'Step 3 fails',
      description:
        'Shipping can’t fulfill — out of delivery capacity. There is no automatic rollback for the two steps already committed in other services.',
      activeNodes: ['orch'],
      failedNodes: ['ship'],
      activeEdges: ['e-o-s'],
      annotations: ['Shipping failed'],
      packets: [
        { from: 'orch', to: 'ship', color: DO, label: 'ship' },
        { from: 'ship', to: 'orch', color: FAIL, label: 'FAIL', delay: 0.8 },
      ],
    },
    {
      id: 'compensate',
      title: 'Compensate — undo in reverse',
      description:
        'The saga runs compensating transactions for everything already done, backwards: refund the payment, then release the inventory. You design each undo explicitly.',
      activeNodes: ['orch', 'pay', 'inv'],
      failedNodes: ['ship'],
      activeEdges: ['e-o-p', 'e-o-i'],
      annotations: ['Compensating transactions', 'Refund → release, in reverse'],
      packets: [
        { from: 'orch', to: 'pay', color: UNDO, label: 'refund' },
        { from: 'orch', to: 'inv', color: UNDO, label: 'release', delay: 0.5 },
      ],
    },
    {
      id: 'recap',
      title: 'Atomic-ish, eventually consistent',
      description:
        'A saga gets multi-service workflows without distributed transactions — at the cost of designing idempotent steps and compensations, and tolerating the partial states it passes through. Coordinate by choreography (events) or orchestration (a central driver).',
      activeNodes: ['orch', 'inv', 'pay', 'ship'],
      activeEdges: ['e-o-i', 'e-o-p', 'e-o-s'],
      annotations: ['Choreography vs. orchestration'],
    },
  ],
  content,
}
