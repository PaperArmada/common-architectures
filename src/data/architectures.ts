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

export const ARCHITECTURES: Architecture[] = [
  // Core web infrastructure
  loadBalancer,
  reverseProxy,
  cdn,
  apiGateway,
  caching,
  websockets,
  // Data & scaling
  dbReplication,
  connectionPooling,
  sharding,
  cqrs,
  // Async & messaging
  messageQueue,
  pubSub,
  eventDriven,
  streamProcessing,
  saga,
  // Distributed patterns
  microservices,
  serviceDiscovery,
  circuitBreaker,
  rateLimiting,
  consistentHashing,
  leaderElection,
  // Deployment & delivery
  rollingDeploy,
  blueGreen,
  canary,
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
