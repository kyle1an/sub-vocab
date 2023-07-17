module.exports = {
  "env": {
    "es2022": true,
    "node": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "../.eslintrc.js",
  ],
  "rules": {
    "import/order": [1, { "groups": ["builtin", "external", "parent", "sibling", "index"] }],
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "{}": false
        },
        "extendDefaults": true
      }
    ],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
}
