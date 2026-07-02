import type { Architecture } from '../types'
import content from '../content/oauth.mdx'

const REDIR = '#38bdf8'
const CONSENT = '#a3e635'
const CODE = '#fbbf24'
const TOKEN = '#f43f5e'
const CALL = '#34d399'

export const oauth: Architecture = {
  slug: 'oauth',
  title: 'OAuth 2.0 / OIDC',
  category: 'security',
  tagline: 'Delegated authorization: scoped access without ever sharing a password.',
  level: 'advanced',
  nodes: [
    { id: 'user', label: 'User', sublabel: 'resource owner', kind: 'client', x: 12, y: 26 },
    { id: 'app', label: 'App', sublabel: 'client', kind: 'server', x: 14, y: 76 },
    { id: 'provider', label: 'Google', sublabel: 'auth server', kind: 'shield', x: 54, y: 28 },
    { id: 'api', label: 'Resource API', kind: 'server', x: 86, y: 72 },
  ],
  edges: [
    { id: 'e-u-app', from: 'user', to: 'app' },
    { id: 'e-u-prov', from: 'user', to: 'provider' },
    { id: 'e-app-prov', from: 'app', to: 'provider' },
    { id: 'e-app-api', from: 'app', to: 'api' },
  ],
  steps: [
    {
      id: 'intro',
      title: '“Log in with Google” — without the password',
      description:
        'You want to grant an app limited access to your account on another service, without handing over your password or the keys to everything. OAuth 2.0 delegates scoped authorization; OIDC adds "who is this user" for login.',
      activeNodes: ['user', 'app', 'provider'],
    },
    {
      id: 'redirect',
      title: 'Redirect to the provider',
      description:
        'The app sends the user to the provider, naming the scopes it wants (e.g. read profile). The app is only ever the requester here.',
      activeNodes: ['user', 'provider'],
      activeEdges: ['e-u-prov'],
      packets: [{ from: 'user', to: 'provider', color: REDIR, label: 'authorize?scope=profile' }],
    },
    {
      id: 'consent',
      title: 'Authenticate & consent — with the provider',
      description:
        'The user logs in and approves the request directly with the provider. Crucially, the app never sees the password.',
      activeNodes: ['user', 'provider'],
      activeEdges: ['e-u-prov'],
      annotations: ['App never sees the password'],
      packets: [
        { from: 'provider', to: 'user', color: CONSENT, label: 'consent?' },
        { from: 'user', to: 'provider', color: CONSENT, label: 'allow ✓', delay: 0.7 },
      ],
    },
    {
      id: 'code',
      title: 'Back to the app with a code',
      description:
        'The provider redirects the user back to the app with a short-lived authorization code — not a token yet.',
      activeNodes: ['provider', 'app', 'user'],
      activeEdges: ['e-u-app'],
      packets: [{ from: 'provider', to: 'app', color: CODE, label: 'auth code' }],
    },
    {
      id: 'exchange',
      title: 'Exchange the code for a token',
      description:
        'The app exchanges the code — server-to-server, using its client secret — for an access token (plus a refresh token, and with OIDC an ID token). This two-step keeps the token off the browser redirect.',
      activeNodes: ['app', 'provider'],
      activeEdges: ['e-app-prov'],
      annotations: ['Server-to-server · client secret · PKCE'],
      packets: [
        { from: 'app', to: 'provider', color: CODE, label: 'code + secret' },
        { from: 'provider', to: 'app', color: TOKEN, label: 'access token', delay: 0.7 },
      ],
    },
    {
      id: 'call',
      title: 'Call the API with a scoped token',
      description:
        'The app calls the resource API with the access token, limited to exactly what the user approved — nothing more.',
      activeNodes: ['app', 'api'],
      activeEdges: ['e-app-api'],
      annotations: ['Scoped + revocable access'],
      packets: [{ from: 'app', to: 'api', color: CALL, label: 'GET /profile · Bearer' }],
    },
    {
      id: 'recap',
      title: 'Four roles, kept separate',
      description:
        'Resource owner (user), client (app), authorization server (issues tokens), resource server (API) — separating them is the whole idea. It’s intricate and easy to get wrong, so use a vetted library or provider.',
      activeNodes: ['user', 'app', 'provider', 'api'],
      annotations: ['Don’t roll your own'],
    },
  ],
  content,
}
