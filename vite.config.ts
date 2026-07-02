import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Base is set for project-page deploys (e.g. GitHub Pages at /common-architectures/).
  // Override with VITE_BASE=/ for root deploys or local preview.
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
    tailwindcss(),
  ],
})
