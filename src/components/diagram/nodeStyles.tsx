import type { NodeKind } from '../../types'

export interface NodeStyle {
  /** Base accent color (CSS var or hex). */
  color: string
  label: string
}

export const NODE_STYLES: Record<NodeKind, NodeStyle> = {
  client: { color: '#38bdf8', label: 'Client' },
  lb: { color: '#818cf8', label: 'Load balancer' },
  gateway: { color: '#c084fc', label: 'API gateway' },
  server: { color: '#a78bfa', label: 'Service' },
  cache: { color: '#fb7185', label: 'Cache' },
  db: { color: '#fbbf24', label: 'Database' },
  'db-primary': { color: '#fbbf24', label: 'Primary' },
  'db-replica': { color: '#d6b24a', label: 'Replica' },
  cdn: { color: '#34d399', label: 'CDN edge' },
  queue: { color: '#c084fc', label: 'Queue' },
  storage: { color: '#34d399', label: 'Object storage' },
  broker: { color: '#2dd4bf', label: 'Broker / topic' },
  worker: { color: '#22d3ee', label: 'Worker' },
  shield: { color: '#f43f5e', label: 'Security / firewall' },
  monitor: { color: '#a3e635', label: 'Monitoring' },
  registry: { color: '#2dd4bf', label: 'Registry' },
}

/** Compact stroke icons keyed by node kind. Rendered inside a 24×24 box. */
export function NodeIcon({ kind }: { kind: NodeKind }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (kind) {
    case 'client':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      )
    case 'lb':
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="12" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <path d="M12 7v4M12 11H5.5v6M12 11h6.5v6M12 11v6" />
        </svg>
      )
    case 'gateway':
      return (
        <svg {...common}>
          <path d="M4 9l8-5 8 5-8 5-8-5Z" />
          <path d="M4 9v6l8 5 8-5V9" />
        </svg>
      )
    case 'server':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="7" rx="1.3" />
          <rect x="4" y="13" width="16" height="7" rx="1.3" />
          <path d="M7.5 7.5h.01M7.5 16.5h.01" />
        </svg>
      )
    case 'cache':
      return (
        <svg {...common}>
          <path d="M12 3l7 4v5c0 4-3 6.5-7 9-4-2.5-7-5-7-9V7l7-4Z" />
          <path d="M9.5 11.5l2 2 3.5-4" />
        </svg>
      )
    case 'db':
    case 'db-primary':
    case 'db-replica':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
          <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
        </svg>
      )
    case 'cdn':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </svg>
      )
    case 'queue':
      return (
        <svg {...common}>
          <rect x="3" y="8" width="4" height="8" rx="1" />
          <rect x="10" y="8" width="4" height="8" rx="1" />
          <rect x="17" y="8" width="4" height="8" rx="1" />
        </svg>
      )
    case 'storage':
      return (
        <svg {...common}>
          <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z" />
          <path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
        </svg>
      )
    case 'broker':
      // fan-out hub: one input, three outputs
      return (
        <svg {...common}>
          <circle cx="5.5" cy="12" r="2" />
          <circle cx="19" cy="5.5" r="1.9" />
          <circle cx="19" cy="12" r="1.9" />
          <circle cx="19" cy="18.5" r="1.9" />
          <path d="M7.5 12h2M11 12l6-5.6M11 12h6M11 12l6 5.6" />
        </svg>
      )
    case 'worker':
      // gear
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2.2M12 18.3v2.2M4.6 12H2.4M21.6 12h-2.2M6.4 6.4 4.9 4.9M19.1 19.1l-1.5-1.5M17.6 6.4l1.5-1.5M4.9 19.1l1.5-1.5" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5.5c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6l7-3Z" />
          <circle cx="12" cy="10.5" r="1.4" />
          <path d="M12 11.9V14.5" />
        </svg>
      )
    case 'monitor':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M6 13l3-4 2.2 3 2.3-4.2L17 13" />
          <path d="M9 21h6M12 18v3" />
        </svg>
      )
    case 'registry':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8M8 12.5h8M8 16h5" />
        </svg>
      )
  }
}
