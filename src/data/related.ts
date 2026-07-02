// Curated "related patterns" per architecture — the connective tissue that
// turns 45 standalone walkthroughs into a web you can wander. Hand-picked for
// pedagogical adjacency (complements, contrasts, prerequisites), not just
// category membership. Order matters: most illuminating neighbor first.

export const RELATED: Record<string, string[]> = {
  // Core web infrastructure
  dns: ['cdn', 'load-balancer', 'health-checks'],
  'load-balancer': ['reverse-proxy', 'health-checks', 'autoscaling', 'consistent-hashing'],
  'reverse-proxy': ['load-balancer', 'api-gateway', 'waf'],
  cdn: ['object-storage', 'caching', 'dns'],
  'api-gateway': ['bff', 'reverse-proxy', 'rate-limiting', 'microservices'],
  caching: ['cdn', 'consistent-hashing', 'db-replication'],
  websockets: ['pub-sub', 'message-queue', 'load-balancer'],
  'object-storage': ['cdn', 'waf'],
  bff: ['api-gateway', 'microservices'],
  // Data & scaling
  'db-replication': ['sharding', 'leader-election', 'quorum-consensus', 'connection-pooling'],
  'connection-pooling': ['db-replication', 'bulkhead'],
  sharding: ['consistent-hashing', 'db-replication', 'quorum-consensus'],
  cqrs: ['event-sourcing', 'outbox', 'event-driven'],
  'event-sourcing': ['cqrs', 'stream-processing', 'outbox'],
  'quorum-consensus': ['leader-election', 'db-replication', 'two-phase-commit'],
  'two-phase-commit': ['saga', 'outbox', 'quorum-consensus'],
  // Async & messaging
  'message-queue': ['pub-sub', 'idempotency', 'autoscaling'],
  'pub-sub': ['message-queue', 'event-driven', 'stream-processing'],
  'event-driven': ['pub-sub', 'saga', 'outbox', 'cqrs'],
  'stream-processing': ['event-sourcing', 'pub-sub', 'metrics'],
  outbox: ['saga', 'event-driven', 'idempotency', 'cqrs'],
  saga: ['outbox', 'two-phase-commit', 'event-driven', 'idempotency'],
  // Distributed patterns
  microservices: ['api-gateway', 'service-discovery', 'saga', 'strangler-fig'],
  'service-discovery': ['microservices', 'health-checks', 'load-balancer'],
  'circuit-breaker': ['retry', 'bulkhead', 'health-checks'],
  'rate-limiting': ['waf', 'api-gateway', 'retry'],
  retry: ['circuit-breaker', 'idempotency', 'bulkhead'],
  bulkhead: ['circuit-breaker', 'retry', 'connection-pooling'],
  idempotency: ['retry', 'message-queue', 'outbox'],
  'consistent-hashing': ['sharding', 'caching', 'load-balancer'],
  'leader-election': ['quorum-consensus', 'db-replication', 'service-discovery'],
  // Deployment & delivery
  'rolling-deploy': ['blue-green', 'canary', 'health-checks'],
  'blue-green': ['canary', 'rolling-deploy', 'feature-flags'],
  canary: ['feature-flags', 'blue-green', 'metrics'],
  'feature-flags': ['canary', 'blue-green', 'strangler-fig'],
  'strangler-fig': ['microservices', 'reverse-proxy', 'feature-flags'],
  autoscaling: ['load-balancer', 'health-checks', 'metrics'],
  // Observability
  'health-checks': ['load-balancer', 'service-discovery', 'rolling-deploy', 'circuit-breaker'],
  metrics: ['logging', 'tracing', 'canary', 'autoscaling'],
  logging: ['metrics', 'tracing'],
  tracing: ['logging', 'metrics', 'microservices'],
  // Security & auth
  waf: ['rate-limiting', 'reverse-proxy', 'cdn'],
  'token-auth': ['oauth', 'api-gateway', 'mtls'],
  oauth: ['token-auth', 'api-gateway'],
  mtls: ['token-auth', 'microservices', 'service-discovery'],
}
