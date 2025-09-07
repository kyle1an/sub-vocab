import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import reactCompiler from 'eslint-plugin-react-compiler'
import eslintPluginTailwindCss from 'eslint-plugin-tailwindcss'
// @ts-check
/// <reference path="./eslint-typegen.d.ts" />
import typegen from 'eslint-typegen'
import path from 'node:path'

import configs from '../../eslint.config.js'

const __dirname = import.meta.dirname

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
          internalPattern: ['^@/.+', '^@backend/.+', '^@ui/.+', '^@sub-vocab/'],
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
  reactCompiler.configs.recommended,
  {
    name: 'react',
    rules: {
      'react/prefer-destructuring-assignment': 'off',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useIsomorphicLayoutEffect|useAbortableEffect|useMemoOne|useStableMemo|useCallbackOne|useStableCallback_|useAtomEffect|useUpdateEffect)',
        },
      ],
    },
  },
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
        // https://github.com/hyoban/eslint-plugin-tailwindcss/pull/3#issuecomment-3079169194
        config: path.join(__dirname, 'app/[locale]/globals.css'),
      },
    },
  },
  {
    ignores: [
      '**/database.types.ts',
      'drizzle/*',
    ],
  },
  {
    rules: {
      'n/prefer-global/process': ['off'],
    },
  },
))
