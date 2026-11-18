/// <reference types="vitest/config" />
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // ต้องอยู่ก่อน react(): สร้าง src/routeTree.gen.ts จากไฟล์ใน src/routes
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  // "@/..." = src/ (keep in sync with paths in tsconfig.app.json; also used by Vitest and Storybook)
  resolve: { alias: { '@': `${import.meta.dirname}/src` } },
  server: {
    // ตอน dev ส่ง /api ไปที่ NestJS (port 3000) ให้เหมือนตอน production ที่ใช้ domain เดียวกัน
    proxy: { '/api': 'http://localhost:3000' },
  },
  test: {
    projects: [
      {
        // unit test ของ logic: src/**/*.test.ts
        extends: true,
        test: { name: 'unit', include: ['src/**/*.test.{ts,tsx}'], environment: 'node' },
      },
      {
        // ทุก story ใน Storybook ถูกรันเป็น test ใน Chromium (headless)
        extends: true,
        plugins: [storybookTest({ configDir: `${import.meta.dirname}/.storybook` })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
