import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'packages/template/*'],
    coverage: {
      enabled: true,
    },
  },
})
