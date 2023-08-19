module.exports = {
  "env": {
    "es2022": true,
    "browser": true,
  },
  "extends": [
    "plugin:vue/vue3-recommended",
    "plugin:tailwindcss/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "../.eslintrc.js",
  ],
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "extraFileExtensions": [".vue"],
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": true,
    "tsconfigRootDir": __dirname,
    "ecmaFeatures": {
      "jsx": true,
      "modules": true
    }
  },
  "plugins": [
    "react",
    "vue",
    "@typescript-eslint",
  ],
  "parser": "vue-eslint-parser",
  "rules": {
    "prefer-const": "off",
    // Note: you must disable the base rule as it can report incorrect errors
    "require-await": "off",
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
    "@typescript-eslint/require-await": "error",

    "tailwindcss/no-custom-classname": ["warn", {
      "callees": ["classnames", "clsx", "ctl", "cva", "tv", "twMerge"],
      "skipClassAttribute": true,
    }],

    "react/jsx-max-props-per-line": [1, { "maximum": 1 }],
    "react/jsx-curly-spacing": [1, { "when": "never", "children": true }],
    "react/jsx-closing-bracket-location": [1, "tag-aligned"],
    "react/jsx-props-no-multi-spaces": "warn",
    "react/jsx-tag-spacing": ["warn", {
      "closingSlash": "never",
      "beforeSelfClosing": "always",
      "afterOpening": "never",
      "beforeClosing": "allow"
    }],
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
