// @ts-check
import fs from "node:fs";
import signale from "signale";
import { minify } from "terser";

const IGNORE = ["config.js"];

const files = fs.globSync("dist/**/*.js", {
	exclude: (filename) => IGNORE.includes(filename),
});
for (const file of files) {
	const code = fs.readFileSync(file, "utf8");
	const minified = await minify(code, {
		module: true,
		ecma: 2020,
		compress: {
			module: true,
			toplevel: true,
		},
		format: {
			comments: false,
		},
	});
	// @ts-expect-error;
	fs.writeFileSync(file, Buffer.from(minified.code));
}
signale.success("Minified all files!");
