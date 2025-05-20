import os from "node:os";
import path from "node:path";
import fs from "node:fs";
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
