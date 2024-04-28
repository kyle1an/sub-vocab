const stylistic = require('@stylistic/eslint-plugin')

const customized = stylistic.configs.customize({
  arrowParens: true,
  braceStyle: '1tbs',
  quoteProps: 'as-needed',
})

module.exports = {
  env: {
    es2024: true,
    node: true,
  },
  globals: {
    require: true,
    module: true,
    NodeJS: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  rules: {
    ...customized.rules,
    '@stylistic/multiline-ternary': ['off'],
    '@stylistic/no-extra-semi': 'off',
    'no-extra-semi': 'off',
    '@stylistic/switch-colon-spacing': 'warn',
    '@stylistic/quotes': [1, 'single', { avoidEscape: true, allowTemplateLiterals: true }],

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

    // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
    '@typescript-eslint/method-signature-style': [
      'error',
      'property',
    ],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: true,
  },
  plugins: [
    '@stylistic',
    '@typescript-eslint',
  ],
}
