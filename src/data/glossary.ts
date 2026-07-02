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
  { slug: 'presigned-url', term: 'presigned URL', aliases: ['presigned URLs', 'presigned upload URL', 'presigned upload URLs'], short: 'A short-lived signed URL that lets a client upload to or download from storage directly.' },
  { slug: 'cap-theorem', term: 'CAP theorem', short: 'Under a network partition, a system must trade off between consistency and availability.' },

  // --- Extended vocabulary --------------------------------------------------
  { slug: 'availability', term: 'availability', aliases: ['available'], short: 'The proportion of time a system is operational and reachable.' },
  { slug: 'high-availability', term: 'high availability', aliases: ['highly available', 'HA'], short: 'Designing to minimize downtime, usually through redundancy and automatic failover.' },
  { slug: 'durability', term: 'durability', aliases: ['durable'], short: 'The guarantee that data, once committed, will not be lost.' },
  { slug: 'redundancy', term: 'redundancy', aliases: ['redundant'], short: 'Keeping spare copies or capacity so no single failure causes an outage.' },
  { slug: 'failover', term: 'failover', short: 'Automatically switching to a standby component when the active one fails.' },
  { slug: 'spof', term: 'single point of failure', aliases: ['SPOF'], short: 'A component whose failure alone takes down the entire system.' },
  { slug: 'fault-tolerance', term: 'fault tolerance', aliases: ['fault-tolerant', 'fault tolerant'], short: 'Continuing to operate correctly despite the failure of some components.' },
  { slug: 'graceful-degradation', term: 'graceful degradation', aliases: ['degraded'], short: 'Reducing functionality gracefully under stress instead of failing completely.' },
  { slug: 'scalability', term: 'scalability', aliases: ['scalable', 'scale'], short: 'The ability to handle growing load by adding resources.' },
  { slug: 'bottleneck', term: 'bottleneck', short: 'The component that limits a system’s overall throughput.' },
  { slug: 'cascading-failure', term: 'cascading failure', aliases: ['cascade', 'cascading'], short: 'A failure that spreads from one component to others until much of the system is down.' },
  { slug: 'blast-radius', term: 'blast radius', short: 'The extent of the damage when something fails.' },
  { slug: 'fallback', term: 'fallback', short: 'A degraded but useful response served when the primary path fails.' },
  { slug: 'retry', term: 'retry', aliases: ['retries', 'retrying'], short: 'Reattempting a failed operation, ideally with backoff and only for transient errors.' },
  { slug: 'timeout', term: 'timeout', aliases: ['deadline'], short: 'A limit on how long to wait for an operation before giving up.' },

  { slug: 'microservices', term: 'microservices', aliases: ['microservice'], short: 'An architecture of small, independently deployable services split by business capability.' },
  { slug: 'monolith', term: 'monolith', aliases: ['monolithic'], short: 'A single deployable unit containing all of an application’s functionality.' },
  { slug: 'service-mesh', term: 'service mesh', short: 'An infrastructure layer (often sidecars) that handles service-to-service networking, security, and observability.' },
  { slug: 'sidecar', term: 'sidecar', short: 'A helper container or process deployed alongside a service to add shared functionality.' },
  { slug: 'proxy', term: 'proxy', short: 'An intermediary that forwards requests on behalf of a client or a server.' },
  { slug: 'container', term: 'container', aliases: ['containers', 'containerized'], short: 'A lightweight, isolated, portable unit packaging an app with its dependencies.' },
  { slug: 'kubernetes', term: 'Kubernetes', aliases: ['k8s'], short: 'The dominant platform for deploying, scaling, and managing containers.' },
  { slug: 'session', term: 'session', aliases: ['sessions', 'sticky session', 'session affinity'], short: 'Server-side state tracking a user across multiple requests.' },

  { slug: 'primary', term: 'primary', aliases: ['leader'], short: 'The node that accepts writes in a replicated setup; replicas follow it (a.k.a. leader).' },
  { slug: 'follower', term: 'follower', short: 'A replica that continuously applies the primary’s changes and can serve reads.' },
  { slug: 'network-partition', term: 'network partition', aliases: ['partition', 'partitioned', 'partition tolerance'], short: 'A break in communication that splits a cluster into groups that can’t reach each other.' },
  { slug: 'transaction', term: 'transaction', aliases: ['transactional', 'transactions'], short: 'A group of operations that commit all-or-nothing.' },
  { slug: 'acid', term: 'ACID', short: 'Atomicity, Consistency, Isolation, Durability — the guarantees of a classic database transaction.' },
  { slug: 'snapshot', term: 'snapshot', aliases: ['snapshots'], short: 'A saved copy of state at a point in time, used to avoid replaying history from scratch.' },
  { slug: 'materialized-view', term: 'materialized view', short: 'A precomputed, stored query result that is kept up to date.' },
  { slug: 'hotspot', term: 'hotspot', aliases: ['hotspots'], short: 'An uneven concentration of load on one shard or node.' },
  { slug: 'write-ahead-log', term: 'write-ahead log', aliases: ['WAL', 'transaction log'], short: 'Appending changes to a durable log before applying them, so they survive a crash.' },

  { slug: 'message-queue', term: 'message queue', aliases: ['work queue', 'task queue'], short: 'A durable buffer that holds tasks for workers to process asynchronously.' },
  { slug: 'producer', term: 'producer', aliases: ['producers'], short: 'Something that puts messages or work onto a queue or topic.' },
  { slug: 'consumer', term: 'consumer', aliases: ['consumers', 'subscriber', 'subscribers'], short: 'Something that reads and processes messages from a queue or topic.' },
  { slug: 'worker', term: 'worker', aliases: ['workers'], short: 'A background process that pulls jobs from a queue and executes them.' },
  { slug: 'fan-out', term: 'fan-out', aliases: ['fan out', 'fans out'], short: 'Delivering one message to many recipients, or spreading work across many workers.' },

  { slug: 'rollback', term: 'rollback', aliases: ['roll back', 'rolled back'], short: 'Reverting to a previous known-good version or state.' },
  { slug: 'cutover', term: 'cutover', short: 'The moment traffic is switched from an old system or version to a new one.' },
  { slug: 'progressive-delivery', term: 'progressive delivery', short: 'Gradually rolling a change out to more traffic while watching metrics.' },
  { slug: 'ab-testing', term: 'A/B testing', aliases: ['A/B test'], short: 'Comparing variants by showing them to different cohorts and measuring outcomes.' },

  { slug: 'authentication', term: 'authentication', aliases: ['authenticate', 'authenticated'], short: 'Verifying who a caller is.' },
  { slug: 'authorization', term: 'authorization', aliases: ['authorize', 'authorized', 'scope', 'scoped'], short: 'Verifying what an authenticated caller is allowed to do.' },
  { slug: 'secret', term: 'secret', aliases: ['secrets', 'secrets management'], short: 'A credential — key, password, or token — that must be protected.' },
  { slug: 'certificate', term: 'certificate', aliases: ['certificates', 'certificate authority', 'CA'], short: 'A cryptographic document proving identity, issued by a certificate authority (CA).' },
  { slug: 'zero-trust', term: 'zero trust', short: 'Never trusting a request based on network location — every request is verified.' },
  { slug: 'access-token', term: 'access token', short: 'A short-lived credential that grants scoped access to an API.' },
  { slug: 'ddos', term: 'DDoS', aliases: ['denial of service'], short: 'Overwhelming a service with traffic so it can’t serve legitimate users.' },

  { slug: 'server-sent-events', term: 'Server-Sent Events', aliases: ['SSE'], short: 'A one-way, server-to-client stream of events over a single HTTP connection.' },
  { slug: 'long-polling', term: 'long polling', short: 'Holding a request open until the server has data, then reconnecting.' },
  { slug: 'slo', term: 'SLO', aliases: ['SLA', 'SLI', 'service level objective'], short: 'Service Level Objective — a target for a reliability metric, often backed by an SLA.' },
  { slug: 'percentile', term: 'percentile', aliases: ['p95', 'p99'], short: 'A value below which a given percentage of samples fall — e.g. p99 latency.' },
  { slug: 'cardinality', term: 'cardinality', short: 'The number of distinct values a metric label (or column) can take.' },
  { slug: 'correlation-id', term: 'correlation ID', aliases: ['request ID'], short: 'An ID attached to every log line and span of one request, to tie them together.' },
  { slug: 'virtual-node', term: 'virtual node', aliases: ['vnode', 'vnodes'], short: 'Placing each physical server at many points on a hash ring to spread load evenly.' },
  { slug: 'backward-compatibility', term: 'backward compatible', aliases: ['backward compatibility', 'backwards compatible'], short: 'A change that older clients or the previous version can still work with.' },
  { slug: 'database-per-service', term: 'database per service', aliases: ['own database'], short: 'Each microservice owns its private database; services never share tables.' },
  { slug: 'asynchronous', term: 'asynchronous', aliases: ['async', 'asynchronously'], short: 'Work done later, off the request path, rather than blocking the caller.' },
]

export const GLOSSARY_BY_SLUG: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY.map((t) => [t.slug, t]),
)

export function findTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_BY_SLUG[slug]
}
