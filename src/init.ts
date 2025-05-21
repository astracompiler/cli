import { dirname } from "dirname-filename-esm";
import fs from "node:fs";
import log from "signale";

export default async function init() {
	log.info("Initializing your project...");
	if (fs.existsSync("astra.config.js")) {
		log.success("Project already initialized!");
		process.exit(0);
	}
	try {
		const pwd = process.cwd();
		fs.copyFileSync(
			`${dirname(import.meta)}/config.js`,
			`${pwd}/astra.config.js`,
		);
	} catch (error) {
		log.error("Error initializing project:", error);
		process.exit(1);
	}
	log.success("Project initialized!");
}
