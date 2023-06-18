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
  "parser": "@typescript-eslint/parser",
  "ignorePatterns": ["**/*.json", ".eslintrc.js", "*.config.js"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {}
}
