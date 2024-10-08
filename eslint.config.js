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
      'unused-imports/no-unused-vars': 'off',
      'prefer-arrow-callback': 'off',
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
    files: ['**/*.toml', '**/*.y?(a)ml'],
    rules: {
      'style/spaced-comment': 'off',
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
    files: ['tsconfig.json', 'tsconfig.*.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
)
