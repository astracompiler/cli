import { select } from "@inquirer/prompts";
import got, { RequestError } from "got";
import log from "signale";
import {
	cache,
	getVersionPath,
	isVersionInstalled,
	listOfAvailableVersions,
} from "./helpers/cache.ts";
import chalk from "chalk";
import nameparse, { generate, isLTS } from "./helpers/nameparse.ts";
import semver from "semver";
import os from "node:os";
import install from "./install.ts";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import getConfig from "./helpers/configloader.ts";
import temp from "temp";
import { inject } from "postject";
import { spawnSync } from "node:child_process";
import shasumMatch from "./helpers/shasum.ts";
import { readPackage } from "read-pkg";
import rcedit from "./helpers/rcedit.ts";
import isWineInstalled from "./helpers/iswineinstalled.ts";
import { canRunWindowsExeNatively } from "cross-spawn-windows-exe";

// steps for building exe (4 steps: build, generate blob, inject blob, set metadata)
const STEPS = 4;
function step(curr: number) {
	return chalk.grey(`[${curr}/${STEPS}]`);
}

export default async function build({
	outDir,
	node,
	disShasumCheck,
	entry,
	noMetadata,
}: {
	outDir: string;
	node: string;
	disShasumCheck: boolean;
	entry: string;
	noMetadata: boolean;
}) {
	if (!entry) {
		try {
			const pack = await readPackage();
			if (pack.main) {
				entry = path.resolve(pack.main);
			}
		} catch {
			log.error(
				"Cloud not find main file in package.json. Please specify a file to build.",
			);
			process.exit(1);
		}
	}
	if (!fs.existsSync(entry)) {
		log.error(`File ${chalk.red(entry)} does not exists!`);
		process.exit(1);
	}
	if (fs.statSync(entry).isDirectory()) {
		log.error(`Path ${chalk.red(entry)} is not a file!`);
		process.exit(1);
	}
	if (
		![".js", ".cjs", ".mjs", ".ts", ".cts", ".mts"].includes(
			path.parse(entry).ext,
		)
	) {
		log.error(
			`File ${chalk.red(entry)} is not a ${chalk.yellow("JavaScript")}/${chalk.blue("TypeScript")} file!`,
		);
		process.exit(1);
	}

	let offline = false;
	let res: { assets: { name: string }[] } = { assets: [] };

	try {
		await got(
			"https://api.github.com/repos/astracompiler/binaries/releases/latest",
			{
				headers: {
					"User-Agent": "AstraCLI",
				},
			},
		);
	} catch (err) {
		if (err instanceof RequestError && err.code === "ENOTFOUND") {
			log.warn("You are in offline mode. Some features may not work properly.");
			offline = true;
		}
	}
	if (!offline) {
		res = await got(
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
	} else {
		res = { assets: listOfAvailableVersions().map((v) => ({ name: v })) };
	}

	let argsProvided = false;
	let versionName: string;
	const config = await getConfig();

	// validate arguments
	const argsValidate = [outDir, node].filter((arg) => arg !== undefined);
	if (argsValidate.length < 2 && argsValidate.length > 0) {
		log.error(
			`You must provide all arguments or none of them! Current arguments: ${argsValidate.join(", ")}`,
		);
		process.exit(1);
	} else if (argsValidate.length === 2) {
		argsProvided = true;
	}
	if (res.assets.length === 0) {
		log.error(
			"You have no versions installed, you have to connect to the internet to download new ones... Sorry!",
		);
		process.exit(1);
	}

	// verify version
	const nodeFile = `${node}.exe`;
	const nodeLTSFile = `${node}-lts.exe`;

	if (argsProvided) {
		const availableAssets = res.assets.map(
			(asset: { name: string }) => asset.name,
		);

		if (!availableAssets.includes(nodeFile)) {
			if (!availableAssets.includes(nodeLTSFile)) {
				log.error(`Version ${chalk.red(nodeFile)} is not available!`);
				process.exit(1);
			}
		}
	}

	//
	// end of validation
	//

	if (!argsProvided) {
		let versions = res.assets;
		interface VersionAsset {
			name: string;
			os: string;
			arch: string;
			version: string;
			isLTS: boolean;
		}

		versions = res.assets
			.map((asset: { name: string }) => asset.name)
			.map((name: string) => nameparse(name) as VersionAsset)
			.sort((a: VersionAsset, b: VersionAsset) =>
				semver.compare(b.version, a.version),
			);
		const versionAssets: VersionAsset[] = versions as VersionAsset[];
		const displayedVersions = versionAssets.map((version) => ({
			name: `${chalk.green(version.version)} ${chalk.yellow(version.os)} ${chalk.gray(version.arch)} ${version.isLTS ? chalk.green("LTS") : ""}`,
			value: generate({
				arch: version.arch as "x64" | "x86" | "arm64",
				os: version.os as "win" | "linux" | "macos",
				isLTS: version.isLTS,
				version: version.version,
			}),
		}));
		console.log(chalk.blueBright.bold("Tips:"));
		console.log(
			chalk.greenBright(
				`1. Architecture of your system is ${chalk.yellowBright(os.arch())}`,
			),
		);
		console.log(
			chalk.greenBright(
				`2. Your node version is ${chalk.yellowBright(process.version)}`,
			),
		);
		console.log(
			chalk.greenBright(
				`3. If you don't know which version to choose, select the latest LTS version or type ${chalk.gray("node -v")} in your terminal`,
			),
		);
		console.log();
		versionName = await select({
			message: "Select a version of your project",
			choices: displayedVersions,
		});
	} else {
		const lts = await isLTS(node);
		versionName = generate({ ...nameparse(`${node}.exe`), isLTS: lts });
	}

	if (!isVersionInstalled(`${versionName}.exe`) && !offline) {
		log.start(`Installing ${versionName.replace("-lts", "")}...`);
		await install({ ver: versionName.replace("-lts", "") });
	} else if (!offline) {
		if (!disShasumCheck) {
			const shasum = await shasumMatch(getVersionPath(`${versionName}.exe`));
			if (!shasum) {
				log.error("Shasum does NOT match!! Reinstalling node...");
				await install({ ver: versionName.replace("-lts", "") });
			}
		}
		log.info("Version already installed.");
	}

	if (!fs.existsSync(config?.exe.icon) && config?.exe.icon) {
		log.warn(
			`Icon file ${chalk.red(config?.exe.icon)} does not exist. Metadata setting will be skipped.`,
		);
		noMetadata = true;
	}

	// build step 1
	log.start(`${step(1)} Building project...`);

	const nodePath = config?.outFile
		? path.resolve(config.outFile)
		: path.join(
				config?.outDir || outDir || path.join(process.cwd(), "dist"),
				"build.exe",
			);

	const blobPath = temp.path({ suffix: ".astra.blob" });

	const seaConfigPath = temp.path({ suffix: ".astra.json" });

	if (!fs.existsSync(path.dirname(nodePath))) {
		fs.mkdirSync(path.dirname(nodePath), { recursive: true });
	}

	const esbuildConfig = {
		minify: true,
		...config?.esbuild,
		entryPoints: [entry],
		write: false,
		format: "cjs",
		splitting: false,
		bundle: true,
		platform: "node",
	} satisfies esbuild.BuildOptions;

	const bundle = esbuild.buildSync(esbuildConfig);

	const outPathEsbuild = temp.path({ suffix: ".astra.cjs" });

	if (bundle.outputFiles && bundle.outputFiles.length > 0) {
		fs.writeFileSync(outPathEsbuild, bundle.outputFiles[0].text);
	} else {
		log.error("No output files generated by esbuild.");
		process.exit(1);
	}

	log.success("Project built!");

	// copy node to dist
	fs.copyFileSync(getVersionPath(`${versionName}.exe`), nodePath);
	fs.chmodSync(nodePath, 0o755);

	// meta step 2
	log.start(`${step(2)} Setting file metadata...`);

	function checkWine(meta: boolean) {
		if (meta && !isWineInstalled() && !canRunWindowsExeNatively()) {
			log.error(
				"Wine is not installed or not configured properly. Please install Wine to set file metadata.",
			);
			log.error("Download here: https://l.qwerty.ovh/astra-wine-dl");
			log.info(
				"If you don't want to set file metadata, use --noMetadata flag or set it in the config.",
			);
			process.exit(1);
		}
	}

	if (noMetadata === true) {
		log.info("Setting file metadata skipped...");
	} else if (config?.modifyMetadata === false) {
		log.info("Setting file metadata skipped...");
	} else {
		checkWine(noMetadata);
		let iconpath: string | undefined;
		try {
			iconpath = path.resolve(config?.exe.icon);
		} catch {
			iconpath = undefined;
		}
		await rcedit(nodePath, {
			icon: iconpath,
			"version-string": {
				CompanyName: config?.exe.companyName || os.userInfo().username,
				FileDescription: config?.exe.fileDescription || "Node.js application",
				ProductName: config?.exe.productName || "Node.js application",
				LegalCopyright:
					config?.exe.copyright ||
					`© ${new Date().getFullYear()} Astra Compiler & Node.js contributors`,
			},
			"file-version": config?.exe.fileVersion || "1.0.0",
			"product-version": config?.exe.productVersion || "1.0.0",
		});

		log.success("File metadata set!");
	}

	// blob step 3
	log.start(`${step(3)} Generating blob...`);

	const nodeBlobConfig = {
		main: outPathEsbuild,
		output: blobPath,
		disableExperimentalSEAWarning: true,
		assets: config?.assets || {},
		loader: {
			node: true,
		},
	};

	fs.writeFileSync(seaConfigPath, JSON.stringify(nodeBlobConfig));
	const nodeProcess = spawnSync(
		"node",
		["--experimental-sea-config", seaConfigPath],
		{ encoding: "utf-8" },
	);
	if (nodeProcess.status !== 0) {
		new log.Signale({ scope: "node" }).error(nodeProcess.stderr);
		new log.Signale({ scope: "node" }).info(nodeProcess.stdout);
		process.exit(1);
	}
	new log.Signale({ scope: "node" }).info(nodeProcess.stdout);
	log.success("Blob generated!");

	// inject step 4
	log.start(`${step(4)} Injecting blob...`);
	await inject(nodePath, "NODE_SEA_BLOB", fs.readFileSync(blobPath), {
		sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
	});
	log.success("Blob injected!");

	console.log();
	log.complete("Project built successfully! 🚀");
	log.info(
		`You can now run your project by typing ${chalk.yellowBright(`"${nodePath}"`)}`,
	);
	log.info(
		`Wanna use this preset later? Copy this command: \n${chalk.yellowBright(`astra build "${path.resolve(entry)}" -o "${nodePath}" -n "${versionName}" ${disShasumCheck ? "--disShasumCheck" : ""} ${noMetadata ? "--noMetadata" : ""}`)}`,
	);
}
