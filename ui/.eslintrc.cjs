module.exports = {
  env: {
    browser: true,
    es2024: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "airbnb",
    "airbnb/hooks",
    "../.eslintrc.cjs",
  ],
  ignorePatterns: ["dist", "/built/"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: [
    "react-refresh",
    "@stylistic",
    "@tanstack/query",
  ],
  rules: {
    "prefer-const": "off",
    // Note: you must disable the base rule as it can report incorrect errors
    "require-await": "off",
    "import/order": [1, { groups: ["builtin", "external", "parent", "sibling", "index"] }],
    "arrow-body-style": ["off"],
    "@stylistic/space-before-blocks": ["warn", "always"],

    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "{}": false,
        },
        extendDefaults: true,
      },
    ],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],
    "@typescript-eslint/require-await": "error",

    "tailwindcss/no-custom-classname": ["warn", {
      callees: ["classnames", "clsx", "ctl", "cva", "tv", "twMerge"],
      skipClassAttribute: true,
    }],

    "import/no-relative-packages": "off",
    "import/extensions": [
      "off",
    ],
    "import/no-cycle": "off",
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": ["off"],

    "react/react-in-jsx-scope": "off",
    "react/jsx-max-props-per-line": [1, { maximum: 1 }],
    "react/jsx-curly-spacing": [1, { when: "never", children: true }],
    "react/jsx-closing-bracket-location": [1, "tag-aligned"],
    "react/jsx-props-no-multi-spaces": "warn",
    "react/jsx-tag-spacing": ["warn", {
      closingSlash: "never",
      beforeSelfClosing: "always",
      afterOpening: "never",
      beforeClosing: "allow",
    }],
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "react/require-default-props": "off",
    "react/no-array-index-key": "off",
    "react/destructuring-assignment": "off",
    "react/prop-types": "off",
    "semi": "off",
    "@stylistic/semi": ["warn", "never"],
    "@typescript-eslint/type-annotation-spacing": "warn",
    "@typescript-eslint/member-delimiter-style": ["warn", {
      multiline: {
        delimiter: "none",
        requireLast: true,
      },
      singleline: {
        delimiter: "semi",
        requireLast: false,
      },
      multilineDetection: "brackets",
    }],

    "react/jsx-no-bind": ["off"],
    "react/jsx-props-no-spreading": ["off"],
    "react/jsx-filename-extension": [1, {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }],
    "react/function-component-definition": [0],
    "react/jsx-no-useless-fragment": [0],
    "react/no-unstable-nested-components": [0],
    "react-refresh/only-export-components": ["warn", {
      allowConstantExport: true,
    }],

    "@typescript-eslint/no-misused-promises": ["warn", {
      checksVoidReturn: {
        attributes: false
      }
    }],

    "no-param-reassign": ["error", { props: false }],
    "no-shadow": ["error", {
      allow: [
        "className", "resolve", "reject"
      ]
    }],
    "no-multi-assign": ["error", { ignoreNonDeclaration: true }],

    "react/jsx-no-leaked-render": ["warn"],
    "no-nested-ternary": "off",
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

    "jsx-a11y/control-has-associated-label": [2, {
      labelAttributes: ["label"],
      controlComponents: ["CustomComponent"],
      ignoreElements: [
        "th",
      ],
      ignoreRoles: [
      ],
      depth: 3,
    }],
    "jsx-a11y/heading-has-content": "off"
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: ["tsconfig.json"],
      },
      node: {
        project: ["tsconfig.json"],
      },
    },
    "tailwindcss": {
      callees: ["classnames", "clsx", "cn", "ctl", "cva", "tv", "twMerge"],
      config: "tailwind.config.ts", // returned from `loadConfig()` utility if not provided
    },
  },
}
