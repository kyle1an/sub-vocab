module.exports = {
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
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
    "semi": [1, "never"],
    "quotes": [1, "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
    "comma-dangle": ["warn", {
      "arrays": "only-multiline",
      "objects": "only-multiline",
      "imports": "only-multiline",
      "exports": "only-multiline",
      "functions": "only-multiline",
    }],
    "operator-linebreak": ["warn", "before", { overrides: { "=": "none" } }],
    "prefer-const": [1, {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false
    }],

    "import/order": [1, { "groups": ["builtin", "external", "parent", "sibling", "index"] }],
    "sort-imports": [1, {
      "ignoreCase": false,
      "ignoreDeclarationSort": true,
      "ignoreMemberSort": false,
      "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
      "allowSeparatedGroups": false,
    }],
    "@typescript-eslint/no-var-requires": "off",
    '@typescript-eslint/no-unused-vars': 'off',
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "{}": false
        },
        "extendDefaults": true
      }
    ],
  }
}
