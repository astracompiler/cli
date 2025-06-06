// (C) Electron.js Contributors & Astra Contributors
// Based on node-rcedit (https://github.com/electron/node-rcedit/)

import {
	canRunWindowsExeNatively,
	normalizePath,
	spawnExe,
} from "cross-spawn-windows-exe";
import isWineInstalled from "./iswineinstalled.ts";
import { dirname } from "dirname-filename-esm";
import path from "node:path";

const pairSettings = ["version-string", "resource-string"];
const singleSettings = [
	"file-version",
	"product-version",
	"icon",
	"requested-execution-level",
];
const noPrefixSettings = ["application-manifest"];
const __dirname = dirname(import.meta);
export default async function rcedit(exe: string, options: Rcedit.Options) {
	const node_modules = path.join(`${__dirname}/..`, "node_modules");
	const pathToExe = await normalizePath(exe);
	const usingWine = isWineInstalled() && !canRunWindowsExeNatively();
	const rceditExe = isx64()
		? path.join(node_modules, "/rcedit/bin/rcedit-x64.exe")
		: path.join(node_modules, "/rcedit/bin/rcedit.exe");

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

	try {
		await spawnExe(rceditExe, args, spawnOptions);
	} catch (error) {
		console.error("Error occurred while editing resource:", error);
	}
}

function isx64(): boolean {
	return process.arch === "x64";
}
