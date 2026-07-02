import type { Architecture } from '../types'
import { loadBalancer } from '../architectures/loadBalancer'
import { cdn } from '../architectures/cdn'
import { apiGateway } from '../architectures/apiGateway'
import { caching } from '../architectures/caching'
import { reverseProxy } from '../architectures/reverseProxy'
import { websockets } from '../architectures/websockets'
import { dbReplication } from '../architectures/dbReplication'
import { sharding } from '../architectures/sharding'
import { connectionPooling } from '../architectures/connectionPooling'
import { cqrs } from '../architectures/cqrs'
import { messageQueue } from '../architectures/messageQueue'
import { pubSub } from '../architectures/pubSub'
import { eventDriven } from '../architectures/eventDriven'
import { streamProcessing } from '../architectures/streamProcessing'
import { saga } from '../architectures/saga'
import { microservices } from '../architectures/microservices'
import { circuitBreaker } from '../architectures/circuitBreaker'
import { rateLimiting } from '../architectures/rateLimiting'
import { leaderElection } from '../architectures/leaderElection'
import { consistentHashing } from '../architectures/consistentHashing'
import { serviceDiscovery } from '../architectures/serviceDiscovery'
import { blueGreen } from '../architectures/blueGreen'
import { canary } from '../architectures/canary'
import { rollingDeploy } from '../architectures/rollingDeploy'
import { autoscaling } from '../architectures/autoscaling'
import { metrics } from '../architectures/metrics'
import { logging } from '../architectures/logging'
import { tracing } from '../architectures/tracing'
import { healthChecks } from '../architectures/healthChecks'
import { tokenAuth } from '../architectures/tokenAuth'
import { oauth } from '../architectures/oauth'
import { mtls } from '../architectures/mtls'
import { waf } from '../architectures/waf'
import { retry } from '../architectures/retry'
import { bulkhead } from '../architectures/bulkhead'
import { idempotency } from '../architectures/idempotency'
import { eventSourcing } from '../architectures/eventSourcing'
import { quorumConsensus } from '../architectures/quorumConsensus'
import { twoPhaseCommit } from '../architectures/twoPhaseCommit'
import { outbox } from '../architectures/outbox'
import { dns } from '../architectures/dns'
import { objectStorage } from '../architectures/objectStorage'
import { bff } from '../architectures/bff'
import { featureFlags } from '../architectures/featureFlags'
import { stranglerFig } from '../architectures/stranglerFig'

export const ARCHITECTURES: Architecture[] = [
  // Core web infrastructure
  dns,
  loadBalancer,
  reverseProxy,
  cdn,
  apiGateway,
  caching,
  websockets,
  objectStorage,
  bff,
  // Data & scaling
  dbReplication,
  connectionPooling,
  sharding,
  cqrs,
  eventSourcing,
  quorumConsensus,
  twoPhaseCommit,
  // Async & messaging
  messageQueue,
  pubSub,
  eventDriven,
  streamProcessing,
  outbox,
  saga,
  // Distributed patterns
  microservices,
  serviceDiscovery,
  circuitBreaker,
  rateLimiting,
  retry,
  bulkhead,
  idempotency,
  consistentHashing,
  leaderElection,
  // Deployment & delivery
  rollingDeploy,
  blueGreen,
  canary,
  featureFlags,
  stranglerFig,
  autoscaling,
  // Observability
  healthChecks,
  metrics,
  logging,
  tracing,
  // Security & auth
  waf,
  tokenAuth,
  oauth,
  mtls,
]

export function getArchitecture(slug: string): Architecture | undefined {
  return ARCHITECTURES.find((a) => a.slug === slug)
}

export function architecturesByCategory(category: string): Architecture[] {
  return ARCHITECTURES.filter((a) => a.category === category)
}
