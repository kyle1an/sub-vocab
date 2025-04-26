import antfu from '@antfu/eslint-config'
import stylistic from '@stylistic/eslint-plugin'
import command from 'eslint-plugin-command/config'
import deMorgan from 'eslint-plugin-de-morgan'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import packageJson from 'eslint-plugin-package-json'
// @ts-check
/// <reference path="./eslint-typegen.d.ts" />
import typegen from 'eslint-typegen'

export default typegen(antfu(
  {
    stylistic: false,
  },
  stylistic.configs.customize({
    arrowParens: true,
    braceStyle: 'stroustrup',
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
      'unused-imports/no-unused-vars': 'off',
      'prefer-arrow-callback': 'off',
      curly: ['off'],
      'jsonc/indent': ['warn', 2],
    },
  },
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  packageJson.configs.recommended,
  {
    rules: {
      'package-json/order-properties': [0],
      /*
      'package-json/sort-collections': [
        'warn',
        [
          'dependencies',
          'devDependencies',
          'peerDependencies',
        ],
      ],
      */
    },
  },
  command(),
  {
    name: 'root/perfectionist',
    rules: {
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'natural',
          internalPattern: ['^@/.+'],
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
  deMorgan.configs.recommended,
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
))
