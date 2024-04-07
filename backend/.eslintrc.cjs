module.exports = {
  env: {
    es2024: true,
    node: true
  },
  globals: {
    NodeJS: true
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "../.eslintrc.cjs",
  ],
  rules: {
    "@stylistic/space-before-blocks": ["warn", "always"],

    "import/order": [1, { groups: ["builtin", "external", "parent", "sibling", "index"] }],
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "{}": false
        },
        extendDefaults: true
      }
    ],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],

    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error", {
      functions: false,
      allowNamedExports: false,
      ignoreTypeReferences: true,
    }],
    // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
    "@typescript-eslint/method-signature-style": [
      "error",
      "property"
    ],
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "@stylistic",
    "@typescript-eslint"
  ],
}
