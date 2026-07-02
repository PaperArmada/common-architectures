import type { Architecture } from '../types'
import content from '../content/object-storage.mdx'

const PUT = '#f472b6'
const URL = '#c084fc'
const UP = '#38bdf8'
const SERVE = '#34d399'

export const objectStorage: Architecture = {
  slug: 'object-storage',
  title: 'Object Storage & Uploads',
  category: 'core-web',
  tagline: 'Durable, cheap blob storage for files — uploaded directly and served via a CDN.',
  level: 'intro',
  nodes: [
    { id: 'browser', label: 'Browser', kind: 'client', x: 12, y: 28 },
    { id: 'app', label: 'App server', kind: 'server', x: 12, y: 74 },
    { id: 'store', label: 'Object storage', sublabel: 'buckets', kind: 'storage', x: 50, y: 50 },
    { id: 'cdn', label: 'CDN', kind: 'cdn', x: 85, y: 28 },
    { id: 'viewer', label: 'Viewer', kind: 'client', x: 85, y: 74 },
  ],
  edges: [
    { id: 'e-app-store', from: 'app', to: 'store' },
    { id: 'e-app-br', from: 'app', to: 'browser' },
    { id: 'e-br-store', from: 'browser', to: 'store' },
    { id: 'e-store-cdn', from: 'store', to: 'cdn' },
    { id: 'e-cdn-v', from: 'cdn', to: 'viewer' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Big files don’t belong in the database',
      description:
        'Uploads, images, video, backups — this data is large and doesn’t belong in your database or on an app server’s local disk (which vanishes when the server is replaced).',
      activeNodes: ['app', 'store'],
    },
    {
      id: 'store',
      title: 'Store blobs in buckets',
      description:
        'Files are stored as objects in buckets, each addressed by a key like uploads/cat.jpg, and replicated across machines and zones for very high durability.',
      activeNodes: ['app', 'store'],
      activeEdges: ['e-app-store'],
      annotations: ['Key–value blobs · “eleven nines” durability'],
      packets: [{ from: 'app', to: 'store', color: PUT, label: 'put object' }],
    },
    {
      id: 'presigned',
      title: 'Presigned URLs: upload direct',
      description:
        'Rather than routing a big file through your servers, the app hands the browser a short-lived signed URL, and the browser uploads straight to storage. Your servers never touch the bytes.',
      activeNodes: ['app', 'browser', 'store'],
      activeEdges: ['e-app-br', 'e-br-store'],
      annotations: ['Bytes bypass your servers'],
      packets: [
        { from: 'app', to: 'browser', color: URL, label: 'presigned URL' },
        { from: 'browser', to: 'store', color: UP, label: 'upload direct', delay: 0.7 },
      ],
    },
    {
      id: 'serve',
      title: 'Serve through a CDN',
      description:
        'Object storage is the natural origin for a CDN: put it behind one and assets are cached at the edge, close to viewers.',
      activeNodes: ['store', 'cdn', 'viewer'],
      activeEdges: ['e-store-cdn', 'e-cdn-v'],
      packets: [
        { from: 'store', to: 'cdn', color: SERVE, label: 'origin fetch' },
        { from: 'cdn', to: 'viewer', color: SERVE, label: 'cached asset', delay: 0.6 },
      ],
    },
    {
      id: 'static',
      title: 'Static hosting, no app server',
      description:
        'You can serve an entire front-end bundle straight from a bucket plus a CDN, with no application server in the request path at all.',
      activeNodes: ['store', 'cdn'],
      activeEdges: ['e-store-cdn'],
      annotations: ['Bucket + CDN = static site'],
    },
    {
      id: 'recap',
      title: 'Cheap, durable, unbounded',
      description:
        'Object storage offloads heavy data from your app and database. But it’s not a filesystem or database — no partial in-place edits — and listing plus per-request costs add up at scale. Access control (public vs. signed) needs care.',
      activeNodes: ['store'],
      annotations: ['Not a filesystem/DB · mind access control'],
    },
  ],
  content,
}
