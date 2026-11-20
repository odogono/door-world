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
      'react/no-unknown-property': 'off',
      'unicorn/consistent-function-scoping': [
        'error',
        { checkArrowFunctions: false }
      ]
    }
  }
];
