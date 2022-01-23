module.exports = {
  env: {
    node: true,
    browser: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "indent": ["error", 2, { SwitchCase: 1 }],
    "linebreak-style": ["error", "unix"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-var-requires": "off",
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
  },
  /*
  "overrides": [
    {
      "files": "*.js",
      "rules": {
        "eslint-disable": 2
      }
    }
  ]
  */
};
