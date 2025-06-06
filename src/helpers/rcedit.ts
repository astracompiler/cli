// (C) Electron.js Contributors & Astra Contributors
// Based on node-rcedit (https://github.com/electron/node-rcedit/)

import {
	canRunWindowsExeNatively,
	normalizePath,
	spawnExe,
} from "cross-spawn-windows-exe";
import isWineInstalled from "./iswineinstalled.ts";

const pairSettings = ["version-string", "resource-string"];
const singleSettings = [
	"file-version",
	"product-version",
	"icon",
	"requested-execution-level",
];
const noPrefixSettings = ["application-manifest"];

export default async function rcedit(exe: string, options: Rcedit.Options) {
	const pathToExe = await normalizePath(exe);
	const usingWine = isWineInstalled() && !canRunWindowsExeNatively();
	const rceditExe = isx64()
		? "node_modules/rcedit/bin/rcedit-x64.exe"
		: "node_modules/rcedit/bin/rcedit.exe";

	const args = [];
	
	if (usingWine) args.push("wine");
	args.push(rceditExe, pathToExe);

	for (const name of pairSettings as (keyof Rcedit.Options)[]) {
		if ((options as Record<string, unknown>)[name]) {
			for (const [key, value] of Object.entries(
				(options as Record<string, object>)[name],
			)) {
				args.push(`--set-${name}`, key, value as string);
			}
		}
	}

	for (const name of singleSettings) {
		if ((options as Record<string, unknown>)[name]) {
			args.push(`--set-${name}`, (options as Record<string, string>)[name]);
		}
	}

	for (const name of noPrefixSettings) {
		if ((options as Record<string, unknown>)[name]) {
			args.push(`--${name}`, (options as Record<string, string>)[name]);
		}
	}

	const spawnOptions = {
		env: { ...process.env },
	};

	if (!canRunWindowsExeNatively()) {
		// Suppress "fixme:" stderr log messages
		spawnOptions.env.WINEDEBUG = "-all";
	}

	await spawnExe(rceditExe, args, spawnOptions);
}

function isx64(): boolean {
	return process.arch === "x64";
}
