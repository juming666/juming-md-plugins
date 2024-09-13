import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// eslint官方推荐的从低版本迁移到eslint V9版本的配置，https://classic.yarnpkg.com/en/package/@eslint/eslintrc
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
  allConfig: pluginJs.configs.all
});

export default [
  ...compat.extends('juming'),
  ...compat.env({
    es2020: true,
    node: true
  }),

  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
];
