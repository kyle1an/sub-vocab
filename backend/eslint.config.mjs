import antfu from '@antfu/eslint-config'
import stylistic from '@stylistic/eslint-plugin'

export default antfu(stylistic.configs.customize({
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
}, {
  rules: {
    'ts/ban-types': [
      'error',
      {
        types: {
          '{}': false,
        },
        extendDefaults: true,
      },
    ],
    'ts/ban-ts-comment': 'off',
    'ts/consistent-type-definitions': 'off',
    /*
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
    // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
    'ts/method-signature-style': [
      'error',
      'property',
    ],
  },
}, {
  files: ['tsconfig.json'],
  rules: {
    'jsonc/sort-keys': 'off',
  },
})
