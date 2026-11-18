import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // "#src/..." points to dist/ at runtime (package.json "imports"); tests read src/ directly
    alias: [{ find: /^#src\/(.*)$/, replacement: `${import.meta.dirname}/src/$1` }],
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
