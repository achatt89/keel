import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH: '/keel/' on achatt89.github.io, '/' on a custom domain (set DOCS_DOMAIN in the Pages workflow).
export default defineConfig({
  base: (process.env.BASE_PATH || '/').replace(/\/?$/, '/'),
  plugins: [react()],
  // The pages are Keel's own files (../docs/site, ../release.json, ../plugins): read in place, never copied.
  server: { port: 4420, strictPort: true, fs: { allow: ['..'] } },
});
