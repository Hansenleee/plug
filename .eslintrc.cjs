module.exports = {
  extends: ["eslint-config-ali/typescript/node", "plugin:prettier/recommended"],
  env: {
    node: true,
    browser: false
  },
  rules: {
    "require-atomic-updates": "off",
    "no-param-reassign": "off"
  }
}
