// The vocabulary of systems design. This single list is the source of truth for
// both the /glossary page and the build-time auto-linker (see vite.config.ts),
// which turns the first mention of each term in the MDX prose into a link.
//
// Keep it dependency-free (no imports) so it's safe to import from the Vite config.

export interface GlossaryTerm {
  slug: string
  /** Canonical display term. */
  term: string
  /** Extra surface forms to also auto-link (case-insensitive, whole-word). */
  aliases?: string[]
  /** One-sentence definition, shown on hover and in the glossary. */
  short: string
}

export const GLOSSARY: GlossaryTerm[] = [
  { slug: 'latency', term: 'latency', short: 'The time it takes to complete a single request or operation.' },
  { slug: 'throughput', term: 'throughput', short: 'The amount of work a system handles per unit of time (e.g. requests/sec).' },
  {
    slug: 'horizontal-scaling',
    term: 'horizontal scaling',
    aliases: ['scale out', 'scale horizontally', 'scales horizontally'],
    short: 'Adding more machines to share load, rather than making one machine bigger.',
  },
  { slug: 'vertical-scaling', term: 'vertical scaling', aliases: ['scale up'], short: 'Handling more load by using a bigger, more powerful single machine.' },
  { slug: 'stateless', term: 'stateless', short: 'A server that keeps no per-client state between requests, so any instance can handle any request.' },
  { slug: 'load-balancer', term: 'load balancer', aliases: ['load balancing', 'load-balances', 'load-balance'], short: 'A component that spreads incoming requests across a pool of identical servers.' },
  { slug: 'reverse-proxy', term: 'reverse proxy', short: 'A server-side front door that terminates TLS, routes, and forwards requests to backends.' },
  { slug: 'cdn', term: 'CDN', aliases: ['content delivery network'], short: 'A network of edge caches that serve content from locations close to users.' },
  { slug: 'edge', term: 'edge', aliases: ['point of presence', 'points of presence', 'PoP'], short: 'A location physically close to users where content is cached or served.' },
  { slug: 'origin', term: 'origin', short: 'The authoritative source server a cache or CDN falls back to on a miss.' },
  { slug: 'cache-aside', term: 'cache-aside', short: 'A pattern where the app checks the cache first and, on a miss, reads the database and populates the cache.' },
  { slug: 'cache-hit', term: 'cache hit', aliases: ['cache miss', 'cache MISS', 'cache HIT'], short: 'Whether requested data was found in the cache (hit) or not (miss).' },
  { slug: 'ttl', term: 'TTL', aliases: ['time to live'], short: 'Time to live — how long a cached value or DNS record stays valid before it must be refreshed.' },
  { slug: 'invalidation', term: 'invalidation', aliases: ['cache invalidation', 'invalidate'], short: 'Removing or updating a stale cache entry so the next read fetches fresh data.' },
  { slug: 'thundering-herd', term: 'thundering herd', short: 'A surge of clients hitting an origin at once — e.g. after a cache expires or during synchronized retries.' },
  { slug: 'eventual-consistency', term: 'eventual consistency', aliases: ['eventually consistent'], short: 'Replicas may briefly disagree after a write, but converge to the same value given time.' },
  { slug: 'strong-consistency', term: 'strong consistency', short: 'Every read is guaranteed to see the most recent committed write.' },
  { slug: 'replication', term: 'replication', aliases: ['replica', 'replicas', 'replicate'], short: 'Keeping copies of data on multiple nodes for read scaling and redundancy.' },
  { slug: 'replication-lag', term: 'replication lag', short: 'The delay before a replica reflects a write committed on the primary.' },
  { slug: 'quorum', term: 'quorum', short: 'A minimum number of nodes (usually a majority) that must agree for an operation to proceed.' },
  { slug: 'sharding', term: 'sharding', aliases: ['shard', 'shards', 'partitioning', 'horizontal partitioning'], short: 'Splitting data across independent databases so each holds only a slice.' },
  { slug: 'shard-key', term: 'shard key', short: 'The key (e.g. user_id) that determines which shard a row lives on.' },
  { slug: 'consistent-hashing', term: 'consistent hashing', short: 'A key→node mapping where adding or removing a node moves only a small fraction of keys.' },
  { slug: 'connection-pool', term: 'connection pool', aliases: ['connection pooling'], short: 'A reusable set of warm, open database connections shared across requests.' },
  { slug: 'idempotent', term: 'idempotent', aliases: ['idempotency', 'idempotency key', 'idempotency keys'], short: 'An operation that has the same effect whether performed once or many times.' },
  { slug: 'at-least-once', term: 'at-least-once', short: 'A delivery guarantee where a message arrives one or more times, so consumers must dedupe.' },
  { slug: 'exactly-once', term: 'exactly-once', aliases: ['effectively-once'], short: 'The effect of processing a message precisely once, usually achieved with idempotency.' },
  { slug: 'dead-letter-queue', term: 'dead-letter queue', aliases: ['dead letter queue'], short: 'A holding queue for messages that repeatedly fail processing, for later inspection.' },
  { slug: 'backpressure', term: 'backpressure', short: 'A signal that tells a fast producer to slow down when a consumer or buffer is overwhelmed.' },
  { slug: 'broker', term: 'message broker', aliases: ['broker'], short: 'Infrastructure that routes messages between producers and consumers.' },
  { slug: 'pub-sub', term: 'publish/subscribe', aliases: ['pub/sub', 'pub-sub'], short: 'A messaging style where a publisher sends to a topic and every subscriber gets a copy.' },
  { slug: 'topic', term: 'topic', short: 'A named channel that publishers send events to and subscribers listen on.' },
  { slug: 'saga', term: 'saga', short: 'A multi-service workflow of local transactions with compensating undo steps.' },
  { slug: 'compensating-transaction', term: 'compensating transaction', aliases: ['compensating transactions', 'compensation'], short: 'An explicit undo action that reverses a completed step when a later step fails.' },
  { slug: 'cqrs', term: 'CQRS', short: 'Command Query Responsibility Segregation — separate models for writes and reads.' },
  { slug: 'event-sourcing', term: 'event sourcing', short: 'Storing the full sequence of change events as the source of truth, deriving state by replay.' },
  { slug: 'projection', term: 'projection', aliases: ['read model', 'read-model'], short: 'A queryable view derived from a stream of events or a write model.' },
  { slug: 'cdc', term: 'change data capture', aliases: ['CDC'], short: 'Streaming a database’s changes out by tailing its transaction log.' },
  { slug: 'outbox', term: 'outbox', short: 'A table written in the same transaction as a change, then relayed to a broker for reliable events.' },
  { slug: 'two-phase-commit', term: 'two-phase commit', aliases: ['2PC'], short: 'A protocol where a coordinator drives participants through prepare then commit to commit atomically.' },
  { slug: 'circuit-breaker', term: 'circuit breaker', short: 'A wrapper that stops calling a failing dependency and fails fast to prevent cascading failure.' },
  { slug: 'bulkhead', term: 'bulkhead', short: 'Isolating resource pools so one flooded dependency can’t consume all capacity.' },
  { slug: 'exponential-backoff', term: 'exponential backoff', aliases: ['backoff'], short: 'Waiting progressively longer between retries to give a dependency room to recover.' },
  { slug: 'jitter', term: 'jitter', short: 'Randomness added to retry delays so many clients don’t retry in synchronized waves.' },
  { slug: 'rate-limiting', term: 'rate limiting', aliases: ['rate limit', 'rate-limit'], short: 'Capping how many requests a client may make in a window to protect a service.' },
  { slug: 'token-bucket', term: 'token bucket', short: 'A rate-limit algorithm: a refilling bucket of tokens, one spent per request.' },
  { slug: 'api-gateway', term: 'API gateway', short: 'A single entry point that authenticates, routes, and aggregates across services.' },
  { slug: 'bff', term: 'backend for frontend', aliases: ['BFF'], short: 'A dedicated backend per client type that tailors responses to that client.' },
  { slug: 'service-discovery', term: 'service discovery', short: 'Finding healthy service instances by name as they scale, move, and fail.' },
  { slug: 'leader-election', term: 'leader election', short: 'A cluster agreeing on a single leader, and choosing a new one when it fails.' },
  { slug: 'consensus', term: 'consensus', short: 'A protocol (e.g. Raft, Paxos) by which distributed nodes agree on a value despite failures.' },
  { slug: 'split-brain', term: 'split-brain', short: 'A failure where two nodes both believe they are the leader, risking divergence.' },
  { slug: 'health-check', term: 'health check', aliases: ['liveness', 'readiness'], short: 'An endpoint that reports whether an instance is alive (liveness) and ready to serve (readiness).' },
  { slug: 'autoscaling', term: 'autoscaling', short: 'Automatically adding or removing instances to match current demand.' },
  { slug: 'blue-green', term: 'blue-green', short: 'Deploying by flipping traffic between two identical environments for instant cutover and rollback.' },
  { slug: 'canary', term: 'canary', short: 'Releasing a new version to a small slice of traffic first, then ramping up if healthy.' },
  { slug: 'feature-flag', term: 'feature flag', aliases: ['feature flags', 'feature toggle'], short: 'A runtime switch that decouples deploying code from releasing a feature.' },
  { slug: 'dns', term: 'DNS', short: 'The Domain Name System — the global lookup that translates names to IP addresses.' },
  { slug: 'anycast', term: 'Anycast', short: 'Advertising one IP from many locations so the network routes each user to the nearest instance.' },
  { slug: 'tls', term: 'TLS', aliases: ['TLS termination'], short: 'Transport Layer Security — encryption for data in transit; authenticates the server to the client.' },
  { slug: 'mtls', term: 'mutual TLS', aliases: ['mTLS'], short: 'TLS where both sides present certificates, so each proves its identity to the other.' },
  { slug: 'jwt', term: 'JWT', short: 'A signed JSON token carrying claims that any service can verify without a database lookup.' },
  { slug: 'oauth', term: 'OAuth', short: 'A protocol for delegated authorization — granting scoped access without sharing a password.' },
  { slug: 'distributed-tracing', term: 'distributed tracing', aliases: ['trace', 'span', 'spans'], short: 'Following one request across every service via a shared trace ID broken into timed spans.' },
  { slug: 'presigned-url', term: 'presigned URL', aliases: ['presigned URLs'], short: 'A short-lived signed URL that lets a client upload to or download from storage directly.' },
  { slug: 'cap-theorem', term: 'CAP theorem', short: 'Under a network partition, a system must trade off between consistency and availability.' },
]

export const GLOSSARY_BY_SLUG: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY.map((t) => [t.slug, t]),
)

export function findTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_BY_SLUG[slug]
}
