import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      swc: {
        minify: false,
      },
    }),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(process.cwd(), 'node_modules'),
      src: path.resolve(process.cwd(), 'src'),
    },
  },
  server: {
    port: 3030,
    host: true, // ajouté pour le dev:host
  },
  preview: {
    port: 3030,
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
  },
});
