module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
  },
  "extends": [
    "plugin:vue/vue3-recommended",
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
  "ignorePatterns": ["**/*.json", ".eslintrc.js", "*.config.js", "/dist/"],
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
    "prefer-const": "off",

    "import/order": [1, { "groups": ["builtin", "external", "parent", "sibling", "index"] }],
    "sort-imports": [1, {
      "ignoreCase": false,
      "ignoreDeclarationSort": true,
      "ignoreMemberSort": false,
      "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
      "allowSeparatedGroups": false,
    }],
    "@typescript-eslint/no-explicit-any": "off",
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
    "tailwindcss/no-custom-classname": "off",
    "vue/component-name-in-template-casing": ["warn", "PascalCase", {
      "registeredComponentsOnly": true,
      "ignores": ["component"],
    }],
    "vue/attribute-hyphenation": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-setup-props-destructure": "off",
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        "project": ["tsconfig.json", "ui/tsconfig.json"]
      },
      "node": {
        "project": ["tsconfig.json", "ui/tsconfig.json"]
      }
    }
  }
}
