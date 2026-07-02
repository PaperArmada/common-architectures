import type { Architecture } from '../types'
import content from '../content/service-discovery.mdx'

const REG = '#2dd4bf'
const QUERY = '#38bdf8'
const CALL = '#c084fc'
const FAIL = '#f87171'

export const serviceDiscovery: Architecture = {
  slug: 'service-discovery',
  title: 'Service Discovery',
  category: 'distributed',
  tagline: 'Find services by name as their instances scale, move, deploy, and die.',
  level: 'core',
  nodes: [
    { id: 'caller', label: 'Web svc', sublabel: 'caller', kind: 'server', x: 12, y: 50 },
    { id: 'registry', label: 'Registry', sublabel: 'consul / etcd', kind: 'registry', x: 46, y: 50 },
    { id: 'i1', label: 'payment #1', kind: 'server', x: 83, y: 20 },
    { id: 'i2', label: 'payment #2', kind: 'server', x: 83, y: 50 },
    { id: 'i3', label: 'payment #3', kind: 'server', x: 83, y: 80 },
  ],
  edges: [
    { id: 'e-c-r', from: 'caller', to: 'registry' },
    { id: 'e-1-r', from: 'i1', to: 'registry' },
    { id: 'e-2-r', from: 'i2', to: 'registry' },
    { id: 'e-3-r', from: 'i3', to: 'registry' },
    { id: 'e-c-1', from: 'caller', to: 'i1', curve: -120 },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Instances never sit still',
      description:
        'Autoscaling, deploys, crashes, reschedules — service instances come and go and their addresses change constantly. Hard-coding an IP breaks the moment it moves.',
      activeNodes: ['caller', 'i1', 'i2', 'i3'],
    },
    {
      id: 'register',
      title: 'Instances register themselves',
      description:
        'On startup each instance tells the registry "I’m payment, reachable here," and deregisters on shutdown. The registry holds the live list of who exists.',
      activeNodes: ['registry', 'i1', 'i2', 'i3'],
      activeEdges: ['e-1-r', 'e-2-r', 'e-3-r'],
      packets: [
        { from: 'i1', to: 'registry', color: REG, label: 'register' },
        { from: 'i2', to: 'registry', color: REG, label: 'register', delay: 0.15 },
        { from: 'i3', to: 'registry', color: REG, label: 'register', delay: 0.3 },
      ],
    },
    {
      id: 'health',
      title: 'Health checks prune the dead',
      description:
        'The registry probes each instance and drops the ones that stop responding, so its picture always reflects only healthy instances. payment #2 fails and is removed.',
      activeNodes: ['registry'],
      failedNodes: ['i2'],
      activeEdges: ['e-2-r'],
      annotations: ['#2 failed health check → removed'],
    },
    {
      id: 'query',
      title: 'The caller asks by name',
      description:
        'Instead of a hard-coded address, the Web service queries the registry for healthy "payment" instances and gets back the current live set.',
      activeNodes: ['caller', 'registry'],
      failedNodes: ['i2'],
      activeEdges: ['e-c-r'],
      packets: [
        { from: 'caller', to: 'registry', color: QUERY, label: 'where is payment?' },
        { from: 'registry', to: 'caller', color: QUERY, label: '#1, #3', delay: 0.7 },
      ],
    },
    {
      id: 'call',
      title: 'Then calls a healthy instance',
      description:
        'The caller connects to one of the returned addresses — never the dead one. Instances moved and failed, yet the caller only ever used the stable name.',
      activeNodes: ['caller', 'i1'],
      failedNodes: ['i2'],
      activeEdges: ['e-c-1'],
      packets: [{ from: 'caller', to: 'i1', color: CALL, label: 'call #1' }],
    },
    {
      id: 'recap',
      title: 'Client-side or server-side',
      description:
        'The caller can query and balance itself (client-side), or hit a stable proxy that consults the registry (server-side — how Kubernetes Services work). Either way, the registry is critical infra and must be highly available.',
      activeNodes: ['caller', 'registry', 'i1', 'i3'],
      failedNodes: ['i2'],
      activeEdges: ['e-c-r', 'e-1-r', 'e-3-r'],
      packets: [{ from: 'registry', to: 'caller', color: FAIL, label: 'must stay available' }],
    },
  ],
  content,
}
