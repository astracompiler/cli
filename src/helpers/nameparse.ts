import got from "got";
import path from "node:path";
import { cache } from "../astra.js";

export default function nameparse(name: string): {
	arch: "x86" | "x64" | "arm64";
	os: "win" | "linux" | "macos";
	isLTS: boolean;
	version: string;
} {
	let string: string;
	if (name.endsWith(".exe")) {
		string = path.parse(name).name;
	} else {
		string = name;
	}
	string = string.replace("node_", "");
	const data = string.split("-");
	const version = data[0];
	const os = data[1];
	const arch = data[2];
	const isLTS = data[3] === "lts";
	// e.g. node_v20.18.3-win-arm64-lts
	return {
		arch: arch as "x86" | "x64" | "arm64",
		os: os as "win" | "linux" | "macos",
		isLTS,
		version,
	};
}
export async function isLTS(name: string): Promise<boolean> {
	const parsedName = nameparse(name);
	const version = parsedName.version;

	try {
		const response = await got(
			"https://api.github.com/repos/astracompiler/binaries/releases/latest",
			{
				headers: {
					"User-Agent": "AstraCLI",
				},
				cache: {
					get: (key: string) => cache.get(key),
					set: (key: string, value: unknown) => cache.set(key, value),
					delete: (key: string) => cache.delete(key),
					clear: () => cache.clear(),
				},
			},
		).json();
		const latestRelease = response as Record<string, unknown>;
		const assets = Array.isArray(
			(latestRelease as { assets: { name: string }[] }).assets,
		)
			? (latestRelease as { assets: { name: string }[] }).assets
			: [];
		const ltsVersions = assets
			.map((asset) => asset.name)
			.filter((name: string) => name.includes("lts"));

		return ltsVersions.some((ltsVersion: string) =>
			ltsVersion.includes(version),
		);
	} catch (error) {
		console.error("Error fetching the latest release:", error);
		return false;
	}
}

export function generate(options: {
	arch: "x64" | "x86" | "arm64";
	os: "win" | "linux" | "macos";
	isLTS: boolean;
	version: string;
}) {
	return `node_${options.version}-${options.os}-${options.arch}${options.isLTS ? "-lts" : ""}`;
}
