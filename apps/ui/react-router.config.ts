import type { Config } from '@react-router/dev/config'

import { vercelPreset } from '@vercel/react-router/vite'

export default {
  // Note: This also changes local server's index.js build output directory.
  presets: [vercelPreset()],
} satisfies Config
