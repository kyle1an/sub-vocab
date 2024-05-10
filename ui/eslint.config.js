import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules } from '@eslint/compat'
import stylistic from '@stylistic/eslint-plugin'
import * as tanstackQuery from '@tanstack/eslint-plugin-query'

const compat = new FlatCompat()

export default antfu({
  react: true,
}, stylistic.configs.customize({
  arrowParens: true,
  braceStyle: '1tbs',
  quoteProps: 'as-needed',
}), {
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
}, {
/*
    'no-unused-vars': [0, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-return-assign': ['warn', 'except-parens'],

    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': false,
        },
        extendDefaults: true,
      },
    ],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      { 'ts-ignore': false },
    ],
    '@typescript-eslint/require-await': 'error',

    'import/order': [1, { groups: ['builtin', 'external', 'parent', 'sibling', 'index'] }],
    'sort-imports': [1, {
      ignoreDeclarationSort: true,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    }],

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/type-annotation-spacing': 'warn',
    '@typescript-eslint/no-misused-promises': ['warn', {
      checksVoidReturn: {
        attributes: false,
      },
    }],

    'no-param-reassign': ['error', { props: false }],
    'no-shadow': ['error', {
      allow: [
        'className', 'resolve', 'reject',
      ],
    }],
    'no-multi-assign': ['error', { ignoreNonDeclaration: true }],
*/
}, {
  rules: {
    'ts/ban-ts-comment': 'off',
    'ts/consistent-type-definitions': 'off',
    // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
    'ts/method-signature-style': [
      'error',
      'property',
    ],
  },
}, {
  rules: {
    'react/prefer-destructuring-assignment': 'off',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: 'useIsomorphicLayoutEffect',
      },
    ],
  },
}, {
  files: ['tsconfig.json', 'tsconfig.*.json'],
  rules: {
    'jsonc/sort-keys': 'off',
  },
}, ...fixupConfigRules({
  name: '@tanstack/query',
  files: ['src/**/*.{ts,tsx}'],
  plugins: {
    '@tanstack/query': {
      rules: tanstackQuery.rules,
    },
  },
  rules: tanstackQuery.configs.recommended.rules,
}), ...fixupConfigRules(compat.config({
  extends: ['plugin:tailwindcss/recommended'],
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
})))
