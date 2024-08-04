module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'error',
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'import/extensions': 'off',
    'react/jsx-filename-extension': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-unused-expressions': 'off',
    'no-restricted-exports': 'off',
    'no-loop-func': 'off',
    'react/function-component-definition': 'off',
    'react/no-unused-prop-types': 'off',
    'prettier/prettier': 'off',
    'react/destructuring-assignment': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'no-restricted-syntax': 'off'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
