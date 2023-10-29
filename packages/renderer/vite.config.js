/* eslint-env node */

import {chrome} from '../../.electron-vendors.cache.json';
// import {renderer} from 'unplugin-auto-expose';
import {join} from 'node:path';
// import {injectAppVersion} from '../../version/inject-app-version-plugin.mjs';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  publicDir: join(PACKAGE_ROOT,'assets'),
  envDir: PROJECT_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
        input:{
            index: join(PACKAGE_ROOT, 'index.html'),
            setting: join(PACKAGE_ROOT, 'setting.html'),
            detail: join(PACKAGE_ROOT, 'detail.html'),
            register: join(PACKAGE_ROOT, 'register.html'),
        }
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  test: {
    environment: 'happy-dom',
  },
  plugins: [
    // renderer.vite({
    //   preloadEntry: join(PACKAGE_ROOT, '../preload/src/index.js'),
    // }),
    // injectAppVersion(),
  ],
};

export default config;
