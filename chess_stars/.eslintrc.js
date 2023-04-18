module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // enable parsing latest ECMAScript
    sourceType: 'module', // allow use of imports
  },
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'eslint:recommended',
    'google',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    semi: 'off',
    indent: 'off',
    'max-len': ['off', { ignoreTemplateLiterals: true, ignoreStrings: true }],
    'quote-props': 'off',
    'operator-linebreak': 'off',
    'object-curly-spacing': 'off',
    'prettier/prettier': 'off',
    camelcase: 'off',
    'require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: false,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          String: false,
          Boolean: false,
          Number: false,
          Symbol: false,
          '{}': false,
          Object: false,
          object: false,
          Function: false,
        },
        extendDefaults: true,
      },
    ],
  },
}
