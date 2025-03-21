import { resolve } from 'node:path';
import nkzw from '@nkzw/eslint-config';
import { ReactThreeFiber } from '@react-three/fiber';

export default [
  {
    ignores: ['**/dist/*']
  },
  {
    plugins: {
      '@react-three': ReactThreeFiber
    }
  },
  ...nkzw,
  {
    rules: {
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error',
      'react/no-unknown-property': 'off'
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: resolve(process.cwd(), './tsconfig.app.json')
        }
      }
    }
  }
  // { ignores: ['dist'] },
  // {
  //   extends: [js.configs.recommended, eslintConfigPrettier],
  //   files: ['**/*.{ts,tsx}'],
  //   languageOptions: {
  //     ecmaVersion: 2020,
  //     globals: globals.browser
  //   },
  //   plugins: {
  //     'react-hooks': reactHooks,
  //     'react-refresh': reactRefresh
  //   },
  //   rules: {
  //     ...nkzw.rules,
  //     ...reactHooks.configs.recommended.rules,
  //     'arrow-body-style': ['error', 'as-needed'],
  //     'arrow-parens': ['error', 'as-needed'],
  //     'arrow-spacing': ['error', { after: true, before: true }],
  //     'func-style': ['error', 'arrow'],
  //     'no-var': 'error',
  //     'prefer-arrow-callback': 'error',
  //     'prefer-const': 'error',
  //     'react-refresh/only-export-components': [
  //       'warn',
  //       { allowConstantExport: true }
  //     ]
  //   }
  // }
];
