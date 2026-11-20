import nkzw from '@nkzw/eslint-config';
import reactThree from '@react-three/eslint-plugin';

export default [
  {
    ignores: ['**/dist/*', 'src/assets.generated.ts']
  },
  {
    plugins: {
      '@react-three': reactThree
    }
  },
  ...nkzw,
  {
    rules: {
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'import-x/no-unresolved': ['error', { ignore: ['^bun:'] }],
      'prefer-arrow-callback': 'error',
      // Ported code predates the React Compiler rules; tracked as warnings
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react/no-unknown-property': 'off',
      'unicorn/consistent-function-scoping': [
        'error',
        { checkArrowFunctions: false }
      ]
    }
  }
];
