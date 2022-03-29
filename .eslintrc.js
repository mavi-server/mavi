module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: '@babel/eslint-parser',
  extends: [
    'prettier',
  ],
  plugins: [
  ],
  rules: {
    'no-var': 'error',
    // 'no-console': 'error',
    'no-unused-vars': 'warn',
    'no-extra-semi': 'error',
    'no-delete-var': 'error',
    'arrow-parens': ['warn', "as-needed"],
    'array-bracket-spacing': ['warn', 'never'],
    'comma-dangle': ['warn', 'always-multiline'],
    'comma-spacing': ['warn', { 'before': false, 'after': true }],
    'comma-style': ['warn', 'last'],
    'semi': ['warn', 'always'],
    'space-before-blocks': ['warn', 'always'],
    'spaced-comment': ['warn', 'always'],
    'indent': ["error", 2, { "SwitchCase": 1 }],
  },
};