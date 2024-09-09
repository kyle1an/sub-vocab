import antfu from '@antfu/eslint-config'

import configs from '../eslint.config.js'

export default antfu(
  {
    stylistic: false,
  },
  configs,
  {
    name: 'style',
    rules: {
      curly: ['error', 'multi-line'],
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
    ignores: [
      'drizzle/*',
    ],
  },
  {
    rules: {
      'no-console': 'off',
    },
  },
)
