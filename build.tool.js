// @ts-check
import esb from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import signale from 'signale';

await esb.build({
    entryPoints: ['./src/astra.ts'],
    bundle: true,
    minify: true,
    platform: 'node',
    outfile: './dist/astra.js',
    format: 'esm',
    plugins: [nodeExternalsPlugin()],
})
signale.success('Build completed successfully!');