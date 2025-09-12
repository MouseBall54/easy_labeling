// Simple ESLint config for TypeScript migration
module.exports = [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly'
      }
    },
    rules: {
      'no-console': 'off', // Allow console during migration
      'no-debugger': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error'
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'public/',
      'webpack.config.js',
      'eslint.config.js'
    ]
  }
];