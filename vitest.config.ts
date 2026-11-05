import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    // Node only: these cover the data layer, the scraper parsers and API route guards, not React.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // A test that imports an API route pulls in the route's whole module graph,
    // and on a cold cache the transform alone can outlast vitest's 5s default:
    // the first run after adding tests/groq-model.test.ts failed on timeouts and
    // the second passed 105/105. cron-auth was already at 3.2s, one slow machine
    // away from the same thing. A flaky suite is worse than a slow one.
    testTimeout: 30_000,
  },
  resolve: {
    // tsconfig's "@/*" → repo root, so API route modules can be imported as they are
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
