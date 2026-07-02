import type { Architecture } from '../types'
import content from '../content/leader-election.mdx'

const VOTE = '#38bdf8'
const HEART = '#34d399'
const REQ = '#c084fc'

export const leaderElection: Architecture = {
  slug: 'leader-election',
  title: 'Leader Election',
  category: 'distributed',
  tagline: 'A cluster agrees on a single leader — and picks a new one when it dies.',
  level: 'advanced',
  nodes: [
    { id: 'n1', label: 'Node A', kind: 'server', x: 30, y: 24 },
    { id: 'n2', label: 'Node B', kind: 'server', x: 70, y: 24 },
    { id: 'n3', label: 'Node C', kind: 'server', x: 30, y: 78 },
    { id: 'n4', label: 'Node D', kind: 'server', x: 70, y: 78 },
  ],
  edges: [
    { id: 'e12', from: 'n1', to: 'n2' },
    { id: 'e34', from: 'n3', to: 'n4' },
    { id: 'e13', from: 'n1', to: 'n3' },
    { id: 'e24', from: 'n2', to: 'n4' },
    { id: 'e14', from: 'n1', to: 'n4' },
    { id: 'e23', from: 'n2', to: 'n3' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Exactly one node must be in charge',
      description:
        'Some jobs need a single owner — a scheduler that fires once, a primary that takes writes. If two nodes both think they lead (split-brain), you get duplicate actions or corruption.',
      activeNodes: ['n1', 'n2', 'n3', 'n4'],
    },
    {
      id: 'campaign',
      title: 'A candidate requests votes',
      description:
        'When no leader is heard from, a node becomes a candidate and asks its peers to vote for it in a new term.',
      activeNodes: ['n1'],
      activeEdges: ['e12', 'e13', 'e14'],
      packets: [
        { from: 'n1', to: 'n2', color: REQ, label: 'vote?' },
        { from: 'n1', to: 'n3', color: REQ, label: 'vote?', delay: 0.1 },
        { from: 'n1', to: 'n4', color: REQ, label: 'vote?', delay: 0.2 },
      ],
    },
    {
      id: 'quorum',
      title: 'A quorum makes it leader',
      description:
        'Peers grant their votes. Winning a majority of the cluster — a quorum — makes Node A the leader. Requiring a majority is exactly what stops two leaders existing at once.',
      activeNodes: ['n1'],
      activeEdges: ['e12', 'e13', 'e14'],
      annotations: ['3 / 4 votes → quorum', 'Node A is leader'],
      packets: [
        { from: 'n2', to: 'n1', color: VOTE, label: 'vote ✓' },
        { from: 'n3', to: 'n1', color: VOTE, label: 'vote ✓', delay: 0.1 },
        { from: 'n4', to: 'n1', color: VOTE, label: 'vote ✓', delay: 0.2 },
      ],
    },
    {
      id: 'heartbeat',
      title: 'The leader sends heartbeats',
      description:
        'While it leads, Node A periodically pings the followers. As long as heartbeats arrive, everyone stays a follower and the leader coordinates the work.',
      activeNodes: ['n1', 'n2', 'n3', 'n4'],
      activeEdges: ['e12', 'e13', 'e14'],
      annotations: ['Leader: Node A'],
      packets: [
        { from: 'n1', to: 'n2', color: HEART, label: '♥' },
        { from: 'n1', to: 'n3', color: HEART, label: '♥', delay: 0.1 },
        { from: 'n1', to: 'n4', color: HEART, label: '♥', delay: 0.2 },
      ],
    },
    {
      id: 'fail',
      title: 'The leader dies — heartbeats stop',
      description:
        'Node A crashes or is partitioned away. Its heartbeats stop arriving, and after a timeout the followers notice the silence.',
      failedNodes: ['n1'],
      activeNodes: ['n2', 'n3', 'n4'],
      annotations: ['No heartbeat → election timeout'],
    },
    {
      id: 'reelect',
      title: 'The cluster re-elects and self-heals',
      description:
        'A follower starts a new term and campaigns. The surviving majority elects Node B, which takes over as leader. The system recovers on its own — no human in the loop.',
      activeNodes: ['n2', 'n3', 'n4'],
      failedNodes: ['n1'],
      activeEdges: ['e24', 'e23', 'e34'],
      annotations: ['New term · Node B leads', 'Majority still alive → progress'],
      packets: [
        { from: 'n2', to: 'n3', color: REQ, label: 'vote?' },
        { from: 'n2', to: 'n4', color: REQ, label: 'vote?', delay: 0.1 },
        { from: 'n3', to: 'n2', color: VOTE, label: 'vote ✓', delay: 0.6 },
        { from: 'n4', to: 'n2', color: VOTE, label: 'vote ✓', delay: 0.7 },
      ],
    },
  ],
  content,
}
