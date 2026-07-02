import type { Architecture } from '../types'
import { loadBalancer } from '../architectures/loadBalancer'
import { dbReplication } from '../architectures/dbReplication'

export const ARCHITECTURES: Architecture[] = [loadBalancer, dbReplication]

export function getArchitecture(slug: string): Architecture | undefined {
  return ARCHITECTURES.find((a) => a.slug === slug)
}

export function architecturesByCategory(category: string): Architecture[] {
  return ARCHITECTURES.filter((a) => a.category === category)
}
