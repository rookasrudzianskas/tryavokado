import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    include: ["lib/**/*.test.ts", "tests/unit/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://localhost:5432/avokado_test",
      BETTER_AUTH_SECRET: "test-secret-at-least-16-characters-long",
      ENCRYPTION_KEY: "dGVzdC1lbmNyeXB0aW9uLWtleS0zMmJ5dGVzLWFiY2RlMTI=",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      AVOKADO_MODE: "mock",
    },
  },
});
