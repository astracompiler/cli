import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { KeyvFile } from "keyv-file";
import Keyv from "keyv";
const cacheDir = path.join(os.homedir(), ".astra");
export function listOfAvailableVersions() {
	const versionsDir = path.join(cacheDir, "versions");
	const versions = fs.readdirSync(versionsDir);
	return versions;
}
export function isVersionInstalled(version: string) {
	const versions = listOfAvailableVersions();
	return versions.includes(version);
}
export function getVersionPath(version: string) {
	return path.join(cacheDir, "versions", version);
}
export const cache = new Keyv({
	store: new KeyvFile({
		filename: path.join(os.homedir(), ".astra", "cache.json"),
		writeDelay: 100, // Delay to write to file (in ms)
		expiredCheckDelay: 1000 * 60 * 60, // Check for expired keys every hour
		serialize: JSON.stringify,
		deserialize: JSON.parse,
	}),
});
