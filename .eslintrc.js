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
    "plugin:import/recommended",
    "plugin:import/typescript",
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
    "import/order": [1, { "groups": ["builtin", "external", "parent", "sibling", "index"] }]
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx",],
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        "project": './tsconfig.json',
      }
    }
  }
}
