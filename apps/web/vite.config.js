import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const geojsonPlugin = {
  name: 'vite-plugin-geojson',
  transform(code, id) {
    if (id.endsWith('.geojson')) {
      return {
        code: `export default ${code};`,
        map: null,
      };
    }
  },
};

export default defineConfig({
  plugins: [react(), geojsonPlugin],
  envDir: '../../',
  server: {
    port: 5173,
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
