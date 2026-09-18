import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
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
        filter: ({ path }) => !path.includes('#'),
      },
    }),
    viteReact(),
  ],
})
