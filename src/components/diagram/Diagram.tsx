import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import type { DiagramEdge, DiagramNode, Step } from '../../types'
import { useSize } from '../../hooks/useSize'
import { NODE_STYLES, NodeIcon } from './nodeStyles'

interface DiagramProps {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  step: Step
  /** Increments whenever the step changes, to force packet replay. */
  stepKey: number
  accent: string
}

const PACKET_DURATION = 1.15

export function Diagram({ nodes, edges, step, stepKey, accent }: DiagramProps) {
  const { ref, size } = useSize<HTMLDivElement>()
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const activeNodes = new Set(step.activeNodes ?? [])
  const failedNodes = new Set(step.failedNodes ?? [])
  const activeEdges = new Set(step.activeEdges ?? [])

  // On narrow canvases (phones), shrink nodes so columns don't overlap or overflow.
  const compact = size.width > 0 && size.width < 480
  const nodeWidth = (n: DiagramNode) =>
    compact ? Math.max(70, Math.round(size.width * 0.24)) : (n.width ?? 128)
  const nodeHalfH = compact ? 30 : 40

  // Node center in px, clamped so the whole node stays inside the canvas
  // (edge nodes near 0%/100% would otherwise clip on small screens).
  const centerNode = (n: DiagramNode) => {
    const halfW = nodeWidth(n) / 2 + 4
    const x = Math.min(Math.max((n.x / 100) * size.width, halfW), size.width - halfW)
    const y = Math.min(Math.max((n.y / 100) * size.height, nodeHalfH + 4), size.height - nodeHalfH - 4)
    return { x, y }
  }
  const center = (id: string) => {
    const n = byId.get(id)
    if (!n) return { x: 0, y: 0 }
    return centerNode(n)
  }

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-[radial-gradient(900px_500px_at_50%_-20%,rgba(129,140,248,0.06),transparent_60%)]"
    >
      {/* faint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* edges */}
      {size.width > 0 && (
        <svg className="absolute inset-0 h-full w-full" width={size.width} height={size.height}>
          {edges.map((e) => {
            const a = center(e.from)
            const b = center(e.to)
            const on = activeEdges.has(e.id)
            const path = edgePath(a, b, e.curve ?? 0)
            return (
              <g key={e.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={on ? accent : 'var(--color-border-strong)'}
                  strokeWidth={on ? 2 : 1.4}
                  strokeDasharray={e.dashed ? '5 6' : undefined}
                  strokeLinecap="round"
                  opacity={on ? 0.9 : 0.55}
                  style={{ transition: 'stroke 0.4s, opacity 0.4s, stroke-width 0.4s' }}
                />
                {on && (
                  <path
                    d={path}
                    fill="none"
                    stroke={accent}
                    strokeWidth={2}
                    strokeDasharray="4 10"
                    strokeLinecap="round"
                    opacity={0.9}
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="0.9s" repeatCount="indefinite" />
                  </path>
                )}
              </g>
            )
          })}
        </svg>
      )}

      {/* packets */}
      {size.width > 0 && (
        <AnimatePresence>
          {(step.packets ?? []).map((p, i) => {
            const a = center(p.from)
            const b = center(p.to)
            const color = p.color ?? accent
            return (
              <motion.div
                key={`${stepKey}-${i}`}
                className="pointer-events-none absolute z-20 flex items-center gap-1.5"
                initial={{ x: a.x, y: a.y, opacity: 0, scale: 0.6 }}
                animate={{
                  x: b.x,
                  y: b.y,
                  opacity: [0, 1, 1, 0],
                  scale: [0.6, 1, 1, 0.7],
                }}
                transition={{
                  duration: PACKET_DURATION,
                  delay: p.delay ?? 0,
                  ease: 'easeInOut',
                  times: [0, 0.12, 0.85, 1],
                }}
                style={{ translateX: '-50%', translateY: '-50%' }}
              >
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ background: color, boxShadow: `0 0 14px 3px ${color}` }}
                />
                {p.label && (
                  <span
                    className="whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium"
                    style={{ background: 'rgba(8,11,19,0.85)', color, border: `1px solid ${color}55` }}
                  >
                    {p.label}
                  </span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      )}

      {/* nodes */}
      {nodes.map((n) => {
        const pos =
          size.width > 0
            ? { left: centerNode(n).x, top: centerNode(n).y }
            : { left: `${n.x}%`, top: `${n.y}%` }
        return (
          <Node
            key={n.id}
            node={n}
            active={activeNodes.has(n.id)}
            failed={failedNodes.has(n.id)}
            accent={accent}
            compact={compact}
            width={nodeWidth(n)}
            left={pos.left}
            top={pos.top}
          />
        )
      })}
    </div>
  )
}

function Node({
  node,
  active,
  failed,
  accent,
  compact,
  width,
  left,
  top,
}: {
  node: DiagramNode
  active: boolean
  failed: boolean
  accent: string
  compact: boolean
  width: number
  left: number | string
  top: number | string
}) {
  const style = NODE_STYLES[node.kind]
  const color = failed ? 'var(--color-danger)' : style.color

  return (
    <motion.div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 select-none"
      style={{ left, top, width }}
      initial={false}
      animate={{ scale: active ? 1.04 : 1, opacity: failed ? 0.55 : 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {active && !failed && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ boxShadow: `0 0 0 1px ${accent}, 0 0 26px 2px ${accent}66` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div
        className={`relative flex flex-col items-center rounded-xl border bg-surface/90 backdrop-blur ${
          compact ? 'gap-1 px-1.5 py-1.5' : 'gap-1.5 px-3 py-2.5'
        }`}
        style={{
          borderColor: failed ? 'var(--color-danger)' : active ? color : 'var(--color-border)',
        }}
      >
        <div
          className={`flex items-center justify-center rounded-lg ${compact ? 'h-6 w-6' : 'h-9 w-9'}`}
          style={{ color, background: `${hexish(color)}1a`, border: `1px solid ${hexish(color)}33` }}
        >
          <NodeIcon kind={node.kind} size={compact ? 15 : 22} />
        </div>
        <div className="text-center">
          <div
            className={`font-semibold leading-tight text-ink ${compact ? 'text-[10px]' : 'text-[12.5px]'}`}
          >
            {node.label}
          </div>
          {node.sublabel && !compact && (
            <div className="mt-0.5 font-mono text-[9.5px] leading-tight text-ink-faint">{node.sublabel}</div>
          )}
        </div>
        {failed && (
          <span
            className={`absolute flex items-center justify-center rounded-full bg-danger font-bold text-canvas ${
              compact ? '-right-1 -top-1 h-3 w-3 text-[8px]' : '-right-1.5 -top-1.5 h-4 w-4 text-[10px]'
            }`}
          >
            ✕
          </span>
        )}
      </div>
    </motion.div>
  )
}

/** Build a straight or gently curved path between two points. */
function edgePath(a: { x: number; y: number }, b: { x: number; y: number }, curve: number) {
  if (!curve) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  // perpendicular offset
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const cx = mx + nx * curve
  const cy = my + ny * curve
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
}

/** CSS vars can't be alpha-suffixed, so fall back to accent-ish neutral when needed. */
function hexish(color: string) {
  return color.startsWith('var(') ? '#818cf8' : color
}
