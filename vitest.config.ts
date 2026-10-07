import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    // Node only: these cover the data layer, the scraper parsers and API route guards, not React.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    // tsconfig's "@/*" → repo root, so API route modules can be imported as they are
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
