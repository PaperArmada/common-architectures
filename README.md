# Common Architectures

A richly animated, clean learning tool for **common systems-level designs and
deployment architectures** — the sibling of the data-structures & algorithms
visualizer, but for the way real software is deployed.

Each architecture is a **guided, step-by-step walkthrough**: step through the
flow at your own pace (or hit play) and watch requests, writes, replication, and
failures animate through the system.

## Stack

- **React + TypeScript + Vite**
- **Framer Motion** for the animations
- **Tailwind CSS v4** for styling
- **MDX** for long-form content (authored separately from the diagram code)

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview     # preview the production build
```

## How it's organized

```
src/
  types.ts                     # Architecture / Step / Node / Edge / Packet model
  components/
    diagram/Diagram.tsx        # the animated canvas (nodes, edges, packets)
    diagram/nodeStyles.tsx     # per-node-kind colors + icons
    StepPlayer.tsx             # transport controls + narration panel
    layout/Sidebar.tsx
  architectures/               # one file per architecture: nodes, edges, steps
    loadBalancer.ts
    dbReplication.ts
  content/                     # MDX prose for each architecture (author here!)
    load-balancer.mdx
    db-replication.mdx
  data/
    architectures.ts           # the registry — add new architectures here
    categories.ts
  pages/                       # Home, Architecture, 404
```

## Adding a new architecture

1. Write the prose in `src/content/<slug>.mdx`.
2. Create `src/architectures/<name>.ts` — define the `nodes`, `edges`, and the
   ordered `steps` (each step choreographs which nodes light up and which
   packets fly), and `import content from '../content/<slug>.mdx'`.
3. Register it in `src/data/architectures.ts`.

The diagram is fully data-driven: node positions are percentages of the canvas,
edges connect nodes by id, and each step lists the `packets` (animated messages)
to fire. No per-architecture animation code required.

## Content model

The **animation choreography** (step titles, one-line descriptions, packet
flows) lives in the architecture's `.ts` file because it drives the visuals. The
**long-form explanation** (problem, trade-offs, where you'll see it) lives in the
`.mdx` file so it can be edited freely without touching code.

## Deploying to a project page (e.g. GitHub Pages)

Set the base path at build time:

```bash
VITE_BASE=/common-architectures/ npm run build
```

The router reads `import.meta.env.BASE_URL`, so links and assets resolve
correctly under a sub-path.
