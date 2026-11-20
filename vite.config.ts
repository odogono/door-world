// Dev playground only - the package itself ships its TypeScript source.
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: { outDir: '../dist' },
  plugins: [react(), tailwindcss()],
  root: 'dev'
});
