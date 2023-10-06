import { fileURLToPath, URL } from "url";
import {node} from '../../.electron-vendors.cache.json';
import {join} from 'node:path';
// import {injectAppVersion} from '../../version/inject-app-version-plugin.mjs';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
console.log(fileURLToPath(new URL('./src/', import.meta.url)))
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  resolve: {
    alias: [
        // { find: '@', replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
    //   '/@/': join(PACKAGE_ROOT, 'src') + '/',
    ],
  },
  build: {
    ssr: true,
    sourcemap: process.env.MODE !== 'development' ? 'hidden':'inline',
    target: `node${node}`,
    outDir: 'dist',
    assetsDir: '.',
    minify: process.env.MODE !== 'development',
    lib: {
      entry: 'src/index.cjs',
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
//   plugins: [injectAppVersion()],
};

export default config;
