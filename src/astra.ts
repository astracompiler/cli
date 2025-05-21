#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import path from "node:path";
import { readPackage } from "read-pkg";
import log from "signale";
import { dirname } from "dirname-filename-esm";
import temp from "temp";
import fs from "node:fs";
import os from "node:os";
import semver from "semver";

temp.track();
const __dirname = dirname(import.meta);

if (semver.satisfies(process.version, "<20")) {
	log.fatal(`You are using an unsupported version of Node.js (${process.version}). Please upgrade to v20 or later.`);
	process.exit(1);
}

if (!fs.existsSync(path.join(os.homedir(), ".astra", "versions"))) {
	fs.mkdirSync(path.join(os.homedir(), ".astra", "versions"), {
		recursive: true,
	});
}

const VERSION = (await readPackage({ cwd: path.dirname(__dirname) })).version;

process.on("uncaughtException", (error) => {
	if (!(error instanceof Error && error.name === "ExitPromptError")) {
		// Rethrow unknown errors
		log.fatal(error);
		process.exit(1);
	}
});

// motivational quotes
const quotes = [
	"Hi :)",
	"Another project to compile?",
	"Keep pushing forward!",
	"You're doing great!",
	"Debugging is (not) fun!",
	"Stay positive!",
	"Believe in yourself!",
	"One step at a time.",
	"Consistency is key.",
	"You're awesome!",
	"You're a coding ninja!",
	"You're a coding wizard!",
	"You're a coding rockstar!",
	"You're a coding beast!",
	"You're a coding machine!",
];

// astra banner
console.log(`\n  ${chalk.red.bold("Astra")} ${chalk.gray(`v${VERSION}`)}`);
console.log(
	`  ${chalk.rgb(163, 163, 163)(quotes[Math.floor(Math.random() * quotes.length)])}\n`,
);

const cli = yargs(hideBin(process.argv)) //hideBin(process.argv)
	.scriptName("astra")
	.usage("$0 <komenda> [opcje]")
	.help("help")
	.alias("h", "help")
	.version(VERSION)
	.alias("v", "version")
	.showHelpOnFail(false)
	.strict();

cli.command(
	"versions",
	"Show available versions of Node.js",
	() => {},
	async () => {
		(await import("./versions.js")).default();
	},
);

cli.command(
	"install [ver]",
	"Preinstall Node.js version (format node_{version eg. v22.14.0}-{platform, likely win}-{arch eg. x64, x86, arm64}",
	(y) => {
		y.positional("ver", {
			describe: "Node.js version to install",
			type: "string",
		});
	},
	async (argv) => {
		(await import("./install.js")).default(argv as unknown as { ver: string });
	},
);

cli.command(
	"build [entry]",
	"Build your project",
	(y) => {
		y.positional("entry", {
			describe: "Entry file of your project",
			type: "string",
		});
		y.option("outDir", {
			alias: "o",
			describe: "Output directory",
			type: "string",
		});
		y.option("node", {
			describe:
				"Node.js version to use (in astra format eg. node_v22.14.0-win-x64)",
			type: "string",
			alias: "n",
		});
		y.option("disShasumCheck", {
			describe:
				"Disable node.exe shasum check (only use if you know what you're doing!)",
			type: "boolean",
		});
	},
	async (argv) => {
		interface BuildArgs {
			entry: string;
			outDir: string;
			node: string;
			disShasumCheck: boolean;
			[key: string]: unknown;
		}
		(await import("./build.js")).default(argv as unknown as BuildArgs);
	},
);
cli.command(
	"init",
	"Initialize your project",
	() => {},
	async () => {
		(await import("./init.js")).default();
	},
);

const argv = await cli.parse();
if (!argv._.length) {
	cli.showHelp();
	process.exit(0);
}

// process.on('exit', () => {
//     new signale.Signale({ types: { done: {badge: "⌚", label: "done", color: "blueBright" } } }).done(`Done in ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
// })
