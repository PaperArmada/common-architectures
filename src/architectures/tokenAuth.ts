import type { Architecture } from '../types'
import content from '../content/token-auth.mdx'

const CRED = '#38bdf8'
const TOKEN = '#f43f5e'
const OK = '#34d399'

export const tokenAuth: Architecture = {
  slug: 'token-auth',
  title: 'Token Auth (JWT)',
  category: 'security',
  tagline: 'A signed token the client carries, so any service verifies the caller without a lookup.',
  level: 'core',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 12, y: 50 },
    { id: 'auth', label: 'Auth server', sublabel: 'issues JWT', kind: 'shield', x: 47, y: 24 },
    { id: 'api', label: 'API service', kind: 'server', x: 82, y: 66 },
  ],
  edges: [
    { id: 'e-c-auth', from: 'client', to: 'auth' },
    { id: 'e-c-api', from: 'client', to: 'api' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Every request must prove who you are',
      description:
        'HTTP is stateless — each request arrives with no memory of the last — yet the API needs to know the caller on every one, without a session lookup each time.',
      activeNodes: ['client', 'api'],
    },
    {
      id: 'login',
      title: 'Log in once, get a signed token',
      description:
        'The client sends credentials to the auth server. It verifies them and returns a signed token (a JWT) carrying claims — user ID, roles, expiry — and a signature.',
      activeNodes: ['client', 'auth'],
      activeEdges: ['e-c-auth'],
      packets: [
        { from: 'client', to: 'auth', color: CRED, label: 'login' },
        { from: 'auth', to: 'client', color: TOKEN, label: 'signed JWT', delay: 0.7 },
      ],
    },
    {
      id: 'attach',
      title: 'Send the token on every request',
      description:
        'The client attaches the token to each subsequent request in an Authorization: Bearer header. The client carries the (signed) state.',
      activeNodes: ['client', 'api'],
      activeEdges: ['e-c-api'],
      packets: [{ from: 'client', to: 'api', color: TOKEN, label: 'Bearer eyJ…' }],
    },
    {
      id: 'verify',
      title: 'Verify the signature — no lookup',
      description:
        'The API verifies the signature with the shared secret or public key and trusts the claims inside. No database, no shared session store — that’s what lets it scale cleanly across services.',
      activeNodes: ['api'],
      activeEdges: ['e-c-api'],
      annotations: ['Verify signature locally', 'No session store'],
      packets: [{ from: 'api', to: 'client', color: OK, label: '200 · authorized' }],
    },
    {
      id: 'recap',
      title: 'Stateless — with a revocation catch',
      description:
        'Tokens keep servers stateless and scalable, but a token is valid until it expires and is hard to revoke early. Keep access tokens short-lived, pair with a refresh token, and never put secrets in a JWT — its payload is signed, not encrypted.',
      activeNodes: ['client', 'auth', 'api'],
      annotations: ['Short-lived + refresh token', 'Payload is readable'],
    },
  ],
  content,
}
