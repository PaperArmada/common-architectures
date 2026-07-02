import type { Architecture } from '../types'
import content from '../content/waf.mdx'

const CLEAN = '#38bdf8'
const OK = '#34d399'
const ATTACK = '#f43f5e'
const BLOCK = '#f87171'

export const waf: Architecture = {
  slug: 'waf',
  title: 'Web Application Firewall',
  category: 'security',
  tagline: 'Inspect incoming requests at the edge and block attacks before they reach the app.',
  level: 'intro',
  nodes: [
    { id: 'user', label: 'User', kind: 'client', x: 12, y: 26 },
    { id: 'attacker', label: 'Attacker', kind: 'client', x: 12, y: 74 },
    { id: 'waf', label: 'WAF', sublabel: 'rule set', kind: 'shield', x: 46, y: 50 },
    { id: 'app', label: 'App', kind: 'server', x: 82, y: 50 },
  ],
  edges: [
    { id: 'e-u-w', from: 'user', to: 'waf' },
    { id: 'e-a-w', from: 'attacker', to: 'waf' },
    { id: 'e-w-app', from: 'waf', to: 'app' },
  ],
  steps: [
    {
      id: 'intro',
      title: 'Internet-facing apps are probed constantly',
      description:
        'SQL injection, XSS, path traversal, credential stuffing, junk floods — every exposed service is attacked around the clock. You don’t want each app reimplementing all the defenses.',
      activeNodes: ['user', 'attacker', 'app'],
    },
    {
      id: 'inspect',
      title: 'The WAF inspects every request',
      description:
        'Sitting at the edge ahead of the app, the WAF checks each request — URL, headers, body, source — against a rule set: known attack signatures, suspicious patterns, IP reputation, rate thresholds.',
      activeNodes: ['waf'],
      annotations: ['OWASP signatures · IP reputation · rate limits'],
    },
    {
      id: 'clean',
      title: 'Clean traffic passes through',
      description:
        'A legitimate user’s request matches nothing malicious, so the WAF forwards it to the app, which responds normally.',
      activeNodes: ['user', 'waf', 'app'],
      activeEdges: ['e-u-w', 'e-w-app'],
      packets: [
        { from: 'user', to: 'waf', color: CLEAN, label: 'GET /products' },
        { from: 'waf', to: 'app', color: CLEAN, delay: 0.4 },
        { from: 'app', to: 'user', color: OK, label: '200', delay: 1.0 },
      ],
    },
    {
      id: 'block',
      title: 'Malicious requests are blocked at the edge',
      description:
        'The attacker’s request matches a SQL-injection signature. The WAF blocks it right there and returns 403 — the exploit attempt never touches the application.',
      activeNodes: ['attacker', 'waf'],
      activeEdges: ['e-a-w'],
      annotations: ['SQLi signature matched → 403', 'App never sees it'],
      packets: [
        { from: 'attacker', to: 'waf', color: ATTACK, label: "' OR 1=1 --" },
        { from: 'waf', to: 'attacker', color: BLOCK, label: '403 blocked', delay: 0.5 },
      ],
    },
    {
      id: 'tuning',
      title: 'Tuning: false positives vs. false negatives',
      description:
        'Too strict and you block real users; too loose and attacks slip through. Teams often run new rules in count/monitor mode first to see what they’d block before enforcing.',
      activeNodes: ['waf'],
      annotations: ['Start in monitor mode, then enforce'],
    },
    {
      id: 'recap',
      title: 'A filter, not a fix',
      description:
        'A WAF gives broad, centralized protection with no app changes, and a fast way to virtually patch a new CVE. But it’s defense in depth — not a substitute for secure code, input validation, and parameterized queries.',
      activeNodes: ['waf', 'app'],
      annotations: ['Defense in depth, not a substitute'],
    },
  ],
  content,
}
