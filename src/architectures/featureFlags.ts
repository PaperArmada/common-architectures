import type { Architecture } from '../types'
import content from '../content/feature-flags.mdx'

const REQ = '#38bdf8'
const EVAL = '#a3e635'
const NEW = '#34d399'
const OFF = '#f87171'

export const featureFlags: Architecture = {
  slug: 'feature-flags',
  title: 'Feature Flags',
  category: 'delivery',
  tagline: 'Ship code dark, then decide who sees a feature at runtime — no deploy required.',
  level: 'core',
  nodes: [
    { id: 'users', label: 'Users', kind: 'client', x: 12, y: 50 },
    { id: 'app', label: 'App', sublabel: 'new code, dark', kind: 'server', x: 44, y: 50 },
    { id: 'flags', label: 'Flag service', sublabel: 'targeting rules', kind: 'registry', x: 44, y: 88 },
    { id: 'old', label: 'Old checkout', kind: 'server', x: 82, y: 28 },
    { id: 'new', label: 'New checkout', kind: 'server', x: 82, y: 72 },
  ],
  edges: [
    { id: 'e-u-a', from: 'users', to: 'app' },
    { id: 'e-a-f', from: 'app', to: 'flags', dashed: true },
    { id: 'e-a-old', from: 'app', to: 'old' },
    { id: 'e-a-new', from: 'app', to: 'new' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Deploy and release are not the same',
      description:
        'Coupling them is scary: turning a feature on means shipping it, turning it off means an emergency rollback. Feature flags separate the two.',
      activeNodes: ['app', 'old', 'new'],
    },
    {
      id: 'dark',
      title: 'Ship the new code dark',
      description:
        'The new checkout deploys to production behind an off flag. Every user still gets the old path — nothing has changed for them yet.',
      activeNodes: ['users', 'app', 'old'],
      activeEdges: ['e-u-a', 'e-a-old'],
      annotations: ['new-checkout = OFF'],
      packets: [
        { from: 'users', to: 'app', color: REQ, label: 'checkout' },
        { from: 'app', to: 'old', color: REQ, delay: 0.4 },
      ],
    },
    {
      id: 'eval',
      title: 'Evaluate the flag per request',
      description:
        'For each request the app asks the flag service whether the feature is on for this user, evaluated against targeting rules — internal users, a percentage, a region.',
      activeNodes: ['app', 'flags'],
      activeEdges: ['e-a-f'],
      packets: [{ from: 'app', to: 'flags', color: EVAL, label: 'isEnabled(new-checkout, user)?' }],
    },
    {
      id: 'rollout',
      title: 'Progressive rollout',
      description:
        'Enable it for 5% of users — those requests take the new path while everyone else stays on the old one. Ramp 5% → 25% → 100%, watching metrics. This is how a canary is driven at the application layer.',
      activeNodes: ['app', 'new'],
      activeEdges: ['e-a-new'],
      annotations: ['5% → 25% → 100%'],
      packets: [{ from: 'app', to: 'new', color: NEW, label: '5% → new' }],
    },
    {
      id: 'kill',
      title: 'Instant kill switch',
      description:
        'Something looks wrong? Flip the flag off in the dashboard and the change takes effect immediately — traffic falls back to the old path with no deploy and no rollback.',
      activeNodes: ['flags', 'app', 'old'],
      activeEdges: ['e-a-f', 'e-a-old'],
      annotations: ['Flip OFF → instant revert'],
      packets: [
        { from: 'flags', to: 'app', color: OFF, label: 'OFF' },
        { from: 'app', to: 'old', color: REQ, label: 'back to old', delay: 0.5 },
      ],
    },
    {
      id: 'recap',
      title: 'More than rollouts',
      description:
        'Flags also enable A/B testing and trunk-based development (merge unfinished work safely behind an off flag). The cost: every flag is a branch in the code — left uncleaned they become flag debt — and the flag service is in the hot path, so cache it and default sensibly when unreachable.',
      activeNodes: ['app', 'flags'],
      annotations: ['Mind flag debt · cache + safe default'],
    },
  ],
  content,
}
