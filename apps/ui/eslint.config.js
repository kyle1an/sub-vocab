import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import pluginQuery from '@tanstack/eslint-plugin-query'
import eslintPluginTailwindCss from 'eslint-plugin-tailwindcss'
import valtio from 'eslint-plugin-valtio'
// @ts-check
/// <reference path="./eslint-typegen.d.ts" />
import typegen from 'eslint-typegen'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import configs from '../../eslint.config.js'

const compat = new FlatCompat()

// https://github.com/hyoban/eslint-plugin-tailwindcss/pull/3#issuecomment-2860221137
/**
 * Recursively walks `dir`, looking for the first .css file
 * that has a line starting with @import "tailwindcss
 * @param {string} dir  absolute path to start searching from
 * @returns {string|null}  absolute path to matching CSS, or null if none found
 *
 * @example
 * const twCssPath = findTailwindImportCss(process.cwd())
 */
function findTailwindImportCss(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const found = findTailwindImportCss(fullPath)
      if (found) return found
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      // read & scan lines
      const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)
      for (const line of lines) {
        if (line.trim().startsWith(`@import "tailwindcss"`)) {
          return fullPath
        }
      }
    }
  }

  return null
}

export default typegen(antfu(
  {
    react: true,
    stylistic: false,
  },
  configs,
  {
    name: 'ui/perfectionist',
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          internalPattern: ['^@/.+', '^@ui/.+', '^@backend/.+', '^@sub-vocab/'],
        },
      ],
    },
  },
  {
    name: 'style/ui',
    rules: {
      'style/jsx-wrap-multilines': ['warn',
        {
          arrow: 'parens',
          assignment: 'parens',
          condition: 'parens',
          declaration: 'parens',
          logical: 'parens',
          prop: 'parens-new-line',
          propertyValue: 'parens-new-line',
          return: 'parens',
        },
      ],
      'style/jsx-closing-tag-location': 'off',
      'style/jsx-one-expression-per-line': ['warn', { allow: 'single-line' }],
    },
  },
  {
    name: 'react',
    rules: {
      'react/prefer-destructuring-assignment': 'off',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useIsomorphicLayoutEffect|useAbortableEffect|useMemoOne|useStableMemo|useCallbackOne|useStableCallback)',
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**/*.{js,ts,jsx,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  compat.config({
    plugins: [
      'eslint-plugin-react-compiler',
    ],
    rules: {
      'react-compiler/react-compiler': 2,
    },
  }),
  ...pluginQuery.configs['flat/recommended'],
  ...eslintPluginTailwindCss.configs['flat/recommended'],
  {
    name: 'tailwindcss',
    rules: {
      'tailwindcss/no-custom-classname': ['warn', {
        callees: ['classnames', 'clsx', 'cn', 'ctl', 'cva', 'tv', 'twMerge', 'add'],
        skipClassAttribute: true,
      }],
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/enforces-negative-arbitrary-values': 'off',
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'cn', 'ctl', 'cva', 'tv', 'twMerge', 'add'],
        config: findTailwindImportCss(process.cwd()),
      },
    },
  },
  valtio.configs['flat/recommended'],
  {
    ignores: [
      'database.types.ts',
      '**/types/schema/*.d.ts',
    ],
  },
))
