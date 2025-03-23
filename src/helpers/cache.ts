import os from 'os';
import path from 'path';
import fs from 'fs';
const cacheDir = path.join(os.homedir(), '.astra');
export function listOfAvailableVersions() {
    const versionsDir = path.join(cacheDir, 'versions');
    const versions = fs.readdirSync(versionsDir);
    return versions;
}
export function isVersionInstalled(version: string) {
    const versions = listOfAvailableVersions();
    return versions.includes(version);
}
export function getVersionPath(version: string) {
    return path.join(cacheDir, 'versions', version)
}