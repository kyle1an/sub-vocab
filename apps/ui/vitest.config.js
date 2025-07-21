import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default defineConfig((configEnv) => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      exclude: [...configDefaults.exclude, 'packages/template/*'],
    },
  }),
))
