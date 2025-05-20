import semver from 'semver';
import log from 'signale';
import nameparse, { generate, isLTS } from "./helpers/nameparse.js";
import prgss from "cli-progress";
import { select } from "@inquirer/prompts";
import chalk from "chalk";
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import got, { RequestError } from 'got';
export default async function install({ ver }: { ver: string }) {
    let versionName: string;
    try {
        await got("https://google.com")
    } catch (err) {
        if (err instanceof RequestError && err.code === "ENOTFOUND") {
            log.error("Could not connect to Internet. Please check your internet connection.");
            process.exit(1);
        }
    }
    const res = await got("https://api.github.com/repos/astracompiler/binaries/releases/latest").json() as any;
    if (ver) {
        const regex = /^node_v(\d+\.\d+\.\d+)-([a-z]+)-(x86|x64|arm64)$/;
        const lts = await isLTS(ver);
        versionName = generate({ ...nameparse(`${ver}.exe`), isLTS: lts });
        if (!regex.test(ver)) {
            log.error("Invalid version format. Please use the format node_{version}-{platform}-{arch}");
            process.exit(1);
        }
    } else {
        let versions = res.assets;
        versions = res.assets.map((asset: any) => asset.name).map((name: string) => nameparse(name)).sort((a: any, b: any) => semver.compare(b.version, a.version));
        versions = versions.map((version: any) => ({ name: `${chalk.green(version.version)} ${chalk.yellow(version.os)} ${chalk.gray(version.arch)} ${version.isLTS ? chalk.green("LTS") : ""}`, value: generate(version) }));
        // console.log(chalk.blueBright.bold("Tips:"))
        // console.log(chalk.greenBright("1. Architecture of your system is " + chalk.yellowBright(os.arch())))
        // console.log(chalk.greenBright(`2. If you don't know which version to choose, select the latest LTS version or type ${chalk.gray("node -v")} in your terminal`));
        // console.log()
        versionName = await select({
            message: "Select a version to install",
            choices: versions
        })
    }
    log.start(`Downloading ${versionName}...`);
    const versionFilename = `${versionName}.exe`;
    const writer = fs.createWriteStream(path.join(os.homedir(), '.astra', 'versions', versionFilename));
    if (!fs.existsSync(path.join(os.homedir(), '.astra', 'versions', versionName as string))) {
        const bar = new prgss.SingleBar({}, prgss.Presets.shades_classic);
        bar.start(100, 0);
        const response = got.stream(
            res.assets.find((asset: any) => asset.name === versionFilename).browser_download_url,
            {
                method: "GET",
            }
        );
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