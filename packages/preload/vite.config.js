import { chrome } from '../../.electron-vendors.cache.json';
import { join } from 'node:path';
import { injectAppVersion } from '../../version/inject-app-version-plugin.mjs';

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
    mode: process.env.MODE,
    root: PACKAGE_ROOT,
    envDir: PROJECT_ROOT,
    build: {
        ssr: true,
        sourcemap: 'inline',
        target: `chrome${chrome}`,
        outDir: 'dist',
        assetsDir: '.',
        minify: process.env.MODE !== 'development',
        lib: {
            entry: 'src/main.ts',
            formats: ['cjs'],
        },
        rollupOptions: {
            input: {
                main: join(PACKAGE_ROOT, 'src/main.js'),
                settings: join(PACKAGE_ROOT, 'src/settings.js'),
            },
            output: {
                entryFileNames: '[name].cjs',
            },
        },
        emptyOutDir: true,
        reportCompressedSize: false,
    },
    plugins: [injectAppVersion()],
};

export default config;
