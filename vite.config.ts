import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import birthplaces from './api/birthplaces.ts'

export default defineConfig({
  base: '/',
  plugins: [
    {
      name: 'birthplace-search-api',
      configureServer(server) {
        server.middlewares.use('/api/birthplaces', async (request, response) => {
          const result = await birthplaces.fetch(new Request(`http://localhost/api/birthplaces${request.url ?? ''}`, { method: request.method }))
          response.statusCode = result.status
          result.headers.forEach((value, key) => response.setHeader(key, value))
          response.end(await result.text())
        })
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@orrery/core': resolve(__dirname, 'packages/core/src'),
    },
  },
})
