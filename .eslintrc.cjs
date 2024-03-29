module.exports = {
  "env": {
    "es2024": true,
    "node": true,
  },
  "extends": [
    "eslint:recommended",
  ],
  "ignorePatterns": ["/dist/", "/built/"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "rules": {
    "quotes": [1, "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
    "indent": ["warn", 2, {
      "SwitchCase": 1,
    }],
    "camelcase": ["off"],
    "no-restricted-syntax": [
      "off",
      "ForInStatement",
    ],
    "no-bitwise": ["off"],
    "no-plusplus": ["off"],
    "no-continue": "off",
    "no-return-assign": ["warn", "except-parens"],
    "no-extra-semi": "off",
    "no-console": ["off", { "allow": ["warn", "error"] }],
    "no-multi-spaces": "warn",
    "no-multiple-empty-lines": ["warn", { "max": 1, "maxEOF": 1 }],
    "no-trailing-spaces": "warn",
    "no-whitespace-before-property": "warn",

    "guard-for-in": "off",
    "arrow-spacing": "warn",
    "array-bracket-spacing": ["warn", "never"],
    "block-spacing": "warn",
    "comma-spacing": "warn",
    "computed-property-spacing": ["warn", "never"],
    "key-spacing": "warn",
    "object-curly-spacing": ["warn", "always"],
    "rest-spread-spacing": ["warn", "never"],
    "semi-spacing": "warn",
    "switch-colon-spacing": "warn",
    "space-before-blocks": "warn",
    "space-before-function-paren": ["warn", { "anonymous": "always", "named": "never", "asyncArrow": "always" }],
    "space-in-parens": ["warn", "never"],
    "space-infix-ops": "warn",
    "space-unary-ops": "warn",
    "template-curly-spacing": "warn",

    "comma-dangle": ["warn", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "always-multiline",
    }],
    "operator-linebreak": ["warn", "before", { "overrides": { "=": "none" } }],
    "prefer-const": [1, {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false,
    }],
    "no-unused-vars": [0, { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "sort-imports": [1, {
      "ignoreCase": false,
      "ignoreDeclarationSort": true,
      "ignoreMemberSort": false,
      "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
      "allowSeparatedGroups": false,
    }],

    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-interface": "off",
    // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
    "@typescript-eslint/method-signature-style": [
      "error",
      "property"
    ],

    "linebreak-style": "off",
    "prefer-arrow-callback": "off",
    "max-len": [0],
  },
  "overrides": [
    {
      "files": [".eslintrc.cjs", ".eslintrc.js"],
      "rules": {
        "quotes": [2, "double"],
        "quote-props": [2, "always"],
        "comma-dangle": ["warn", {
          "arrays": "only-multiline",
          "objects": "only-multiline",
          "imports": "only-multiline",
          "exports": "only-multiline",
          "functions": "only-multiline",
        }],
      },
    },
  ],
}
