// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

const PACKAGE_ROOT = path.resolve(__dirname, 'src/renderer')
export default defineConfig({
    root: PACKAGE_ROOT, 
    base: './', 
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true, 
        sourcemap: false,
        minify: true,
        rollupOptions: {
            input:{
                index: path.join(PACKAGE_ROOT, 'index.html'),
                setting: path.join(PACKAGE_ROOT, 'setting.html'),
                license: path.join(PACKAGE_ROOT, 'register.html'),
                detail: path.join(PACKAGE_ROOT, 'detail.html'),
            }
        },
        // Target Electron renderer process with the 'chrome' version
        // corresponding to the Electron version you are using.
        target: 'chrome89', // Example: replace '89' with the version of Chrome in your Electron
    },
    css: {
        postcss: {
            plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
            ],
        },
    },
    server: {
        port: 3000 
    },
});
