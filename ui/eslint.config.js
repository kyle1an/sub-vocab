import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules } from '@eslint/compat'
import stylistic from '@stylistic/eslint-plugin'
import * as tanstackQuery from '@tanstack/eslint-plugin-query'
import eslintPluginTailwindCss from 'eslint-plugin-tailwindcss'

const compat = new FlatCompat()

export default antfu(
  {
    react: true,
  },
  stylistic.configs.customize({
    arrowParens: true,
    braceStyle: '1tbs',
    quoteProps: 'as-needed',
  }),
  {
    rules: {
      '@stylistic/multiline-ternary': ['off'],
      '@stylistic/no-extra-semi': 'off',
      'no-extra-semi': 'off',
      '@stylistic/switch-colon-spacing': 'warn',
      '@stylistic/quotes': [1, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      '@stylistic/brace-style': ['error', '1tbs'],
      curly: ['error', 'multi-line'],
      'unused-imports/no-unused-vars': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
  {
    rules: {
      'ts/ban-ts-comment': 'off',
      'ts/consistent-type-definitions': 'off',
      // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
      'ts/method-signature-style': [
        'error',
        'property',
      ],
    },
  },
  {
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
  ...fixupConfigRules(compat.config({
    plugins: [
      'eslint-plugin-react-compiler',
    ],
    rules: {
      'react-compiler/react-compiler': 2,
    },
    // https://github.com/facebook/react/issues/29107#issue-2300739359
    overrides: [
      {
        files: ['*.json', '*.graphql'],
        rules: {
          'react-compiler/react-compiler': 'off',
        },
      },
    ],
  })),
  {
    files: ['tsconfig.json', 'tsconfig.*.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
  ...fixupConfigRules({
    name: '@tanstack/query',
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@tanstack/query': {
        rules: tanstackQuery.rules,
      },
    },
    rules: tanstackQuery.configs.recommended.rules,
  }),
  ...eslintPluginTailwindCss.configs['flat/recommended'],
  {
    rules: {
      'tailwindcss/no-custom-classname': ['warn', {
        callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'twMerge'],
        skipClassAttribute: true,
      }],
      'tailwindcss/migration-from-tailwind-2': 'off',
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'cn', 'ctl', 'cva', 'tv', 'twMerge'],
        config: 'tailwind.config.ts', // returned from `loadConfig()` utility if not provided
      },
    },
  },
)
