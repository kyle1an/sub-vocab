import antfu from '@antfu/eslint-config'
import stylistic from '@stylistic/eslint-plugin'
import perfectionist from 'eslint-plugin-perfectionist'

export default antfu(
  {
    stylistic: false,
  },
  stylistic.configs.customize({
    arrowParens: true,
    braceStyle: '1tbs',
    quoteProps: 'as-needed',
  }),
  {
    name: 'style',
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
      'no-unused-vars': [0, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-return-assign': ['warn', 'except-parens'],
      'no-param-reassign': ['error', { props: false }],
      'no-shadow': ['error', {
        allow: [
          'className',
          'resolve',
          'reject',
        ],
      }],
      'no-multi-assign': ['error', { ignoreNonDeclaration: true }],
      'prefer-template': 'off',
    },
  },
  {
    name: 'perfectionist',
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['~/**', '@/**'],
          newlinesBetween: 'always',
          maxLineLength: undefined,
          groups: [
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          customGroups: { type: {}, value: {} },
          environment: 'node',
        },
      ],
    },
  },
  {
    rules: {
      'no-console': 'off',
      'ts/ban-ts-comment': 'off',
      'ts/consistent-type-definitions': 'off',
    },
  },
  {
    files: ['tsconfig.json', 'tsconfig.*.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
)
