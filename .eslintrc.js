module.exports = {
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  'ignorePatterns': ['**/*.json', '.eslintrc.js', '*.config.js'],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    'semi': [1, 'never'],
    'quotes': [1, 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }],
    "@typescript-eslint/no-var-requires": "off",
    '@typescript-eslint/no-unused-vars': 'off',
    "prefer-const": [1, {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false
    }],
    '@typescript-eslint/no-explicit-any': 'off',
  }
}
