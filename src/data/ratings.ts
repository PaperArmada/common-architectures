// A single, reviewable source of truth for how each architecture is rated —
// across several *lenses*, because "difficulty" means different things:
//   • conceptual  — how hard the idea is to understand
//   • operational — how hard it is to run, tune, and keep alive in production
//   • prevalence  — how often you'll actually meet it in real systems
// The reader picks a lens; the dots + legend recolor to match.

export type Lens = 'conceptual' | 'operational' | 'prevalence'

/** Ordinal 0 → 1 → 2 (gentle/rare → demanding/common). Meaning is per-lens. */
export type Tier = 0 | 1 | 2

export interface LensMeta {
  id: Lens
  /** Short label for the segmented control. */
  label: string
  /** Title shown above the legend when this lens is active. */
  legendTitle: string
  /** Tooltip explaining the lens. */
  blurb: string
  /** Labels for tiers 0, 1, 2. */
  tiers: [string, string, string]
}

export const LENSES: LensMeta[] = [
  {
    id: 'conceptual',
    label: 'Concept',
    legendTitle: 'Conceptual difficulty',
    blurb: 'How hard the idea is to understand, cold.',
    tiers: ['Intro', 'Core', 'Advanced'],
  },
  {
    id: 'operational',
    label: 'Ops',
    legendTitle: 'Operational burden',
    blurb: 'How hard it is to run, tune, and keep alive in production.',
    tiers: ['Light', 'Moderate', 'Heavy'],
  },
  {
    id: 'prevalence',
    label: 'Prevalence',
    legendTitle: 'How common it is',
    blurb: "How often you'll actually meet it in real systems.",
    tiers: ['Niche', 'Common', 'Ubiquitous'],
  },
]

export const LENS_BY_ID: Record<Lens, LensMeta> = Object.fromEntries(
  LENSES.map((l) => [l.id, l]),
) as Record<Lens, LensMeta>

/**
 * Colors run from the "approachable/foundational" end (green) to the
 * "demanding/edge" end (pink), indexed by severity — NOT raw tier.
 */
export const SEVERITY_COLOR: [string, string, string] = ['#34d399', '#818cf8', '#f472b6']

/** @deprecated use severity()/tierColor(). Kept for any direct tier indexing. */
export const TIER_COLOR = SEVERITY_COLOR

/**
 * Map a tier to its "severity" (0 = approachable, 2 = edge) for the given lens.
 * For difficulty lenses severity == tier. For prevalence it inverts, so that
 * Ubiquitous is the green/foundational end and Niche is the pink/edge end.
 */
export function severity(lens: Lens, tier: Tier): Tier {
  return (lens === 'prevalence' ? 2 - tier : tier) as Tier
}

/** Color for a tier under a lens (green = approachable end, pink = edge). */
export function tierColor(lens: Lens, tier: Tier): string {
  return SEVERITY_COLOR[severity(lens, tier)]
}

/**
 * Ratings per architecture. Conceptual mirrors each architecture's `level`;
 * operational and prevalence are separate judgments (see the notes per row).
 */
export const RATINGS: Record<string, Record<Lens, Tier>> = {
  // Core web infrastructure
  'load-balancer': { conceptual: 0, operational: 1, prevalence: 2 },
  cdn: { conceptual: 0, operational: 1, prevalence: 2 },
  'api-gateway': { conceptual: 1, operational: 1, prevalence: 1 },
  caching: { conceptual: 1, operational: 2, prevalence: 2 }, // invalidation/stampedes = heavy ops
  // Data & scaling
  'db-replication': { conceptual: 1, operational: 2, prevalence: 2 }, // failover, lag monitoring
  'connection-pooling': { conceptual: 1, operational: 0, prevalence: 2 }, // mostly set-and-forget
  sharding: { conceptual: 2, operational: 2, prevalence: 0 }, // only at real scale
  cqrs: { conceptual: 2, operational: 2, prevalence: 0 },
  // Async & messaging
  'message-queue': { conceptual: 0, operational: 1, prevalence: 2 },
  'pub-sub': { conceptual: 1, operational: 1, prevalence: 1 },
  'event-driven': { conceptual: 2, operational: 2, prevalence: 1 }, // hard to trace
  'stream-processing': { conceptual: 2, operational: 2, prevalence: 0 }, // specialized data infra, not most apps
  // Distributed patterns
  // Advanced to understand: it composes gateway, discovery, per-service data, and network-failure reasoning.
  microservices: { conceptual: 2, operational: 2, prevalence: 1 },
  'circuit-breaker': { conceptual: 1, operational: 1, prevalence: 1 },
  'rate-limiting': { conceptual: 1, operational: 1, prevalence: 1 },
  'leader-election': { conceptual: 2, operational: 2, prevalence: 0 }, // usually inside infra you use
  // Gap-fillers
  'reverse-proxy': { conceptual: 0, operational: 1, prevalence: 2 },
  // Heavy ops: long-lived stateful connections, sticky-aware routing, shared pub/sub to broadcast across nodes.
  websockets: { conceptual: 1, operational: 2, prevalence: 1 },
  // Niche in practice: usually embedded inside a cache/DB/LB rather than something you apply directly.
  'consistent-hashing': { conceptual: 2, operational: 1, prevalence: 0 },
  'service-discovery': { conceptual: 1, operational: 1, prevalence: 1 },
  saga: { conceptual: 2, operational: 2, prevalence: 0 },
  // Deployment & delivery
  'blue-green': { conceptual: 0, operational: 1, prevalence: 1 },
  canary: { conceptual: 1, operational: 2, prevalence: 1 }, // needs metrics + automation
  'rolling-deploy': { conceptual: 0, operational: 1, prevalence: 2 }, // k8s default
  autoscaling: { conceptual: 1, operational: 1, prevalence: 1 },
  // Observability
  metrics: { conceptual: 0, operational: 1, prevalence: 2 },
  logging: { conceptual: 0, operational: 1, prevalence: 2 },
  tracing: { conceptual: 1, operational: 2, prevalence: 1 }, // instrumentation cost
  'health-checks': { conceptual: 0, operational: 0, prevalence: 2 },
  // Security & auth
  'token-auth': { conceptual: 1, operational: 1, prevalence: 2 },
  oauth: { conceptual: 2, operational: 1, prevalence: 1 }, // intricate protocol
  mtls: { conceptual: 1, operational: 2, prevalence: 0 }, // cert lifecycle
  waf: { conceptual: 0, operational: 1, prevalence: 1 },
  // Resilience
  retry: { conceptual: 1, operational: 1, prevalence: 2 }, // jitter/retry-storm nuance; every client retries
  bulkhead: { conceptual: 1, operational: 1, prevalence: 1 },
  idempotency: { conceptual: 1, operational: 1, prevalence: 1 }, // subtle but core
  // Data & consistency backbone
  'event-sourcing': { conceptual: 2, operational: 2, prevalence: 0 },
  'quorum-consensus': { conceptual: 2, operational: 1, prevalence: 0 }, // Dynamo/Cassandra
  'two-phase-commit': { conceptual: 2, operational: 2, prevalence: 0 }, // blocking, niche/legacy
  outbox: { conceptual: 1, operational: 1, prevalence: 1 },
  // Edge & entry
  dns: { conceptual: 1, operational: 1, prevalence: 2 }, // every request; anycast is the harder part
  'object-storage': { conceptual: 0, operational: 1, prevalence: 2 },
  bff: { conceptual: 1, operational: 1, prevalence: 1 },
  // Delivery & migration
  'feature-flags': { conceptual: 1, operational: 1, prevalence: 1 },
  'strangler-fig': { conceptual: 1, operational: 2, prevalence: 1 }, // two systems in parallel
}

export function tierFor(slug: string, lens: Lens): Tier {
  return RATINGS[slug]?.[lens] ?? 1
}
