import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.browser, ...globals.vitest }, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react, 'react-hooks': hooks },
    settings: { react: { version: '18' } },
    rules: { ...hooks.configs.recommended.rules, 'react/jsx-uses-vars': 'error', 'react/jsx-uses-react': 'off', 'react/jsx-key': 'error', 'react/jsx-no-undef': 'error', 'react/no-unknown-property': 'error', 'no-unused-vars': ['warn', { varsIgnorePattern: '^_|^[A-Z]|^motion$', argsIgnorePattern: '^_' }] },
  },
];
