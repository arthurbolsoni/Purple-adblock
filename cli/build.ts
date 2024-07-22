import { buildChrome } from './chrome_builder.js';
import { buildFirefox } from './firefox_builder.js';

async function main() {
    const task = process.argv[2];
    const dev = task === 'dev';

    try {
        await Promise.all([
            buildChrome(dev),
            buildFirefox(dev),
        ]);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
