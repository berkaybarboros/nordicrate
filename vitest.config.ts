import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node only: these cover the data layer and the scraper parsers, not React.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
