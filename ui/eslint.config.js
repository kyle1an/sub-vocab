import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules } from '@eslint/compat'
import stylistic from '@stylistic/eslint-plugin'
import pluginQuery from '@tanstack/eslint-plugin-query'
import eslintPluginTailwindCss from 'eslint-plugin-tailwindcss'

const compat = new FlatCompat()

export default antfu(
  {
    react: true,
    stylistic: false,
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
      'unused-imports/no-unused-vars': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
  {
    settings: {
      regexp: {
        allowedCharacterRanges: ['alphanumeric', 'À-ÿ', 'À-Þ'],
      },
    },
  },
  {
    rules: {
      'ts/ban-ts-comment': 'off',
      'ts/consistent-type-definitions': 'off',
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
  })),
  {
    files: ['tsconfig.json', 'tsconfig.*.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
  ...pluginQuery.configs['flat/recommended'],
  ...eslintPluginTailwindCss.configs['flat/recommended'],
  {
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
)
