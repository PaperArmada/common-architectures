import type { Architecture } from '../types'
import content from '../content/caching.mdx'

const GET = '#38bdf8'
const HIT = '#34d399'
const MISS = '#fbbf24'
const WRITE = '#f472b6'

export const caching: Architecture = {
  slug: 'caching',
  title: 'Caching (Cache-Aside)',
  category: 'core-web',
  tagline: 'Serve hot reads from memory in microseconds, sparing the database.',
  level: 'core',
  nodes: [
    { id: 'app', label: 'App', kind: 'server', x: 13, y: 50 },
    { id: 'cache', label: 'Cache', sublabel: 'in-memory · Redis', kind: 'cache', x: 50, y: 26 },
    { id: 'db', label: 'Database', sublabel: 'source of truth', kind: 'db', x: 84, y: 72 },
  ],
  edges: [
    { id: 'e-a-c', from: 'app', to: 'cache' },
    { id: 'e-a-db', from: 'app', to: 'db', curve: 70 },
  ],
  steps: [
    {
      id: 'intro',
      title: 'The same hot data, read over and over',
      description:
        'Reading from a database is comparatively slow, yet popular data gets fetched thousands of times. Doing that work repeatedly is wasteful.',
      activeNodes: ['app', 'db'],
    },
    {
      id: 'check',
      title: 'Read: check the cache first',
      description:
        'In the cache-aside pattern, the app always asks the fast in-memory cache before anything else.',
      activeNodes: ['app', 'cache'],
      activeEdges: ['e-a-c'],
      packets: [{ from: 'app', to: 'cache', color: GET, label: 'GET user:42' }],
    },
    {
      id: 'miss',
      title: 'Cache miss → read the database',
      description:
        'The cache is cold and has nothing for this key. The app falls back to the database to load the real value.',
      activeNodes: ['app', 'cache', 'db'],
      activeEdges: ['e-a-c', 'e-a-db'],
      annotations: ['Cache MISS'],
      packets: [
        { from: 'cache', to: 'app', color: MISS, label: 'miss' },
        { from: 'app', to: 'db', color: GET, label: 'SELECT …', delay: 0.6 },
        { from: 'db', to: 'app', color: GET, label: 'row', delay: 1.3 },
      ],
    },
    {
      id: 'populate',
      title: 'Write the value into the cache',
      description:
        'Before returning, the app stores the result in the cache — so the next read for this key will be fast. The cache fills with exactly the data being used.',
      activeNodes: ['app', 'cache'],
      activeEdges: ['e-a-c'],
      packets: [{ from: 'app', to: 'cache', color: WRITE, label: 'SET user:42' }],
    },
    {
      id: 'hit',
      title: 'Cache hit — the database is untouched',
      description:
        'The next read finds the value already in memory and returns it in microseconds. The database never sees the request.',
      activeNodes: ['app', 'cache'],
      activeEdges: ['e-a-c'],
      annotations: ['Cache HIT — DB skipped'],
      packets: [
        { from: 'app', to: 'cache', color: GET, label: 'GET user:42' },
        { from: 'cache', to: 'app', color: HIT, label: 'hit ⚡', delay: 0.6 },
      ],
    },
    {
      id: 'invalidate',
      title: 'On write: update the DB, invalidate the cache',
      description:
        'When the data changes, the app writes to the database and evicts the stale cache entry. The next read repopulates it — avoiding serving old data.',
      activeNodes: ['app', 'cache', 'db'],
      activeEdges: ['e-a-c', 'e-a-db'],
      annotations: ['Write-through invalidation'],
      packets: [
        { from: 'app', to: 'db', color: WRITE, label: 'UPDATE' },
        { from: 'app', to: 'cache', color: WRITE, label: 'DEL user:42', delay: 0.3 },
      ],
    },
  ],
  content,
}
