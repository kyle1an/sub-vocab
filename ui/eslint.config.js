import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import pluginQuery from '@tanstack/eslint-plugin-query'
import eslintPluginTailwindCss from 'eslint-plugin-tailwindcss'
import valtio from 'eslint-plugin-valtio'

import configs from '../eslint.config.js'

const compat = new FlatCompat()

export default antfu(
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
          internalPattern: ['^@/.+'],
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
    },
  },
  {
    name: 'react',
    rules: {
      'react/prefer-destructuring-assignment': 'off',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: 'useIsomorphicLayoutEffect',
        },
      ],
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
        callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'twMerge', 'add'],
        skipClassAttribute: true,
      }],
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/enforces-negative-arbitrary-values': 'off',
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'cn', 'ctl', 'cva', 'tv', 'twMerge'],
        config: 'tailwind.config.ts', // returned from `loadConfig()` utility if not provided
      },
    },
  },
  valtio.configs['flat/recommended'],
  {
    ignores: [
      'database.types.ts',
      '**/types/schema-*.d.ts',
    ],
  },
)
