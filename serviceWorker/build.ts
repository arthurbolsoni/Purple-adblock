
import { defineConfig } from 'vite'
import { build } from 'vite'
import path from 'path'

export async function buildServiceWorker(dev: boolean) {
    const worker = defineConfig({
        root: __dirname,
        define: {
            global: 'self',
        },
        build: {
            rollupOptions: {
                input: {
                    app: path.resolve(__dirname, 'src/app.worker.ts'),
                },
                output: {
                    entryFileNames: 'app.worker.js',
                },
            },
            minify: 'terser',
            sourcemap: dev,
        },
    });

    await build(worker);

    const index = defineConfig({
        root: __dirname,
        define: {
            global: 'self',
        },
        build: {
            rollupOptions: {
                input: {
                    index: path.resolve(__dirname, 'src/index.ts'),
                },
                output: {
                    entryFileNames: 'bundle.js',
                }
            },
            sourcemap: dev
        },
    });

    await build(index);
}

buildServiceWorker(false);