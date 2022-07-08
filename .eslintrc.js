module.exports = {
  'env': {
    'browser': true,
    // "es2021": true,
    'node': true,
  },
  'extends': [
    'plugin:vue/vue3-recommended',
    // "plugin:vue/essential"
  ],
  'parserOptions': {
    parser: require.resolve('@typescript-eslint/parser'),
    extraFileExtensions: ['.vue'],
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    'vue',
    '@typescript-eslint',
  ],
  parser: 'vue-eslint-parser',
  'ignorePatterns': ['**/*.json'],
  'rules': {
    'semi': [1, 'never'],
    'quotes': [1, 'single'],
    'vue/multi-word-component-names': 'off',
  }
}
