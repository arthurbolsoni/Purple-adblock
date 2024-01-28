
import { defineConfig } from 'vite'
import { build } from 'vite'

const vitebuild = async () => {
    const worker = defineConfig({
        define: {
            global: 'self',
        },
        build: {
            rollupOptions: {
                input: {
                    app: './src/app.worker.ts',
                },
                output: {
                    entryFileNames: 'app.worker.js',
                },
            },
            minify: 'terser',
            sourcemap: true
        },
    });

    await build(worker);

    const index = defineConfig({
        define: {
            global: 'self',
        },
        build: {
            rollupOptions: {
                input: {
                    index: './src/index.ts',
                },
                output: {
                    entryFileNames: 'bundle.js',
                },
            },
        },
    });

    await build(index);
}

vitebuild();