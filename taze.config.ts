import { defineConfig } from 'taze'

export default defineConfig({
  write: true,
  maturityPeriod: 14,
  ignorePaths: [
    '**/node_modules/**',
    '**/test/**',
  ],
  packageMode: {
  },
})
