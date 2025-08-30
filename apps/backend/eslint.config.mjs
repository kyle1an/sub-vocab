import antfu from '@antfu/eslint-config'
// @ts-check
/// <reference path="./eslint-typegen.d.ts" />
import typegen from 'eslint-typegen'

import configs from '../../eslint.config.js'

export default typegen(antfu(
  {
    stylistic: false,
  },
  configs,
  {
    name: 'backend/perfectionist',
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          internalPattern: ['^@/.+', '^@backend/.+', '^@sub-vocab/'],
        },
      ],
    },
  },
  {
    name: 'style/backend',
    rules: {
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
    files: ['app.ts'],
    rules: {
      'antfu/no-top-level-await': ['off'],
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
))
