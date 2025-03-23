// @ts-check
import fs from 'fs';
import signale from 'signale';
import { minify } from 'terser';

const files = fs.globSync('dist/**/*.js', { exclude: (filename) => 'configtypes.js' === filename });
for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    const minified = await minify(code, {
        module: true, // Włącza obsługę ESM (import/export)
        ecma: 2020, // Pozwala na top-level await i nowoczesne funkcje
        compress: {
            module: true, // Optymalizacje specyficzne dla ESM
            toplevel: true, // Usuwa nieużywany kod na najwyższym poziomie
        },
        format: {
            comments: false, // Usuwa komentarze
        },
    });
    // @ts-ignore
    fs.writeFileSync(file, Buffer.from(minified.code));
}
signale.success('Minified all files!');