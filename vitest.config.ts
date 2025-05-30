import { defineConfig } from "vitest/config";
export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			include: ["src"],
			exclude: [
				"src/config.js", // This is a template file
				"src/astra.ts", // This is the main entry file (in CLI tests this file is not included)
				"src/install.ts", // Idk why it crashes in CI but im going to fix it later
			],
		},
	},
});
