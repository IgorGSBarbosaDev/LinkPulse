import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', 'src/shared/config/swagger.ts'],
      thresholds: {
        lines: 55,
        functions: 60,
        statements: 55,
        branches: 50,
      },
    },
  },
})
