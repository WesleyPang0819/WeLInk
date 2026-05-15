import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        manifest: false, // We're using a separate manifest.webmanifest file
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          navigateFallbackDenylist: [/^\/api/, /supabase\.co/],
          runtimeCaching: [],
          skipWaiting: true,
        }
      })
    ],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
