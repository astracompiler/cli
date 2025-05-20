import { cosmiconfig } from "cosmiconfig";

const explorer = cosmiconfig("astra", {
	searchPlaces: ["astra.config.js", "astra.config.cjs", "astra.config.mjs"],
});
const config = await explorer.search(process.cwd());

export default function getConfig() {
	return config?.config;
}
