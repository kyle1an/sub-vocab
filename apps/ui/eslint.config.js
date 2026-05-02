import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import reactCompiler from 'eslint-plugin-react-compiler'
import reactHooks from 'eslint-plugin-react-hooks'
import eslintPluginTailwindCss from 'eslint-plugin-tailwindcss'
// @ts-check
/// <reference path="./eslint-typegen.d.ts" />
import typegen from 'eslint-typegen'
import path from 'node:path'

import configs from '../../eslint.config.js'

const __dirname = import.meta.dirname
const tailwindSourceFiles = ['**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}']

// @antfu/eslint-config 8 expects @eslint-react v3 subplugins; v4 leaves those
// aliases undefined, which breaks eslint-typegen and ESLint config validation.
function stripUndefinedPlugins(configs) {
  return configs.then((resolved) => resolved.map((config) => {
    if (!config.plugins) {
      return config
    }

    const plugins = Object.fromEntries(
      Object.entries(config.plugins).filter(([, plugin]) => plugin != null),
    )

    if (Object.keys(plugins).length === Object.keys(config.plugins).length) {
      return config
    }

    return {
      ...config,
      plugins,
    }
  }))
}

export default typegen(stripUndefinedPlugins(antfu(
  {
    react: true,
    stylistic: false,
  },
  {
    name: 'ui/type-aware-linting',
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
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
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react/prefer-destructuring-assignment': 'off',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useIsomorphicLayoutEffect|useAbortableEffect|useMemoOne|useStableMemo|useCallbackOne|useStableCallback_|useAtomEffect|useUpdateEffect)',
        },
      ],
    },
    settings: {
      'react-hooks': {
        // https://github.com/facebook/react/pull/34497
        additionalEffectHooks: '(useIsomorphicLayoutEffect|useAbortableEffect|useMemoOne|useStableMemo|useCallbackOne|useStableCallback_|useAtomEffect|useUpdateEffect)',
      },
    },
  },
  ...pluginQuery.configs['flat/recommended'],
  {
    ...eslintPluginTailwindCss.configs.recommended,
    files: tailwindSourceFiles,
  },
  {
    name: 'tailwindcss',
    files: tailwindSourceFiles,
    settings: {
      tailwindcss: {
        cssConfigPath: path.join(__dirname, 'app/[locale]/globals.css'),
        functions: ['classnames', 'clsx', 'cn', 'ctl', 'cva', 'tv', 'tw', 'twMerge', 'add'],
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
)))
