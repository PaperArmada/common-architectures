import type { ComponentType } from 'react'

/** Visual family of a node — drives color, icon, and shape. */
export type NodeKind =
  | 'client'
  | 'lb'
  | 'gateway'
  | 'server'
  | 'cache'
  | 'db'
  | 'db-primary'
  | 'db-replica'
  | 'cdn'
  | 'queue'
  | 'storage'
  | 'broker'
  | 'worker'

export interface DiagramNode {
  id: string
  label: string
  sublabel?: string
  kind: NodeKind
  /** Position as a percentage of the canvas (0–100), so the diagram scales fluidly. */
  x: number
  y: number
  /** Optional fixed width in px; otherwise derived from the label. */
  width?: number
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  /** Draw a subtle dashed line (e.g. async replication, background flow). */
  dashed?: boolean
  /** Curve the edge; positive bows one way, negative the other. */
  curve?: number
}

/** A single animated message travelling along an edge during a step. */
export interface PacketSpec {
  from: string
  to: string
  /** CSS color; defaults to the step/accent color. */
  color?: string
  label?: string
  /** Delay (seconds) before this packet launches within the step. */
  delay?: number
}

export interface Step {
  id: string
  title: string
  /** One or two sentences shown in the narration panel. */
  description: string
  /** Nodes to spotlight this step. */
  activeNodes?: string[]
  /** Nodes rendered as failed/offline this step. */
  failedNodes?: string[]
  /** Edges to emphasize this step. */
  activeEdges?: string[]
  /** Packets that fire when the step becomes active. */
  packets?: PacketSpec[]
  /** Short callout badges pinned near the diagram. */
  annotations?: string[]
}

export type Category = 'core-web' | 'data-scaling' | 'async' | 'distributed'

export interface Architecture {
  slug: string
  title: string
  category: Category
  tagline: string
  /** Rough difficulty for ordering/labeling. */
  level: 'intro' | 'core' | 'advanced'
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  steps: Step[]
  /** MDX component with the long-form prose (owned in src/content/*.mdx). */
  content: ComponentType<Record<string, unknown>>
}

export interface CategoryMeta {
  id: Category
  label: string
  blurb: string
}
