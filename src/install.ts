import semver from "semver";
import log from "signale";
import nameparse, { generate, isLTS } from "./helpers/nameparse.js";
import prgss from "cli-progress";
import { select } from "@inquirer/prompts";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import got, { RequestError } from "got";
import { cache } from "./helpers/cache.js";
export default async function install({ ver }: { ver: string }) {
	let versionName: string;
	try {
		await got("https://google.com", {
			headers: {
				"User-Agent": "AstraCLI",
			},
		});
	} catch (err) {
		if (err instanceof RequestError && err.code === "ENOTFOUND") {
			log.error(
				"Could not connect to Internet. Please check your internet connection.",
			);
			process.exit(1);
		}
	}
	const res = (await got(
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
	).json()) as Record<string, unknown>;
	if (ver) {
		const regex = /^node_v(\d+\.\d+\.\d+)-([a-z]+)-(x86|x64|arm64)$/;
		const lts = await isLTS(ver);
		versionName = generate({ ...nameparse(`${ver}.exe`), isLTS: lts });
		if (!regex.test(ver)) {
			log.error(
				"Invalid version format. Please use the format node_{version}-{platform}-{arch}",
			);
			process.exit(1);
		}
	} else {
		const assets: Record<string, unknown>[] = res.assets as Record<
			string,
			unknown
		>[];
		const versions = assets
			.map((asset) => asset.name)
			.map((name) => nameparse(name as string))
			.sort((a: { version: string }, b: { version: string }) =>
				semver.compare(b.version, a.version),
			);
		const choices = versions.map(
			(version: {
				arch: "x64" | "x86" | "arm64";
				os: "win" | "linux" | "macos";
				isLTS: boolean;
				version: string;
			}) => ({
				name: `${chalk.green(version.version)} ${chalk.yellow(version.os)} ${chalk.gray(version.arch)} ${version.isLTS ? chalk.green("LTS") : ""}`,
				value: generate(version),
			}),
		);
		// console.log(chalk.blueBright.bold("Tips:"))
		// console.log(chalk.greenBright("1. Architecture of your system is " + chalk.yellowBright(os.arch())))
		// console.log(chalk.greenBright(`2. If you don't know which version to choose, select the latest LTS version or type ${chalk.gray("node -v")} in your terminal`));
		// console.log()
		versionName = await select({
			message: "Select a version to install",
			choices: choices,
		});
	}
	log.start(`Downloading ${versionName}...`);
	const versionFilename = `${versionName}.exe`;
	const writer = fs.createWriteStream(
		path.join(os.homedir(), ".astra", "versions", versionFilename),
	);
	if (
		!fs.existsSync(path.join(os.homedir(), ".astra", "versions", versionName))
	) {
		const bar = new prgss.SingleBar({}, prgss.Presets.shades_classic);
		bar.start(100, 0);
		const assets = res.assets as {
			name: string;
			browser_download_url: string;
		}[];
		const asset = assets.find((asset) => asset.name === versionFilename);
		if (!asset) {
			log.error(`Asset ${versionFilename} not found in release assets.`);
			process.exit(1);
		}
		const response = got.stream(asset.browser_download_url, {
			method: "GET",
			headers: {
				"User-Agent": "AstraCLI",
			},
		});
		response.on("data", () => {
			bar.update(Number((response.downloadProgress.percent * 100).toFixed(0)));
		});
		await new Promise((resolve, reject) => {
			response.pipe(writer); // Poprawione: response zamiast response.data

			writer.on("finish", () => {
				bar.stop();
				log.success(`Successfully downloaded ${versionName}!`);
				resolve(null);
			});

			writer.on("error", reject);
		});
	}
}
