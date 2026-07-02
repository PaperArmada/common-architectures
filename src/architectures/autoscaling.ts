import type { Architecture } from '../types'
import content from '../content/autoscaling.mdx'

const REQ = '#38bdf8'
const HOT = '#f87171'
const SCALE = '#34d399'
const COOL = '#a3e635'

export const autoscaling: Architecture = {
  slug: 'autoscaling',
  title: 'Autoscaling',
  category: 'delivery',
  tagline: 'Add and remove instances automatically to track demand — and the bill.',
  level: 'core',
  nodes: [
    { id: 'traffic', label: 'Traffic', kind: 'client', x: 11, y: 50 },
    { id: 'lb', label: 'Load Balancer', kind: 'lb', x: 38, y: 50 },
    { id: 's1', label: 'instance 1', kind: 'server', x: 75, y: 22 },
    { id: 's2', label: 'instance 2', kind: 'server', x: 75, y: 50 },
    { id: 's3', label: 'instance 3', sublabel: 'scaled out', kind: 'server', x: 75, y: 78 },
    { id: 'scaler', label: 'Autoscaler', sublabel: 'target CPU 60%', kind: 'monitor', x: 38, y: 86 },
  ],
  edges: [
    { id: 'e-t-lb', from: 'traffic', to: 'lb' },
    { id: 'e-1', from: 'lb', to: 's1' },
    { id: 'e-2', from: 'lb', to: 's2' },
    { id: 'e-3', from: 'lb', to: 's3' },
    { id: 'e-sc-3', from: 'scaler', to: 's3', dashed: true },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Demand is never constant',
      description:
        'Traffic peaks by day and quiets at night, with spikes in between. Provision for the peak and you pay for idle machines; provision for the average and you fall over when it counts.',
      activeNodes: ['traffic', 's1', 's2'],
    },
    {
      id: 'normal',
      title: 'Normal load, two instances',
      description:
        'At steady traffic, two instances comfortably handle the load and CPU sits near the 60% target the autoscaler is watching.',
      activeNodes: ['traffic', 'lb', 's1', 's2'],
      activeEdges: ['e-t-lb', 'e-1', 'e-2'],
      annotations: ['CPU ≈ 60% ✓'],
      packets: [
        { from: 'traffic', to: 'lb', color: REQ, label: 'requests' },
        { from: 'lb', to: 's1', color: REQ, delay: 0.4 },
        { from: 'lb', to: 's2', color: REQ, delay: 0.5 },
      ],
    },
    {
      id: 'spike',
      title: 'A spike drives CPU hot',
      description:
        'Traffic surges. The two instances saturate and CPU climbs past the target — the signal the autoscaler is waiting for.',
      activeNodes: ['traffic', 'lb', 's1', 's2', 'scaler'],
      activeEdges: ['e-t-lb', 'e-1', 'e-2'],
      annotations: ['CPU 90% > 60% target'],
      packets: [
        { from: 'traffic', to: 'lb', color: HOT, label: 'surge' },
        { from: 'traffic', to: 'lb', color: HOT, delay: 0.15 },
        { from: 'lb', to: 's1', color: HOT, delay: 0.4 },
        { from: 'lb', to: 's2', color: HOT, delay: 0.5 },
      ],
    },
    {
      id: 'scale-out',
      title: 'Scale out: add an instance',
      description:
        'The autoscaler boots instance 3. It registers with the load balancer and starts taking traffic, spreading the load across three now.',
      activeNodes: ['scaler', 's3', 'lb'],
      activeEdges: ['e-sc-3', 'e-3'],
      annotations: ['+1 instance'],
      packets: [
        { from: 'scaler', to: 's3', color: SCALE, label: 'boot instance' },
        { from: 'lb', to: 's3', color: REQ, label: 'traffic', delay: 0.7 },
      ],
    },
    {
      id: 'settled',
      title: 'Load spreads, CPU recovers',
      description:
        'With three instances sharing the surge, CPU drops back toward target. Capacity now matches demand.',
      activeNodes: ['lb', 's1', 's2', 's3'],
      activeEdges: ['e-1', 'e-2', 'e-3'],
      annotations: ['CPU ≈ 60% ✓ across 3'],
      packets: [
        { from: 'lb', to: 's1', color: REQ },
        { from: 'lb', to: 's2', color: REQ, delay: 0.15 },
        { from: 'lb', to: 's3', color: REQ, delay: 0.3 },
      ],
    },
    {
      id: 'scale-in',
      title: 'Scale in when it’s quiet',
      description:
        'When demand falls, the autoscaler removes instance 3 to save money, staying within its min/max bounds. Instances must be stateless and quick to boot — and cooldowns prevent flapping in and out.',
      activeNodes: ['lb', 's1', 's2'],
      failedNodes: ['s3'],
      activeEdges: ['e-1', 'e-2'],
      annotations: ['Demand fell → −1 instance', 'Pay for what you use'],
      packets: [{ from: 'scaler', to: 's3', color: COOL, label: 'terminate' }],
    },
  ],
  content,
}
