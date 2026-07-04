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
  /** Node ids removed from this stage on (e.g. the monolith once it's decomposed). */
  retireNodes?: string[]
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

// ---------------------------------------------------------------------------
// Journey 5 — One app becomes many
// ---------------------------------------------------------------------------

const decomposition: Journey = {
  slug: 'one-app-many',
  title: 'One app becomes many',
  tagline: 'Breaking up the monolith — and paying the toll.',
  blurb:
    'Monoliths don’t fail because they’re slow; they fail because forty engineers can’t share one deploy train. This journey splits a monolith by capability, then meets every problem the split creates: services that can’t find each other, clients drowning in endpoints, frontends that need different shapes — and the honest, permanent cost of going distributed.',
  accent: '#34d399',
  nodes: [
    { id: 'web', label: 'Web App', kind: 'client', x: 6, y: 26, width: 96 },
    { id: 'mob', label: 'Mobile App', kind: 'client', x: 6, y: 74, width: 96 },
    { id: 'mono', label: 'Monolith', kind: 'server', x: 28, y: 50, width: 104 },
    { id: 'gw', label: 'API Gateway', kind: 'gateway', x: 28, y: 50, width: 110 },
    { id: 'bffw', label: 'Web BFF', kind: 'server', x: 28, y: 18, width: 104 },
    { id: 'bffm', label: 'Mobile BFF', kind: 'server', x: 28, y: 82, width: 104 },
    { id: 'svc1', label: 'Orders', kind: 'server', x: 54, y: 18, width: 96 },
    { id: 'svc2', label: 'Users', kind: 'server', x: 54, y: 50, width: 96 },
    { id: 'svc3', label: 'Catalog', kind: 'server', x: 54, y: 82, width: 96 },
    { id: 'reg', label: 'Registry', kind: 'registry', x: 78, y: 50, width: 104 },
  ],
  edges: [
    { id: 'e-web-mono', from: 'web', to: 'mono' },
    { id: 'e-mob-mono', from: 'mob', to: 'mono' },
    { id: 'e-web-svc1', from: 'web', to: 'svc1' },
    { id: 'e-mob-svc3', from: 'mob', to: 'svc3' },
    { id: 'e-svc1-svc2', from: 'svc1', to: 'svc2' },
    { id: 'e-s1-reg', from: 'svc1', to: 'reg', dashed: true },
    { id: 'e-s2-reg', from: 'svc2', to: 'reg', dashed: true },
    { id: 'e-s3-reg', from: 'svc3', to: 'reg', dashed: true },
    { id: 'e-web-gw', from: 'web', to: 'gw' },
    { id: 'e-mob-gw', from: 'mob', to: 'gw' },
    { id: 'e-gw-svc1', from: 'gw', to: 'svc1' },
    { id: 'e-gw-svc2', from: 'gw', to: 'svc2' },
    { id: 'e-gw-svc3', from: 'gw', to: 'svc3' },
    { id: 'e-web-bffw', from: 'web', to: 'bffw' },
    { id: 'e-mob-bffm', from: 'mob', to: 'bffm' },
    { id: 'e-bffw-svc1', from: 'bffw', to: 'svc1' },
    { id: 'e-bffw-svc2', from: 'bffw', to: 'svc2' },
    { id: 'e-bffm-svc2', from: 'bffm', to: 'svc2' },
    { id: 'e-bffm-svc3', from: 'bffm', to: 'svc3' },
  ],
  stages: [
    {
      id: 'deploy-train',
      title: 'Every team, one deploy train',
      wall: 'Forty engineers share one codebase. A bug in reporting blocks the checkout team’s release; a search migration locks everyone’s tables. Shipping speed decays as headcount grows.',
      fix: 'Split the monolith into services along capability lines — Orders, Users, Catalog — each with its own code, data, and deploy pipeline. Teams ship independently; a reporting bug can no longer block checkout. (The Shipping journey’s strangler fig shows how to make this split incrementally instead of big-bang.)',
      archSlugs: ['microservices'],
      reveals: ['web', 'mob', 'mono'],
      revealEdges: ['e-web-mono', 'e-mob-mono'],
      scene: {
        activeNodes: ['mono'],
        activeEdges: ['e-web-mono', 'e-mob-mono'],
        packets: [
          { from: 'web', to: 'mono', color: CLIENT },
          { from: 'mob', to: 'mono', color: CLIENT, delay: 0.4 },
        ],
        annotations: ['1 codebase · 40 engineers · 1 deploy'],
      },
    },
    {
      id: 'finding',
      title: 'Now the services must find each other',
      wall: 'Orders needs to call Users — but with autoscaling and daily redeploys, instances appear and vanish by the minute. Hardcoded addresses break every day.',
      fix: 'A service registry: every instance registers itself on boot and is health-checked; callers resolve a name — "users" — to a live instance at request time. The network map maintains itself as the fleet churns.',
      archSlugs: ['service-discovery'],
      reveals: ['svc1', 'svc2', 'svc3', 'reg'],
      retireNodes: ['mono'],
      revealEdges: ['e-web-svc1', 'e-mob-svc3', 'e-svc1-svc2', 'e-s1-reg', 'e-s2-reg', 'e-s3-reg'],
      retireEdges: ['e-web-mono', 'e-mob-mono'],
      scene: {
        activeNodes: ['svc1', 'svc2', 'reg'],
        activeEdges: ['e-s1-reg', 'e-svc1-svc2'],
        packets: [
          { from: 'svc1', to: 'reg', color: CLIENT, label: 'where is users?' },
          { from: 'reg', to: 'svc1', color: OK, label: '10.0.3.7', delay: 0.6 },
          { from: 'svc1', to: 'svc2', color: WARN, delay: 1.2 },
        ],
        annotations: ['instances register on boot'],
      },
    },
    {
      id: 'front-door',
      title: 'Clients drown in endpoints',
      wall: 'The web app now calls three services directly: three hostnames, three auth checks, CORS everywhere, retry logic living in the browser. Every new service makes every client heavier.',
      fix: 'An API gateway gives clients one front door: a single endpoint that authenticates, rate-limits, and routes to the right service. Cross-cutting concerns get one implementation at the edge instead of one per client.',
      archSlugs: ['api-gateway'],
      reveals: ['gw'],
      retireEdges: ['e-web-svc1', 'e-mob-svc3'],
      revealEdges: ['e-web-gw', 'e-mob-gw', 'e-gw-svc1', 'e-gw-svc2', 'e-gw-svc3'],
      scene: {
        activeNodes: ['web', 'gw', 'svc1'],
        activeEdges: ['e-web-gw', 'e-gw-svc1'],
        packets: [
          { from: 'web', to: 'gw', color: CLIENT, label: 'one endpoint' },
          { from: 'gw', to: 'svc1', color: CLIENT, label: 'route', delay: 0.6 },
        ],
        annotations: ['auth · rate limit · route — once'],
      },
    },
    {
      id: 'bff',
      title: 'One size fits nobody',
      wall: 'Mobile wants tiny payloads over flaky networks; the web app wants rich, aggregated pages. The one-size-fits-all gateway API serves both badly — and every compromise ships to everyone.',
      fix: 'Give each frontend its own backend: a Web BFF and a Mobile BFF, each owned by the client team that consumes it, each aggregating the same services into exactly the shape its client needs.',
      archSlugs: ['bff'],
      reveals: ['bffw', 'bffm'],
      retireNodes: ['gw'],
      revealEdges: ['e-web-bffw', 'e-mob-bffm', 'e-bffw-svc1', 'e-bffw-svc2', 'e-bffm-svc2', 'e-bffm-svc3'],
      scene: {
        activeNodes: ['web', 'mob', 'bffw', 'bffm'],
        activeEdges: ['e-web-bffw', 'e-mob-bffm'],
        packets: [
          { from: 'bffw', to: 'web', color: OK, label: 'rich page' },
          { from: 'bffm', to: 'mob', color: OK, label: 'lean JSON', delay: 0.5 },
        ],
        annotations: ['each client, its own shape'],
      },
    },
    {
      id: 'the-bill',
      title: 'The distributed bill comes due',
      wall: 'You traded one big problem for many small ones: a slow Users service now stalls every caller, and a single purchase touches three databases with no shared transaction.',
      fix: 'This is the honest, permanent price of microservices — and the reason two other journeys exist. Resilience patterns contain cascading failures; sagas coordinate writes that span services. The split pays off only when the team pain it solves outweighs this complexity — which is why the monolith was the right day-one choice.',
      archSlugs: ['circuit-breaker', 'saga'],
      scene: {
        activeNodes: ['web', 'mob', 'bffw', 'bffm', 'svc1', 'svc2', 'svc3', 'reg'],
        packets: [
          { from: 'web', to: 'bffw', color: CLIENT },
          { from: 'bffw', to: 'svc1', color: CLIENT, delay: 0.4 },
          { from: 'svc1', to: 'svc2', color: FAIL, label: 'slow…', delay: 0.9 },
        ],
        annotations: ['distributed by choice, not accident'],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Journey 6 — Locking the front door
// ---------------------------------------------------------------------------

const security: Journey = {
  slug: 'locking-the-front-door',
  title: 'Locking the front door',
  tagline: 'From passwords-everywhere to zero trust.',
  blurb:
    'Security patterns layer like armor, and each layer answers a specific attack. This journey hardens one API from the inside out: stateless tokens instead of passwords on every request, delegated access for third-party apps, one enforcement point at the edge, a firewall for the hostile internet — and finally, no implicit trust even inside your own network.',
  accent: '#fbbf24',
  nodes: [
    { id: 'client', label: 'Browser', kind: 'client', x: 6, y: 50, width: 96 },
    { id: 'app', label: '3rd-party App', kind: 'worker', x: 8, y: 88, width: 110 },
    { id: 'idp', label: 'Auth Server', kind: 'registry', x: 26, y: 12, width: 110 },
    { id: 'waf', label: 'WAF', kind: 'shield', x: 26, y: 50, width: 96 },
    { id: 'gw', label: 'API Gateway', kind: 'gateway', x: 46, y: 50, width: 110 },
    { id: 'api', label: 'Orders API', kind: 'server', x: 70, y: 26, width: 104 },
    { id: 'svc', label: 'Users API', kind: 'server', x: 70, y: 74, width: 104 },
  ],
  edges: [
    { id: 'e-client-idp', from: 'client', to: 'idp' },
    { id: 'e-client-api', from: 'client', to: 'api' },
    { id: 'e-app-idp', from: 'app', to: 'idp', curve: -0.15 },
    { id: 'e-app-api', from: 'app', to: 'api' },
    { id: 'e-client-gw', from: 'client', to: 'gw' },
    { id: 'e-app-gw', from: 'app', to: 'gw', curve: 0.25 },
    { id: 'e-client-waf', from: 'client', to: 'waf' },
    { id: 'e-waf-gw', from: 'waf', to: 'gw' },
    { id: 'e-gw-idp', from: 'gw', to: 'idp', dashed: true },
    { id: 'e-gw-api', from: 'gw', to: 'api' },
    { id: 'e-gw-svc', from: 'gw', to: 'svc' },
    { id: 'e-api-svc', from: 'api', to: 'svc' },
  ],
  stages: [
    {
      id: 'tokens',
      title: 'Prove who you are — once',
      wall: 'Every request carries the user’s password, and each server keeps session state — which breaks the moment you scale past one box.',
      fix: 'Sign in once against an auth server and receive a signed token. Every request carries the token instead; any server verifies the signature statelessly — no shared session store, and the password crosses the wire exactly once.',
      archSlugs: ['token-auth'],
      reveals: ['client', 'idp', 'api'],
      revealEdges: ['e-client-idp', 'e-client-api'],
      scene: {
        activeNodes: ['client', 'idp', 'api'],
        activeEdges: ['e-client-idp', 'e-client-api'],
        packets: [
          { from: 'client', to: 'idp', color: CLIENT, label: 'login' },
          { from: 'idp', to: 'client', color: OK, label: 'signed token', delay: 0.6 },
          { from: 'client', to: 'api', color: WARN, label: 'request + token', delay: 1.3 },
        ],
        annotations: ['stateless: any server can verify'],
      },
    },
    {
      id: 'delegation',
      title: 'Let apps in — without your password',
      wall: 'A budgeting app wants read access to your data. The naive answer — hand it your password — grants everything, forever, and revoking it means changing your password everywhere.',
      fix: 'OAuth issues the app its own scoped, revocable credential: you approve "read-only transactions" on the auth server, the app never sees your password, and you can cut its access any time without touching anything else.',
      archSlugs: ['oauth'],
      reveals: ['app'],
      revealEdges: ['e-app-idp', 'e-app-api'],
      scene: {
        activeNodes: ['app', 'idp'],
        activeEdges: ['e-app-idp', 'e-app-api'],
        packets: [
          { from: 'app', to: 'idp', color: CLIENT, label: 'consent flow' },
          { from: 'idp', to: 'app', color: OK, label: 'scoped token', delay: 0.7 },
          { from: 'app', to: 'api', color: WARN, label: 'read-only', delay: 1.4 },
        ],
        annotations: ['scoped · revocable · no password shared'],
      },
    },
    {
      id: 'one-door',
      title: 'Enforce it in one place',
      wall: 'Five services each reimplement token validation. Four do it correctly. The fifth is the breach — and you find out from the news.',
      fix: 'Route everything through an API gateway that validates tokens, checks scopes, and rate-limits before traffic reaches any service. Services behind it accept only gateway traffic, so enforcement has exactly one implementation to audit.',
      archSlugs: ['api-gateway'],
      reveals: ['gw', 'svc'],
      retireEdges: ['e-client-api', 'e-app-api'],
      revealEdges: ['e-client-gw', 'e-app-gw', 'e-gw-idp', 'e-gw-api', 'e-gw-svc'],
      scene: {
        activeNodes: ['client', 'gw', 'api'],
        activeEdges: ['e-client-gw', 'e-gw-api', 'e-gw-idp'],
        packets: [
          { from: 'client', to: 'gw', color: WARN, label: 'token' },
          { from: 'gw', to: 'idp', color: CLIENT, label: 'verify', delay: 0.5 },
          { from: 'gw', to: 'api', color: OK, label: 'authenticated', delay: 1.1 },
        ],
        annotations: ['one place to audit'],
      },
    },
    {
      id: 'shield',
      title: 'Filter the hostile internet',
      wall: 'The logs fill with /wp-admin probes, SQL injection attempts, and credential-stuffing storms — attacks that arrive before authentication even begins.',
      fix: 'A web application firewall inspects requests at the very edge: known attack signatures, malformed payloads, and abusive sources are dropped before they touch the gateway. Defense in depth starts in front of the front door.',
      archSlugs: ['waf'],
      reveals: ['waf'],
      retireEdges: ['e-client-gw'],
      revealEdges: ['e-client-waf', 'e-waf-gw'],
      scene: {
        activeNodes: ['client', 'waf', 'gw'],
        activeEdges: ['e-client-waf', 'e-waf-gw'],
        packets: [
          { from: 'client', to: 'waf', color: FAIL, label: "'; DROP TABLE —" },
          { from: 'client', to: 'waf', color: CLIENT, label: 'legit request', delay: 0.8 },
          { from: 'waf', to: 'gw', color: OK, label: 'passed', delay: 1.4 },
        ],
        annotations: ['blocked at the edge: SQLi, bots, stuffing'],
      },
    },
    {
      id: 'zero-trust',
      title: 'Trust nothing inside, either',
      wall: 'One leaked credential gives an attacker a foothold inside the perimeter — where service-to-service calls are unencrypted and unauthenticated. The hard shell has a soft center.',
      fix: 'Mutual TLS gives every service its own certificate and requires both sides of every internal call to prove their identity — encrypted, authenticated, hop by hop. The perimeter stops being the only line of defense: zero trust.',
      archSlugs: ['mtls'],
      reveals: [],
      revealEdges: ['e-api-svc'],
      scene: {
        activeNodes: ['gw', 'api', 'svc'],
        activeEdges: ['e-gw-api', 'e-gw-svc', 'e-api-svc'],
        packets: [
          { from: 'api', to: 'svc', color: WARN, label: 'cert ⇄ cert' },
          { from: 'svc', to: 'api', color: OK, label: 'verified both ways', delay: 0.8 },
        ],
        annotations: ['every hop: encrypt + verify'],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Journey 7 — The real-time web
// ---------------------------------------------------------------------------

const realtime: Journey = {
  slug: 'real-time-web',
  title: 'The real-time web',
  tagline: 'From polling to pushing to two million sockets.',
  blurb:
    'Chat, live dashboards, multiplayer cursors — anything that must arrive now breaks the request/response habit. This journey builds a chat system: replace polling with pushed messages, survive tens of thousands of held-open connections, route between users on different servers, and tame the celebrity-sized fan-out that melts naive broadcasts.',
  accent: '#22d3ee',
  nodes: [
    { id: 'ua', label: 'User A', kind: 'client', x: 6, y: 22, width: 96 },
    { id: 'ub', label: 'User B', kind: 'client', x: 6, y: 78, width: 96 },
    { id: 'rp', label: 'Reverse Proxy', kind: 'gateway', x: 28, y: 50, width: 116 },
    { id: 'ws1', label: 'Socket Srv A', kind: 'server', x: 52, y: 22, width: 110 },
    { id: 'ws2', label: 'Socket Srv B', kind: 'server', x: 52, y: 78, width: 110 },
    { id: 'bus', label: 'Pub/Sub Bus', kind: 'broker', x: 76, y: 50, width: 110 },
    { id: 'q', label: 'Fan-out Queue', kind: 'queue', x: 76, y: 12, width: 116 },
  ],
  edges: [
    { id: 'e-ua-ws1', from: 'ua', to: 'ws1' },
    { id: 'e-ua-rp', from: 'ua', to: 'rp' },
    { id: 'e-ub-rp', from: 'ub', to: 'rp' },
    { id: 'e-rp-ws1', from: 'rp', to: 'ws1' },
    { id: 'e-rp-ws2', from: 'rp', to: 'ws2' },
    { id: 'e-ws1-bus', from: 'ws1', to: 'bus' },
    { id: 'e-ws2-bus', from: 'ws2', to: 'bus' },
    { id: 'e-ws1-q', from: 'ws1', to: 'q' },
    { id: 'e-q-bus', from: 'q', to: 'bus' },
  ],
  stages: [
    {
      id: 'push',
      title: 'Stop asking, start listening',
      wall: 'The chat app polls every two seconds: "anything new?" — "no." Thousands of clients hammer the API for nothing, and messages still arrive up to two seconds late.',
      fix: 'A WebSocket upgrades the HTTP request into a persistent, two-way connection. The server pushes each message the instant it exists — no polling loop, no latency floor, and a fraction of the request load.',
      archSlugs: ['websockets'],
      reveals: ['ua', 'ws1'],
      revealEdges: ['e-ua-ws1'],
      scene: {
        activeNodes: ['ua', 'ws1'],
        activeEdges: ['e-ua-ws1'],
        packets: [
          { from: 'ua', to: 'ws1', color: CLIENT, label: 'upgrade ⇄ ws' },
          { from: 'ws1', to: 'ua', color: OK, label: 'pushed instantly', delay: 0.8 },
        ],
        annotations: ['one connection, both directions'],
      },
    },
    {
      id: 'connections',
      title: 'Ten thousand open connections',
      wall: 'Persistent connections change the rules: each one is held for hours, TLS handshakes are expensive, and redeploying the socket server drops everyone at once.',
      fix: 'A reverse proxy terminates TLS and holds the client connections, forwarding frames to socket servers behind it. Servers drain and redeploy while the proxy keeps clients connected — and connection load spreads across the pool.',
      archSlugs: ['reverse-proxy'],
      reveals: ['rp', 'ub', 'ws2'],
      retireEdges: ['e-ua-ws1'],
      revealEdges: ['e-ua-rp', 'e-ub-rp', 'e-rp-ws1', 'e-rp-ws2'],
      scene: {
        activeNodes: ['ua', 'ub', 'rp'],
        activeEdges: ['e-ua-rp', 'e-ub-rp', 'e-rp-ws1', 'e-rp-ws2'],
        packets: [
          { from: 'ua', to: 'rp', color: CLIENT, label: '10k conns' },
          { from: 'rp', to: 'ws1', color: CLIENT, delay: 0.5 },
          { from: 'ub', to: 'rp', color: CLIENT, delay: 0.8 },
          { from: 'rp', to: 'ws2', color: CLIENT, delay: 1.3 },
        ],
        annotations: ['TLS terminates here', 'drain servers, keep clients'],
      },
    },
    {
      id: 'backplane',
      title: 'Your friend is on another server',
      wall: 'User A’s socket lives on server A; user B’s lives on server B. A’s message reaches server A… and stops. Server A has no route to B’s socket.',
      fix: 'A pub/sub backplane connects the socket servers: each publishes every message to the bus and subscribes on behalf of its own connected users. Any-to-any delivery — no server ever needs to know where a socket lives.',
      archSlugs: ['pub-sub'],
      reveals: ['bus'],
      revealEdges: ['e-ws1-bus', 'e-ws2-bus'],
      scene: {
        activeNodes: ['ws1', 'ws2', 'bus'],
        activeEdges: ['e-ws1-bus', 'e-ws2-bus'],
        packets: [
          { from: 'ua', to: 'rp', color: CLIENT, label: 'hi B!' },
          { from: 'rp', to: 'ws1', color: CLIENT, delay: 0.4 },
          { from: 'ws1', to: 'bus', color: WARN, label: 'publish', delay: 0.9 },
          { from: 'bus', to: 'ws2', color: WARN, delay: 1.4 },
          { from: 'ws2', to: 'ub', color: OK, label: 'delivered', delay: 1.9 },
        ],
        annotations: ['servers subscribe for their users'],
      },
    },
    {
      id: 'firehose',
      title: 'When the room is on fire',
      wall: 'A celebrity joins: one message now fans out to two million sockets at once. Naive broadcast melts the socket servers and floods slow clients.',
      fix: 'Queue the fan-out: workers drain each broadcast at a controlled pace and coalesce bursts — "+3,041 reactions" instead of 3,041 messages. Per-connection rate limits keep one hot room from starving everyone else.',
      archSlugs: ['message-queue', 'rate-limiting'],
      reveals: ['q'],
      revealEdges: ['e-ws1-q', 'e-q-bus'],
      scene: {
        activeNodes: ['ws1', 'q', 'bus'],
        activeEdges: ['e-ws1-q', 'e-q-bus'],
        packets: [
          { from: 'ws1', to: 'q', color: WARN, label: 'broadcast job' },
          { from: 'q', to: 'bus', color: WARN, label: 'paced fan-out', delay: 0.8 },
          { from: 'bus', to: 'ws2', color: OK, label: '+3,041 ❤', delay: 1.4 },
        ],
        annotations: ['coalesce bursts', 'pace the flood'],
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Journey 8 — Agreeing when machines fail
// ---------------------------------------------------------------------------

const coordination: Journey = {
  slug: 'agreeing-when-machines-fail',
  title: 'Agreeing when machines fail',
  tagline: 'Leader election, quorums, and the split-brain problem.',
  blurb:
    'The deepest problems in distributed systems are about agreement: which machine is in charge, and what officially happened. This journey starts with a double-charged billing run, builds up to majority consensus — the machinery inside etcd, ZooKeeper, and every replicated database — and shows why the minority side of a network split must go quiet.',
  accent: '#fb923c',
  nodes: [
    { id: 'n1', label: 'Scheduler A', kind: 'server', x: 8, y: 18, width: 110 },
    { id: 'n2', label: 'Scheduler B', kind: 'server', x: 8, y: 50, width: 110 },
    { id: 'n3', label: 'Scheduler C', kind: 'server', x: 8, y: 82, width: 110 },
    { id: 'lock', label: 'Lock Service', kind: 'registry', x: 36, y: 50, width: 110 },
    { id: 'c1', label: 'Consensus A', kind: 'registry', x: 62, y: 18, width: 116 },
    { id: 'c2', label: 'Consensus B', kind: 'registry', x: 62, y: 50, width: 116 },
    { id: 'c3', label: 'Consensus C', kind: 'registry', x: 62, y: 82, width: 116 },
  ],
  edges: [
    { id: 'e-n1-lock', from: 'n1', to: 'lock' },
    { id: 'e-n2-lock', from: 'n2', to: 'lock' },
    { id: 'e-n3-lock', from: 'n3', to: 'lock' },
    { id: 'e-n1-c2', from: 'n1', to: 'c2' },
    { id: 'e-n2-c2', from: 'n2', to: 'c2' },
    { id: 'e-n3-c2', from: 'n3', to: 'c2' },
    { id: 'e-c1-c2', from: 'c1', to: 'c2' },
    { id: 'e-c2-c3', from: 'c2', to: 'c3' },
    { id: 'e-c1-c3', from: 'c1', to: 'c3', curve: 0.35, dashed: true },
  ],
  stages: [
    {
      id: 'two-leaders',
      title: 'Two schedulers, one job',
      wall: 'For high availability you run the billing scheduler on two machines. One night both decide they’re in charge — and every customer is charged twice.',
      fix: 'Leader election: the schedulers compete for a lease on a shared lock service. Exactly one wins and does the work; the others stand hot, watching. When the leader dies, its lease expires and a follower takes over within seconds — failover without double-fire.',
      archSlugs: ['leader-election'],
      reveals: ['n1', 'n2', 'n3', 'lock'],
      revealEdges: ['e-n1-lock', 'e-n2-lock', 'e-n3-lock'],
      scene: {
        activeNodes: ['n1', 'lock'],
        activeEdges: ['e-n1-lock', 'e-n2-lock'],
        packets: [
          { from: 'n1', to: 'lock', color: CLIENT, label: 'acquire lease' },
          { from: 'lock', to: 'n1', color: OK, label: 'granted ♛', delay: 0.6 },
          { from: 'n2', to: 'lock', color: FAIL, label: 'held — wait', delay: 1.1 },
        ],
        annotations: ['A leads · B, C stand by'],
      },
    },
    {
      id: 'quorum',
      title: 'Who guards the guard?',
      wall: 'The lock service is now the single point of failure — so it must be replicated too. But replicas can disagree: if both sides of a network hiccup grant the lease, you’re right back to two leaders.',
      fix: 'Quorum consensus: the lock service becomes a cluster of three that commits a decision only when a majority — two of three — agree on it. No majority, no decision; disagreement becomes impossible by construction. This is the heart of Raft, Paxos, etcd, and ZooKeeper.',
      archSlugs: ['quorum-consensus'],
      reveals: ['c1', 'c2', 'c3'],
      retireNodes: ['lock'],
      retireEdges: ['e-n1-lock', 'e-n2-lock', 'e-n3-lock'],
      revealEdges: ['e-n1-c2', 'e-n2-c2', 'e-n3-c2', 'e-c1-c2', 'e-c2-c3', 'e-c1-c3'],
      scene: {
        activeNodes: ['c1', 'c2', 'c3'],
        activeEdges: ['e-c1-c2', 'e-c2-c3'],
        packets: [
          { from: 'c2', to: 'c1', color: WARN, label: 'propose: A leads' },
          { from: 'c1', to: 'c2', color: OK, label: 'ack', delay: 0.7 },
          { from: 'c2', to: 'c3', color: OK, label: 'committed (2/3)', delay: 1.3 },
        ],
        annotations: ['majority = 2 of 3'],
      },
    },
    {
      id: 'partition',
      title: 'Surviving the split',
      wall: 'A switch dies and Consensus C is cut off from A and B. If C kept granting leases on its own, you’d have two leaders again. So what actually happens?',
      fix: 'The majority side — A and B — keeps deciding. C, unable to reach a quorum, refuses to decide anything and effectively goes read-only until the network heals. Losing availability on the minority side is the deliberate price of never losing correctness — the consistency-versus-availability trade-off you’ll meet everywhere.',
      archSlugs: [],
      scene: {
        activeNodes: ['c1', 'c2'],
        failedNodes: ['c3'],
        activeEdges: ['e-c1-c2'],
        packets: [
          { from: 'c1', to: 'c2', color: OK, label: 'still 2/3 — decide' },
          { from: 'c2', to: 'c3', color: FAIL, label: '✗ unreachable', delay: 0.8 },
        ],
        annotations: ['minority: stalls, stays safe'],
      },
    },
    {
      id: 'everywhere',
      title: 'You’ve been using this all along',
      wall: 'This machinery sounds exotic — three nodes voting about a crown. But you have been relying on it the whole time.',
      fix: 'Every replicated database elects its primary exactly this way; service registries and configuration stores are consensus clusters; sharded systems coordinate rebalancing through them. Consensus is the quiet foundation under half the patterns in this library — now you know what’s holding them up.',
      archSlugs: ['db-replication', 'service-discovery'],
      scene: {
        activeNodes: ['n1', 'n2', 'n3', 'c1', 'c2', 'c3'],
        packets: [
          { from: 'n1', to: 'c2', color: CLIENT, label: 'renew lease' },
          { from: 'c2', to: 'c1', color: WARN, delay: 0.5 },
          { from: 'c2', to: 'c3', color: WARN, delay: 0.7 },
          { from: 'c2', to: 'n1', color: OK, label: '♛ confirmed', delay: 1.3 },
        ],
        annotations: ['the quiet foundation'],
      },
    },
  ],
}

export const JOURNEYS: Journey[] = [
  scaling,
  resilience,
  shipping,
  dataEvents,
  decomposition,
  security,
  realtime,
  coordination,
]

export function getJourney(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}
