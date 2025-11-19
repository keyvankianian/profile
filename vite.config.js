import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Using a relative base ensures the production bundle works whether the site is
  // served from a custom domain root (keyvankianian.se) or the GitHub Pages
  // project path (https://<username>.github.io/profile/).
  base: './',
  server: {
    port: 5173,
    open: true
  }
});
