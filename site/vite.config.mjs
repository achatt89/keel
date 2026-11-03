import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base '/' for the docs domain (keel.thelogicatelier.com, scripts/route-list.mjs); BASE_PATH=/keel/ only for achatt89.github.io/keel/.
export default defineConfig({
  base: (process.env.BASE_PATH || '/').replace(/\/?$/, '/'),
  plugins: [react()],
  // The pages are Keel's own files (../docs/site, ../release.json, ../plugins): read in place, never copied.
  server: { port: 4420, strictPort: true, fs: { allow: ['..'] } },
});
