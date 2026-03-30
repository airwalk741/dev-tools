module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // [수준(0:안함, 1:경고, 2:에러), 적용시점(always, never), 허용할 단어 리스트]
    "scope-enum": [2, "always", ["api-client", "mock-factory", "root"]],
  },
};
