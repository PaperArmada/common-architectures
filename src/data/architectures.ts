import type { Architecture } from '../types'
import { loadBalancer } from '../architectures/loadBalancer'
import { cdn } from '../architectures/cdn'
import { apiGateway } from '../architectures/apiGateway'
import { caching } from '../architectures/caching'
import { dbReplication } from '../architectures/dbReplication'
import { sharding } from '../architectures/sharding'
import { connectionPooling } from '../architectures/connectionPooling'
import { cqrs } from '../architectures/cqrs'

export const ARCHITECTURES: Architecture[] = [
  // Core web infrastructure
  loadBalancer,
  cdn,
  apiGateway,
  caching,
  // Data & scaling
  dbReplication,
  connectionPooling,
  sharding,
  cqrs,
]

export function getArchitecture(slug: string): Architecture | undefined {
  return ARCHITECTURES.find((a) => a.slug === slug)
}

export function architecturesByCategory(category: string): Architecture[] {
  return ARCHITECTURES.filter((a) => a.category === category)
}
