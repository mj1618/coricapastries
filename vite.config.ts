import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig(({ mode }) => {
  // Server functions read process.env (Vercel sets it in production). Locally
  // that comes from .env, which Vite only exposes to client code by default, so
  // copy it across for `npm run dev`. Existing shell variables win.
  const fileEnv = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(fileEnv)) {
    process.env[key] ??= value
  }

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      nitro(),
      tailwindcss(),
      tanstackStart({
        // Every page is static content, so prerender the whole site to HTML at build time.
        prerender: {
          enabled: true,
          crawlLinks: true,
          autoSubfolderIndex: true,
          // Crawled anchors like /faqs#wholesale would otherwise become their own page.
          // Shop and API routes need live SupplyWise data, so they render on request.
          filter: ({ path }) =>
            !path.includes('#') &&
            !path.startsWith('/shop') &&
            !path.startsWith('/api'),
        },
      }),
      viteReact(),
    ],
  }
})
