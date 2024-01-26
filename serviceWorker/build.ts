import Bun, { BunPlugin } from 'bun';

const jsAssetPlugin: BunPlugin = {
    name: 'JSAsset',
    setup(build) {
        const fs = require('fs');
        // load .js files with the text plugin
        build.onLoad({ filter: /\.js$/ }, async (args) => {
            const text = await fs.readFileSync(args.path, 'utf8');
            return {
                contents: text,
                loader: 'text',
            };
        });
    },
};

(async () => {
    console.log('Building worker');

    const worker = await Bun.build({
        entrypoints: ['./src/app.worker.ts'],
        outdir: './dist',
        minify: true,
        format: 'esm',
    })

    if (worker.logs?.length) {
        console.log('Worker build failed')
        console.log(worker.logs)
        throw new Error('Worker build failed')
    }

    console.log('Building inject script');

    const inject = await Bun.build({
        entrypoints: ['./src/index.ts'],
        outdir: './dist',
        plugins: [jsAssetPlugin],
        loader: {
            './app.worker.js': 'text',
        },
        minify: true,
        format: 'esm',
    })

    if (inject.logs?.length) {
        console.log('Inject build failed')
        console.log(inject.logs)
        throw new Error('Inject build failed')
    }

    // rename index.js to bundle.js
    const fs = require('fs');
    fs.renameSync('./dist/index.js', './dist/bundle.js')

    console.log('Build complete')


})()