module.exports = {
  "env": {
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
  ],
  "ignorePatterns": ["**/*.json", ".eslintrc.js", "*.config.js"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
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
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "{}": false
        },
        "extendDefaults": true
      }
    ],
    "@typescript-eslint/no-empty-interface": "off"
  }
}
