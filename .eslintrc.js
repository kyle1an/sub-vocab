module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
  },
  "extends": [
    "plugin:vue/vue3-recommended",
    // "plugin:vue/essential",
    "plugin:tailwindcss/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "extraFileExtensions": [".vue"],
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "plugins": [
    "vue",
    "@typescript-eslint",
  ],
  "parser": "vue-eslint-parser",
  "ignorePatterns": ["**/*.json", ".eslintrc.js", "*.config.js"],
  "rules": {
    "semi": [1, "never"],
    "quotes": [1, "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
    "vue/attribute-hyphenation": "off",
    "vue/multi-word-component-names": "off",
    "tailwindcss/no-custom-classname": "off",
  },
}
