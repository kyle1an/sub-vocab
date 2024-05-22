import antfu from '@antfu/eslint-config'
import stylistic from '@stylistic/eslint-plugin'

export default antfu(
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
    rules: {
      'ts/ban-types': [
        'error',
        {
          extendDefaults: true,
        },
      ],
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
    files: ['tsconfig.json'],
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
)
