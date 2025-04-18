import { defineConfig } from 'taze'

export default defineConfig({
  write: true,
  ignorePaths: [
    '**/node_modules/**',
    '**/test/**',
  ],
  packageMode: {
    tailwindcss: 'minor',
    'tailwind-merge': 'minor',
  },
})
