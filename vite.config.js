import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import packageJson from './package.json';

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
