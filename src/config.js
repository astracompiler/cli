/**
 * @typedef {Object} Config
 * @property {string} [outFile] - Output file path
 * @property {string} [outDir] - Output directory
 * @property {Object} [esbuild] - esbuild options (see https://esbuild.github.io/api/)
 * @property {string[]} [assets] - Assets to include in the blob
 * @property {boolean} [modifyMetadata] - Defaults to true. If false, the metadata (icon, copyright) will not be modified.
 * @property {string} [githubToken] 
 * - GitHub token for authentication (use if you want more than 60 requests per hour)
 * - Astra uses Github API to download node releases and other assets.
 * - Paste your token to receive 5,000 requests per hour.
 * @property {{ icon: string | undefined, companyName: string | undefined, fileDescription: string | undefined, productName: string | undefined, fileVersion: string | undefined, productVersion: string | undefined, copyright: string | undefined }} [exe] - Application metadata (like icon, name, description etc.)
 */

/** @type {Config} */
export default {
	outFile: "dist/app.exe",

	esbuild: {
		// esbuild options (optional)
	},
	githubToken: process.env.GITHUB_TOKEN,
	modifyMetadata: true, // modify metadata of the executable (useful if you have macOS and don't have wine installed)

	exe: {
		companyName: "Your Company",
		productName: "Your App",
		fileDescription: "Your App Description",
		productVersion: "1.0.0",
		fileVersion: "1.0.0.0",
		icon: "path/to/icon.ico",
		copyright: "Copyright © 2023 Your Company",
	},
};
