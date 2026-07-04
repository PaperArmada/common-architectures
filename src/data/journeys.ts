import type { DiagramEdge, DiagramNode, PacketSpec } from '../types'

/**
 * Journeys: curated, ordered paths through the pattern library.
 *
 * Each journey tells one system's story. Every stage opens with a "wall" —
 * the problem that breaks the previous stage's world — and resolves it by
 * introducing one or two patterns from the library. The diagram is cumulative:
 * stages reveal nodes/edges, so the architecture visibly grows as you advance.
 */

export interface StageScene {
  activeNodes?: string[]
  failedNodes?: string[]
  activeEdges?: string[]
  packets?: PacketSpec[]
  annotations?: string[]
}

export interface JourneyStage {
  id: string
  title: string
  /** The problem that ends the previous stage's world. */
  wall: string
  /** How this stage's pattern(s) get past the wall. */
  fix: string
  /** Walkthroughs introduced at this stage. */
  archSlugs: string[]
  /** Node ids that join the system at this stage (cumulative). */
  reveals?: string[]
  /** Edge ids that join at this stage (cumulative). */
  revealEdges?: string[]
  /** Edge ids retired from this stage on (e.g. client→server once a LB exists). */
  retireEdges?: string[]
  /** Diagram emphasis while this stage is active. */
  scene: StageScene
}

export interface Journey {
  slug: string
  title: string
  tagline: string
  /** One-paragraph pitch for the index card / page header. */
  blurb: string
  accent: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  stages: JourneyStage[]
}

const CLIENT = '#38bdf8'
const OK = '#34d399'
const WARN = '#fbbf24'
const FAIL = '#f87171'

// ---------------------------------------------------------------------------
// Journey 1 — Scaling a web app: one box to ten million users
// ---------------------------------------------------------------------------

const scaling: Journey = {
  slug: 'scaling-web-app',
  title: 'Scaling a web app',
  tagline: 'From one box to ten million users, one wall at a time.',
  blurb:
    'The classic growth story. Start with everything on a single server — the right choice on day one — and watch each traffic milestone break something specific. Every stage names the wall you hit, then adds exactly the pattern that gets past it, until the architecture serves ten million users.',
  accent: '#818cf8',
  // Journey canvases share space with the narration panel, so nodes carry
  // explicit widths and sit on a 5-column grid to stay collision-free.
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 6, y: 50, width: 96 },
    { id: 'cdn', label: 'CDN', sublabel: 'edge', kind: 'cdn', x: 28, y: 12, width: 104 },
    { id: 'lb', label: 'Load Balancer', kind: 'lb', x: 28, y: 50, width: 116 },
    { id: 's1', label: 'App Server A', kind: 'server', x: 48, y: 30, width: 116 },
    { id: 's2', label: 'App Server B', kind: 'server', x: 48, y: 74, width: 116 },
    { id: 'cache', label: 'Cache', sublabel: 'in-memory', kind: 'cache', x: 68, y: 10, width: 104 },
    { id: 'q', label: 'Queue', sublabel: '+ workers', kind: 'queue', x: 68, y: 88, width: 104 },
    { id: 'db', label: 'Primary A', sublabel: 'writes', kind: 'db-primary', x: 68, y: 49, width: 110 },
    { id: 'r1', label: 'Replica 1', sublabel: 'reads', kind: 'db-replica', x: 88, y: 14, width: 104 },
    { id: 'r2', label: 'Replica 2', sublabel: 'reads', kind: 'db-replica', x: 88, y: 46, width: 104 },
    { id: 'db2', label: 'Primary B', sublabel: 'shard', kind: 'db-primary', x: 88, y: 78, width: 110 },
  ],
  edges: [
    { id: 'e-client-s1', from: 'client', to: 's1' },
    { id: 'e-s1-db', from: 's1', to: 'db' },
    { id: 'e-client-lb', from: 'client', to: 'lb' },
    { id: 'e-lb-s1', from: 'lb', to: 's1' },
    { id: 'e-lb-s2', from: 'lb', to: 's2' },
    { id: 'e-s2-db', from: 's2', to: 'db' },
    { id: 'e-s1-cache', from: 's1', to: 'cache' },
    { id: 'e-s2-cache', from: 's2', to: 'cache', curve: 0.15 },
    { id: 'e-client-cdn', from: 'client', to: 'cdn' },
    { id: 'e-db-r1', from: 'db', to: 'r1', dashed: true },
    { id: 'e-db-r2', from: 'db', to: 'r2', dashed: true },
    { id: 'e-s2-q', from: 's2', to: 'q', dashed: true },
    { id: 'e-q-db', from: 'q', to: 'db' },
    { id: 'e-s2-db2', from: 's2', to: 'db2', curve: -0.12 },
  ],
  stages: [
    {
      id: 'one-box',
      title: 'Day one: everything on one box',
      wall: 'You need to ship something real this week — not design for a million users you don’t have yet.',
      fix: 'One server runs the whole app: web process, business logic, and the database files, side by side. A DNS record points your domain at its IP. This is the right architecture for day one — simple to build, deploy, and debug. Every later stage exists because this one eventually succeeds.',
      archSlugs: ['dns'],
      reveals: ['client', 's1'],
      revealEdges: ['e-client-s1'],
      scene: {
        activeNodes: ['client', 's1'],
        activeEdges: ['e-client-s1'],
        packets: [
          { from: 'client', to: 's1', color: CLIENT, label: 'GET /' },
          { from: 's1', to: 'client', color: OK, label: '200', delay: 0.7 },
        ],
        annotations: ['~100 users'],
      },
    },
    {
      id: 'db-moves-out',
      title: 'The database moves out',
      wall: 'Every deploy restarts the database along with the app, and one runaway query starves the web process of CPU. One box means shared fate.',
      fix: 'Move the database to its own machine so the app and its data scale — and fail — independently. Because connecting is now a network round trip, each app process keeps a pool of warm connections instead of dialing the database on every request.',
      archSlugs: ['connection-pooling'],
      reveals: ['db'],
      revealEdges: ['e-s1-db'],
      scene: {
        activeNodes: ['s1', 'db'],
        activeEdges: ['e-s1-db'],
        packets: [
          { from: 'client', to: 's1', color: CLIENT },
          { from: 's1', to: 'db', color: WARN, label: 'query', delay: 0.5 },
          { from: 'db', to: 's1', color: OK, label: 'rows', delay: 1.1 },
        ],
        annotations: ['~1,000 users'],
      },
    },
    {
      id: 'clone-the-app',
      title: 'Clones behind a load balancer',
      wall: 'One app server maxes its CPU at peak. A bigger box buys time, but vertical scaling has a ceiling — and one box is still one failure away from an outage.',
      fix: 'Run several identical, stateless app servers and put a load balancer in front as the single public entry point. Any clone can serve any request, so capacity is now a dial: add servers under load, eject them when health checks fail.',
      archSlugs: ['load-balancer', 'health-checks'],
      reveals: ['lb', 's2'],
      revealEdges: ['e-client-lb', 'e-lb-s1', 'e-lb-s2', 'e-s2-db'],
      retireEdges: ['e-client-s1'],
      scene: {
        activeNodes: ['client', 'lb', 's1', 's2'],
        activeEdges: ['e-client-lb', 'e-lb-s1', 'e-lb-s2'],
        packets: [
          { from: 'client', to: 'lb', color: CLIENT, label: 'req 1' },
          { from: 'lb', to: 's1', color: CLIENT, delay: 0.5 },
          { from: 'client', to: 'lb', color: CLIENT, label: 'req 2', delay: 0.9 },
          { from: 'lb', to: 's2', color: CLIENT, delay: 1.4 },
        ],
        annotations: ['~10,000 users'],
      },
    },
    {
      id: 'cache-hot-reads',
      title: 'Cache the hot path',
      wall: 'The database feels every single request now. Profiling shows the same handful of queries — the homepage, hot profiles — running thousands of times a second.',
      fix: 'Put an in-memory cache between the app and the database. Hot reads come back in microseconds; the database only sees misses. A 90% hit rate cuts database read load by an order of magnitude — the cheapest scaling win in the whole journey.',
      archSlugs: ['caching'],
      reveals: ['cache'],
      revealEdges: ['e-s1-cache', 'e-s2-cache'],
      scene: {
        activeNodes: ['s1', 's2', 'cache'],
        activeEdges: ['e-s1-cache', 'e-s2-cache'],
        packets: [
          { from: 's1', to: 'cache', color: CLIENT, label: 'get' },
          { from: 'cache', to: 's1', color: OK, label: 'hit', delay: 0.5 },
          { from: 's2', to: 'cache', color: CLIENT, delay: 0.8 },
          { from: 's2', to: 'db', color: WARN, label: 'miss → db', delay: 1.4 },
        ],
        annotations: ['~50,000 users', '≈90% cache hit rate'],
      },
    },
    {
      id: 'edge-static',
      title: 'Push static assets to the edge',
      wall: 'Images, JavaScript, and CSS dominate your bandwidth, and users on other continents wait on every round trip. Your app servers spend their time serving files.',
      fix: 'Move static assets into object storage and serve them through a CDN. Users hit an edge server near them; your origin only sees occasional cache fills. App servers now spend their cycles on actual application work.',
      archSlugs: ['cdn', 'object-storage'],
      reveals: ['cdn'],
      revealEdges: ['e-client-cdn'],
      scene: {
        activeNodes: ['client', 'cdn'],
        activeEdges: ['e-client-cdn'],
        packets: [
          { from: 'client', to: 'cdn', color: CLIENT, label: 'app.js' },
          { from: 'cdn', to: 'client', color: OK, label: 'edge hit', delay: 0.5 },
          { from: 'cdn', to: 's1', color: WARN, label: 'miss → origin', delay: 1.0 },
        ],
        annotations: ['~200,000 users'],
      },
    },
    {
      id: 'read-replicas',
      title: 'Scale the reads',
      wall: 'The cache absorbs repeated reads, but unique ones — searches, feeds, long-tail pages — still funnel into a single database that’s running hot.',
      fix: 'Add read replicas. The primary handles all writes and streams its changes to the replicas; app servers fan reads out across them. Reads now scale horizontally — at the price of replication lag, which you must reason about (read-your-own-writes, stale feeds).',
      archSlugs: ['db-replication'],
      reveals: ['r1', 'r2'],
      revealEdges: ['e-db-r1', 'e-db-r2'],
      scene: {
        activeNodes: ['db', 'r1', 'r2'],
        activeEdges: ['e-db-r1', 'e-db-r2'],
        packets: [
          { from: 's1', to: 'db', color: WARN, label: 'write' },
          { from: 'db', to: 'r1', color: WARN, label: 'replicate', delay: 0.6 },
          { from: 'db', to: 'r2', color: WARN, delay: 0.8 },
          { from: 's2', to: 'r2', color: CLIENT, label: 'read', delay: 1.3 },
        ],
        annotations: ['~1M users', 'replication lag: ms–s'],
      },
    },
    {
      id: 'async-work',
      title: 'Take slow work off the request path',
      wall: 'Signups send emails, uploads make thumbnails, purchases call payment providers — and users wait on all of it. Traffic spikes turn slow endpoints into timeouts.',
      fix: 'Enqueue slow work and return to the user immediately. A pool of workers drains the queue at its own pace, so spikes become backlog instead of failures. Autoscaling grows the server and worker pools when load stays high — and shrinks them when it passes.',
      archSlugs: ['message-queue', 'autoscaling'],
      reveals: ['q'],
      revealEdges: ['e-s2-q', 'e-q-db'],
      scene: {
        activeNodes: ['s2', 'q'],
        activeEdges: ['e-s2-q', 'e-q-db'],
        packets: [
          { from: 's2', to: 'q', color: WARN, label: 'job' },
          { from: 's2', to: 'client', color: OK, label: '202 accepted', delay: 0.4 },
          { from: 'q', to: 'db', color: WARN, label: 'worker drains', delay: 1.0 },
        ],
        annotations: ['~3M users'],
      },
    },
    {
      id: 'shard-writes',
      title: 'Split the writes: sharding',
      wall: 'Replicas scale reads, but every write still lands on a single primary — and it’s out of headroom. This is the wall that no bigger machine can fix.',
      fix: 'Partition the data across independent primaries, each owning a slice of the keyspace. Consistent hashing keeps the key→shard mapping stable as shards join or leave. Writes now scale horizontally too — the final piece behind planet-scale systems.',
      archSlugs: ['sharding', 'consistent-hashing'],
      reveals: ['db2'],
      revealEdges: ['e-s2-db2'],
      scene: {
        activeNodes: ['s2', 'db', 'db2'],
        activeEdges: ['e-s2-db2', 'e-s2-db'],
        packets: [
          { from: 's2', to: 'db', color: WARN, label: 'user 1..N' },
          { from: 's2', to: 'db2', color: WARN, label: 'user N+1..', delay: 0.6 },
        ],
        annotations: ['~10M users', 'hash(key) → shard'],
      },
    },
    {
      id: 'ten-million',
      title: 'Ten million users',
      wall: 'There is no wall — for now. Every tier scales horizontally: servers, caches, reads, writes, and background work.',
      fix: 'This is the architecture behind most large web products, assembled one necessity at a time. From here, growth is repetition rather than reinvention — multi-region and cell-based designs reuse these same moves at bigger scale. Two natural next reads: splitting the app itself, and protecting it from abusive traffic.',
      archSlugs: ['microservices', 'rate-limiting'],
      scene: {
        activeNodes: ['client', 'cdn', 'lb', 's1', 's2', 'cache', 'q', 'db', 'db2', 'r1', 'r2'],
        packets: [
          { from: 'client', to: 'lb', color: CLIENT },
          { from: 'client', to: 'cdn', color: CLIENT, delay: 0.2 },
          { from: 'lb', to: 's1', color: CLIENT, delay: 0.5 },
          { from: 's1', to: 'cache', color: CLIENT, delay: 0.9 },
          { from: 's2', to: 'q', color: WARN, delay: 0.9 },
          { from: 'db', to: 'r1', color: WARN, delay: 1.2 },
        ],
        annotations: ['10,000,000 users'],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Journey 2 — Making systems resilient
// ---------------------------------------------------------------------------

const resilience: Journey = {
  slug: 'resilience',
  title: 'Making systems resilient',
  tagline: 'Surviving failure on purpose, not by luck.',
  blurb:
    'Everything fails eventually: networks drop packets, dependencies go down, traffic spikes past capacity. This journey hardens one checkout service step by step — detect failure fast, retry it safely, stop hammering what’s down, contain the blast radius, shed what you can’t serve, and watch all of it in production.',
  accent: '#f87171',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 6, y: 50, width: 96 },
    { id: 'lb', label: 'Load Balancer', kind: 'lb', x: 28, y: 50, width: 116 },
    { id: 's1', label: 'Checkout A', kind: 'server', x: 48, y: 24, width: 110 },
    { id: 's2', label: 'Checkout B', kind: 'server', x: 48, y: 76, width: 110 },
    { id: 'pay', label: 'Payments', sublabel: 'external API', kind: 'gateway', x: 70, y: 20, width: 110 },
    { id: 'db', label: 'Orders DB', kind: 'db', x: 70, y: 68, width: 104 },
    { id: 'mon', label: 'Telemetry', kind: 'monitor', x: 91, y: 8, width: 104 },
  ],
  edges: [
    { id: 'e-client-lb', from: 'client', to: 'lb' },
    { id: 'e-lb-s1', from: 'lb', to: 's1' },
    { id: 'e-lb-s2', from: 'lb', to: 's2' },
    { id: 'e-s1-db', from: 's1', to: 'db' },
    { id: 'e-s2-db', from: 's2', to: 'db' },
    { id: 'e-s1-pay', from: 's1', to: 'pay' },
    { id: 'e-s2-pay', from: 's2', to: 'pay', curve: 0.2 },
    { id: 'e-s1-mon', from: 's1', to: 'mon', dashed: true, curve: -0.15 },
    { id: 'e-lb-mon', from: 'lb', to: 'mon', dashed: true, curve: -0.3 },
  ],
  stages: [
    {
      id: 'detect',
      title: 'Failure is a when, not an if',
      wall: 'An instance died at 2am — and kept receiving traffic for twenty minutes, because nothing noticed. Users saw errors; you saw them on Twitter first.',
      fix: 'Health checks make failure visible in seconds. The balancer probes every instance and ejects the ones that stop answering; readiness probes keep half-started instances out of rotation. Detection is the foundation — every other pattern in this journey builds on knowing something is wrong.',
      archSlugs: ['health-checks'],
      reveals: ['client', 'lb', 's1', 's2', 'db'],
      revealEdges: ['e-client-lb', 'e-lb-s1', 'e-lb-s2', 'e-s1-db', 'e-s2-db'],
      scene: {
        activeNodes: ['lb', 's1'],
        failedNodes: ['s2'],
        activeEdges: ['e-lb-s1', 'e-lb-s2'],
        packets: [
          { from: 'lb', to: 's1', color: OK, label: 'probe ✓' },
          { from: 'lb', to: 's2', color: FAIL, label: 'probe ✗', delay: 0.5 },
        ],
        annotations: ['B ejected from rotation'],
      },
    },
    {
      id: 'retry',
      title: 'Try again — carefully',
      wall: 'Most failures are transient: a dropped packet, a restarting pod, a one-second blip that would succeed on the next attempt. But naive retries can double-charge a card — or DDoS your own dependency.',
      fix: 'Retry with exponential backoff and jitter, and only retry operations that are safe to repeat. Idempotency keys make repeats safe: the payment provider recognizes the second attempt of the same request and returns the original result instead of charging twice.',
      archSlugs: ['retry', 'idempotency'],
      reveals: ['pay'],
      revealEdges: ['e-s1-pay', 'e-s2-pay'],
      scene: {
        activeNodes: ['s1', 'pay'],
        activeEdges: ['e-s1-pay'],
        packets: [
          { from: 's1', to: 'pay', color: FAIL, label: 'charge ✗' },
          { from: 's1', to: 'pay', color: WARN, label: 'retry (same key)', delay: 0.9 },
          { from: 'pay', to: 's1', color: OK, label: '✓ once', delay: 1.6 },
        ],
        annotations: ['backoff + jitter', 'idempotency key'],
      },
    },
    {
      id: 'circuit-break',
      title: 'Stop hammering what’s down',
      wall: 'The payment provider goes fully down for ten minutes. Now every request waits out the full timeout before failing — threads pile up, queues back up, and your service dies of someone else’s outage.',
      fix: 'A circuit breaker counts recent failures and trips open: calls fail fast — or serve a fallback — without touching the dead dependency at all. After a cooldown it lets one trial request through; success closes the circuit again. Your latency stays flat through their outage.',
      archSlugs: ['circuit-breaker'],
      scene: {
        activeNodes: ['s1', 's2'],
        failedNodes: ['pay'],
        activeEdges: ['e-s1-pay', 'e-s2-pay'],
        packets: [
          { from: 's1', to: 'pay', color: FAIL, label: '✗' },
          { from: 's2', to: 'client', color: WARN, label: 'fail fast', delay: 0.8 },
        ],
        annotations: ['circuit: OPEN', 'fallback: save order, charge later'],
      },
    },
    {
      id: 'bulkhead',
      title: 'Contain the blast radius',
      wall: 'A slow dependency quietly consumed the entire shared connection pool — and endpoints that never touch payments started timing out too. Failure spread through shared resources.',
      fix: 'Bulkheads partition resources the way a ship’s hull is partitioned: separate connection pools, thread pools, or instance groups per dependency or per tenant. When one compartment floods, the others keep sailing — degradation instead of collapse.',
      archSlugs: ['bulkhead'],
      scene: {
        activeNodes: ['s1', 's2', 'db', 'pay'],
        activeEdges: ['e-s1-db', 'e-s2-db'],
        packets: [
          { from: 's1', to: 'pay', color: FAIL, label: 'pool A: full' },
          { from: 's2', to: 'db', color: OK, label: 'pool B: fine', delay: 0.6 },
        ],
        annotations: ['isolated pools per dependency'],
      },
    },
    {
      id: 'shed-load',
      title: 'Shed load before you fall over',
      wall: 'A retry storm — or just a viral moment — brings 10× normal traffic. Trying to serve all of it badly means serving none of it: every request times out.',
      fix: 'Rate limiting rejects the excess early and cheaply (HTTP 429) so the requests you do accept actually complete. Well-behaved clients back off; capacity goes to real work. Behind the shield, autoscaling grows the fleet to raise the ceiling — but the limiter is what keeps you alive while it does.',
      archSlugs: ['rate-limiting', 'autoscaling'],
      scene: {
        activeNodes: ['client', 'lb'],
        activeEdges: ['e-client-lb'],
        packets: [
          { from: 'client', to: 'lb', color: CLIENT, label: 'req' },
          { from: 'client', to: 'lb', color: CLIENT, delay: 0.25 },
          { from: 'lb', to: 'client', color: FAIL, label: '429 — over limit', delay: 0.8 },
          { from: 'lb', to: 's1', color: OK, label: 'admitted', delay: 1.2 },
        ],
        annotations: ['10× spike', 'reject early, serve the rest'],
      },
    },
    {
      id: 'observe',
      title: 'See it break in production',
      wall: 'You survived the outage — but reconstructing what actually happened took three engineers and four hours of grepping. Resilience you can’t observe is just luck.',
      fix: 'Metrics catch the anomaly (error rate, latency percentiles), traces pinpoint which hop slowed down, and structured logs carry the detail. Every pattern in this journey emits signals — health-check ejections, retry counts, circuit state, shed load. Dashboards and alerts close the loop.',
      archSlugs: ['metrics', 'tracing', 'logging'],
      reveals: ['mon'],
      revealEdges: ['e-s1-mon', 'e-lb-mon'],
      scene: {
        activeNodes: ['s1', 'lb', 'mon'],
        activeEdges: ['e-s1-mon', 'e-lb-mon'],
        packets: [
          { from: 's1', to: 'mon', color: WARN, label: 'metrics' },
          { from: 'lb', to: 'mon', color: WARN, label: 'traces', delay: 0.5 },
        ],
        annotations: ['alert: p99 > 800ms'],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Journey 3 — Shipping without fear
// ---------------------------------------------------------------------------

const shipping: Journey = {
  slug: 'safe-shipping',
  title: 'Shipping without fear',
  tagline: 'Deploys that don’t take the site down.',
  blurb:
    'The scariest moment in operations used to be the deploy. This journey walks the evolution of release engineering: replace instances without downtime, flip whole environments in seconds, let 1% of traffic find the bugs, turn features on without deploying — and finally, replace an entire legacy system without a big bang.',
  accent: '#38bdf8',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 7, y: 50, width: 96 },
    { id: 'router', label: 'Router', sublabel: 'traffic split', kind: 'lb', x: 29, y: 50, width: 104 },
    { id: 'v1', label: 'Old System', sublabel: 'v1', kind: 'server', x: 53, y: 24, width: 110 },
    { id: 'v2', label: 'New System', sublabel: 'v2', kind: 'server', x: 53, y: 76, width: 110 },
    { id: 'flags', label: 'Flag Service', kind: 'registry', x: 80, y: 24, width: 110 },
    { id: 'mon', label: 'Metrics', kind: 'monitor', x: 80, y: 76, width: 104 },
  ],
  edges: [
    { id: 'e-client-router', from: 'client', to: 'router' },
    { id: 'e-router-v1', from: 'router', to: 'v1' },
    { id: 'e-router-v2', from: 'router', to: 'v2' },
    { id: 'e-v1-mon', from: 'v1', to: 'mon', dashed: true, curve: 0.25 },
    { id: 'e-v2-mon', from: 'v2', to: 'mon', dashed: true },
    { id: 'e-v1-flags', from: 'v1', to: 'flags' },
    { id: 'e-v2-flags', from: 'v2', to: 'flags', dashed: true, curve: -0.25 },
  ],
  stages: [
    {
      id: 'rolling',
      title: 'Replace the plane mid-flight',
      wall: 'Deploying used to mean: stop the app, copy files, start, pray. Every release was minutes of downtime — so releases became rare, big, and terrifying.',
      fix: 'Rolling deploys replace instances a few at a time behind the balancer. Capacity dips but never disappears, new instances must pass health checks before receiving traffic, and a bad build can be halted before it takes the whole fleet.',
      archSlugs: ['rolling-deploy'],
      reveals: ['client', 'router', 'v1', 'v2'],
      revealEdges: ['e-client-router', 'e-router-v1', 'e-router-v2'],
      scene: {
        activeNodes: ['router', 'v1', 'v2'],
        activeEdges: ['e-router-v1', 'e-router-v2'],
        packets: [
          { from: 'router', to: 'v1', color: CLIENT, label: 'traffic' },
          { from: 'router', to: 'v2', color: OK, label: 'one at a time', delay: 0.6 },
        ],
        annotations: ['zero downtime', 'both versions live briefly'],
      },
    },
    {
      id: 'blue-green',
      title: 'Two environments, one switch',
      wall: 'Rolling deploys mix old and new for the whole rollout, and rolling *back* means rolling forward again — painfully slow when production is on fire.',
      fix: 'Blue-green keeps two complete environments. Deploy to the idle one, smoke-test it against real infrastructure, then flip the router. All traffic moves at once — and rollback is flipping the switch back. Seconds, not minutes.',
      archSlugs: ['blue-green'],
      scene: {
        activeNodes: ['router', 'v2'],
        activeEdges: ['e-router-v2'],
        packets: [
          { from: 'router', to: 'v1', color: '#5f6d8c', label: 'idle' },
          { from: 'router', to: 'v2', color: OK, label: '100% — flipped', delay: 0.5 },
        ],
        annotations: ['rollback = flip back'],
      },
    },
    {
      id: 'canary',
      title: 'Let 1% find the bugs',
      wall: 'Staging didn’t catch it — the bug only shows under real traffic patterns. Rolling and blue-green both eventually expose *everyone* to a bad release at once.',
      fix: 'Canary releases route a small slice of live traffic to the new version and compare its error rate and latency against the baseline. Healthy numbers earn more traffic; a regression hurts 1% of users for two minutes instead of all of them.',
      archSlugs: ['canary'],
      reveals: ['mon'],
      revealEdges: ['e-v1-mon', 'e-v2-mon'],
      scene: {
        activeNodes: ['router', 'v1', 'v2', 'mon'],
        activeEdges: ['e-router-v1', 'e-router-v2', 'e-v2-mon'],
        packets: [
          { from: 'router', to: 'v1', color: CLIENT, label: '99%' },
          { from: 'router', to: 'v2', color: WARN, label: '1% canary', delay: 0.4 },
          { from: 'v2', to: 'mon', color: WARN, label: 'compare', delay: 1.0 },
        ],
        annotations: ['error rate: canary vs baseline'],
      },
    },
    {
      id: 'flags',
      title: 'Decouple deploy from release',
      wall: 'Even canaries gate *code*, not *features*. Marketing wants the feature live Tuesday at 9am sharp; engineering wants code merged and deployed continuously. Those are different events.',
      fix: 'Feature flags ship code dark and turn features on at runtime — per user, per cohort, per region. Deploys become routine plumbing; releases become a product decision with an instant kill switch. (This is also how canarying single features works.)',
      archSlugs: ['feature-flags'],
      reveals: ['flags'],
      revealEdges: ['e-v1-flags', 'e-v2-flags'],
      scene: {
        activeNodes: ['v1', 'flags'],
        activeEdges: ['e-v1-flags'],
        packets: [
          { from: 'v1', to: 'flags', color: CLIENT, label: 'enabled for user?' },
          { from: 'flags', to: 'v1', color: OK, label: 'on: 5% cohort', delay: 0.6 },
        ],
        annotations: ['deploy ≠ release', 'kill switch'],
      },
    },
    {
      id: 'strangler',
      title: 'Rewrites without big bangs',
      wall: 'Now the scary deploy is a whole *system*: the legacy monolith needs replacing, and big-bang rewrites are where projects go to die.',
      fix: 'The strangler fig migrates route by route. The router sends one endpoint at a time to the new system; old and new run side by side for months, every step is small and reversible, and one day the legacy box simply has no traffic left.',
      archSlugs: ['strangler-fig'],
      scene: {
        activeNodes: ['router', 'v1', 'v2'],
        activeEdges: ['e-router-v1', 'e-router-v2'],
        packets: [
          { from: 'router', to: 'v2', color: OK, label: '/orders → new' },
          { from: 'router', to: 'v1', color: '#5f6d8c', label: '/legacy/* → old', delay: 0.5 },
        ],
        annotations: ['migrate route by route'],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Journey 4 — Data beyond CRUD
// ---------------------------------------------------------------------------

const dataEvents: Journey = {
  slug: 'data-beyond-crud',
  title: 'Data beyond CRUD',
  tagline: 'Events, streams, and eventual consistency.',
  blurb:
    'At some point, one database table stops being the whole truth: other services need to know what happened, screens want purpose-built views, dashboards want answers while the data is still moving. This journey rebuilds a system around events — reliably published, broadly consumed, and coordinated without distributed transactions.',
  accent: '#c084fc',
  nodes: [
    { id: 'client', label: 'Client', kind: 'client', x: 5, y: 46, width: 96 },
    { id: 'api', label: 'API', kind: 'server', x: 27, y: 46, width: 104 },
    { id: 'db', label: 'Write DB', sublabel: '+ outbox', kind: 'db-primary', x: 44, y: 78, width: 110 },
    { id: 'broker', label: 'Event Log', sublabel: 'topics', kind: 'broker', x: 46, y: 16, width: 110 },
    { id: 'email', label: 'Email Svc', kind: 'worker', x: 68, y: 8, width: 104 },
    { id: 'proj', label: 'Projector', kind: 'worker', x: 68, y: 40, width: 104 },
    { id: 'read', label: 'Read Model', sublabel: 'per screen', kind: 'db', x: 88, y: 40, width: 110 },
    { id: 'stream', label: 'Stream Proc', sublabel: 'windows', kind: 'worker', x: 68, y: 72, width: 110 },
    { id: 'agg', label: 'Dashboard', kind: 'monitor', x: 88, y: 74, width: 110 },
  ],
  edges: [
    { id: 'e-client-api', from: 'client', to: 'api' },
    { id: 'e-api-db', from: 'api', to: 'db' },
    { id: 'e-db-broker', from: 'db', to: 'broker', dashed: true },
    { id: 'e-broker-email', from: 'broker', to: 'email' },
    { id: 'e-broker-proj', from: 'broker', to: 'proj' },
    { id: 'e-proj-read', from: 'proj', to: 'read' },
    { id: 'e-broker-stream', from: 'broker', to: 'stream', curve: 0.2 },
    { id: 'e-stream-agg', from: 'stream', to: 'agg' },
  ],
  stages: [
    {
      id: 'outbox',
      title: 'Two systems, one truth',
      wall: 'The API writes the order to the database *and* publishes an "order placed" event — and sometimes crashes in between. Now the database and everything downstream disagree, forever.',
      fix: 'The transactional outbox writes the event into the same database transaction as the data itself — one atomic commit. A relay then reads the outbox table and publishes to the event log, retrying until acknowledged. Nothing is ever half-recorded.',
      archSlugs: ['outbox'],
      reveals: ['client', 'api', 'db', 'broker'],
      revealEdges: ['e-client-api', 'e-api-db', 'e-db-broker'],
      scene: {
        activeNodes: ['api', 'db', 'broker'],
        activeEdges: ['e-api-db', 'e-db-broker'],
        packets: [
          { from: 'api', to: 'db', color: WARN, label: 'order + event, 1 txn' },
          { from: 'db', to: 'broker', color: OK, label: 'relay publishes', delay: 0.9 },
        ],
        annotations: ['atomic: both or neither'],
      },
    },
    {
      id: 'pubsub',
      title: 'One event, many listeners',
      wall: 'Shipping, email, analytics, and search *all* want to know about orders — and the API can’t know about, or wait on, every one of them. Point-to-point integrations multiply into a mess.',
      fix: 'Publish/subscribe inverts the coupling: the producer publishes to a topic without knowing who’s listening; any number of consumers subscribe independently, each at its own pace. Adding the fifth consumer changes nothing about the producer — the whole system becomes event-driven.',
      archSlugs: ['pub-sub', 'event-driven'],
      reveals: ['email'],
      revealEdges: ['e-broker-email'],
      scene: {
        activeNodes: ['broker', 'email'],
        activeEdges: ['e-broker-email'],
        packets: [
          { from: 'db', to: 'broker', color: WARN, label: 'order.placed' },
          { from: 'broker', to: 'email', color: OK, label: 'fan out', delay: 0.7 },
        ],
        annotations: ['producers don’t know consumers'],
      },
    },
    {
      id: 'read-models',
      title: 'Views built from events',
      wall: 'Every screen queries the normalized write model through five joins. The write side wants integrity; the read side wants pre-shaped answers. One schema serves both badly.',
      fix: 'Split the paths (CQRS): commands hit the write model; projectors consume the event stream and maintain read models shaped exactly for each screen. Push it further and the event log becomes the system of record itself — event sourcing — with current state as just one replayable view.',
      archSlugs: ['cqrs', 'event-sourcing'],
      reveals: ['proj', 'read'],
      revealEdges: ['e-broker-proj', 'e-proj-read'],
      scene: {
        activeNodes: ['broker', 'proj', 'read'],
        activeEdges: ['e-broker-proj', 'e-proj-read'],
        packets: [
          { from: 'broker', to: 'proj', color: WARN, label: 'events' },
          { from: 'proj', to: 'read', color: OK, label: 'update view', delay: 0.7 },
          { from: 'api', to: 'read', color: CLIENT, label: 'query', delay: 1.3 },
        ],
        annotations: ['eventually consistent'],
      },
    },
    {
      id: 'streams',
      title: 'Answers while the data moves',
      wall: 'The nightly batch job answers yesterday’s questions. Fraud detection, trending lists, and live dashboards can’t wait until midnight.',
      fix: 'Stream processors compute over events as they flow — windowed aggregations, joins between streams, anomaly detection — turning the event log into continuously updated answers with seconds of latency instead of a day.',
      archSlugs: ['stream-processing'],
      reveals: ['stream', 'agg'],
      revealEdges: ['e-broker-stream', 'e-stream-agg'],
      scene: {
        activeNodes: ['broker', 'stream', 'agg'],
        activeEdges: ['e-broker-stream', 'e-stream-agg'],
        packets: [
          { from: 'broker', to: 'stream', color: WARN, label: 'event stream' },
          { from: 'stream', to: 'agg', color: OK, label: '5-min window', delay: 0.8 },
        ],
        annotations: ['latency: seconds, not a day'],
      },
    },
    {
      id: 'sagas',
      title: 'Transactions that span services',
      wall: 'An order touches payments, inventory, and shipping — three services, three databases, and no distributed BEGIN/COMMIT that survives contact with scale.',
      fix: 'A saga breaks the transaction into local steps coordinated through events, with a compensating action for every step: if shipping fails, inventory is released and the payment refunded. Two-phase commit still exists for the rare case that truly needs atomicity — and its cost is why sagas won.',
      archSlugs: ['saga', 'two-phase-commit'],
      scene: {
        activeNodes: ['api', 'broker', 'email', 'proj'],
        activeEdges: ['e-db-broker', 'e-broker-email', 'e-broker-proj'],
        packets: [
          { from: 'db', to: 'broker', color: WARN, label: 'step 1 ✓' },
          { from: 'broker', to: 'proj', color: WARN, label: 'step 2 ✓', delay: 0.6 },
          { from: 'broker', to: 'email', color: FAIL, label: 'step 3 ✗ → compensate', delay: 1.2 },
        ],
        annotations: ['each step reversible'],
      },
    },
  ],
}

export const JOURNEYS: Journey[] = [scaling, resilience, shipping, dataEvents]

export function getJourney(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}
