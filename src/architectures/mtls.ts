import type { Architecture } from '../types'
import content from '../content/mtls.mdx'

const ISSUE = '#f43f5e'
const HAND = '#38bdf8'
const OK = '#34d399'

export const mtls: Architecture = {
  slug: 'mtls',
  title: 'Mutual TLS (mTLS)',
  category: 'security',
  tagline: 'Both sides present certificates, so each service proves its identity to the other.',
  level: 'core',
  nodes: [
    { id: 'a', label: 'Service A', sublabel: 'caller', kind: 'server', x: 20, y: 42 },
    { id: 'b', label: 'Service B', sublabel: 'callee', kind: 'server', x: 75, y: 42 },
    { id: 'ca', label: 'Internal CA', sublabel: 'trust anchor', kind: 'shield', x: 47, y: 86 },
  ],
  edges: [
    { id: 'e-a-b', from: 'a', to: 'b' },
    { id: 'e-ca-a', from: 'ca', to: 'a', dashed: true },
    { id: 'e-ca-b', from: 'ca', to: 'b', dashed: true },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Ordinary TLS only checks the server',
      description:
        'HTTPS proves the server’s identity to the client, but not the reverse. Inside a mesh, when A calls B, B needs to be sure the caller really is A — not something that slipped onto the network.',
      activeNodes: ['a', 'b'],
    },
    {
      id: 'issue',
      title: 'A CA issues both sides a certificate',
      description:
        'A trusted internal Certificate Authority gives each service its own certificate — a cryptographic identity.',
      activeNodes: ['ca', 'a', 'b'],
      activeEdges: ['e-ca-a', 'e-ca-b'],
      packets: [
        { from: 'ca', to: 'a', color: ISSUE, label: 'cert A' },
        { from: 'ca', to: 'b', color: ISSUE, label: 'cert B', delay: 0.2 },
      ],
    },
    {
      id: 'handshake',
      title: 'Both present certs in the handshake',
      description:
        'On connect, the usual TLS handshake happens — and the client also presents its certificate. Each side sends its identity to the other.',
      activeNodes: ['a', 'b'],
      activeEdges: ['e-a-b'],
      packets: [
        { from: 'a', to: 'b', color: HAND, label: 'client cert' },
        { from: 'b', to: 'a', color: HAND, label: 'server cert', delay: 0.5 },
      ],
    },
    {
      id: 'verify',
      title: 'Each verifies the other against the CA',
      description:
        'Both certificates are checked against the CA. Only if both identities are valid does the connection proceed — now mutually authenticated and encrypted.',
      activeNodes: ['a', 'b', 'ca'],
      activeEdges: ['e-a-b'],
      annotations: ['Both identities verified ✓'],
      packets: [{ from: 'a', to: 'b', color: OK, label: 'mTLS established' }],
    },
    {
      id: 'recap',
      title: 'Zero-trust — and cert rotation',
      description:
        'Identity is proven on every hop, so a foothold on the network can’t impersonate a service — a pillar of zero-trust. The hard part is the certificate lifecycle: issuing and rotating certs across many short-lived services, which is why service meshes automate it.',
      activeNodes: ['a', 'b', 'ca'],
      annotations: ['Rotation is the hard part → service mesh'],
    },
  ],
  content,
}
