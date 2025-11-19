import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        YT: 'readonly'
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'no-console': ['warn', { allow: ['error'] }]
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs'
    }
  },
  {
    files: ['**/vite.config.js', '**/eslint.config.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module'
    }
  }
];
