module.exports = {
  extends: ["eslint-config-ali/typescript/node", "eslint-config-ali/typescript/react", "plugin:prettier/recommended"],
  env: {
    node: true,
    browser: false
  },
  rules: {
    "require-atomic-updates": "off"
  }
}
