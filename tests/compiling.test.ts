import { execSync, spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import build from "../src/build.js";
import install from "../src/install.js";

beforeAll(async () => {
	execSync("yarn ts");
	fs.mkdirSync("temp");
	fs.writeFileSync(
		"temp/test.esm.ts",
		"import log from'console';log('Hello world!');",
	);
	fs.writeFileSync(
		"temp/test.cjs.ts",
		"const {log}=require('console');log('Hello world!');",
	);
	fs.writeFileSync("temp/im-not-a-js-ts-file", "Hello world!");
	if (!process.env.CI) {
		await install({
			ver: "node_v22.15.1-win-x64",
		});
	}
}, 1000 * 60);

describe(
	"compiling",
	() => {
		it("esm compiling", async () => {
			await build({
				entry: "temp/test.esm.ts",
				outDir: "temp",
				node: "node_v22.15.1-win-x64",
				disShasumCheck: false,
				noMetadata: true,
			});
		});

		it("cjs compiling", async () => {
			await build({
				entry: "temp/test.cjs.ts",
				outDir: "temp",
				node: "node_v22.15.1-win-x64",
				disShasumCheck: false,
				noMetadata: true,
			});
		});

		it("should throw do not exists error", async () => {
			const spy = vi.spyOn(process, "exit").mockImplementation((code) => {
				throw new Error(`exit ${code}`);
			});

			await expect(
				build({
					entry: "temp/i-do-not-exist.ts",
					outDir: "temp",
					node: "node_v22.15.1-win-x64",
					disShasumCheck: false,
					noMetadata: true,
				}),
			).rejects.toThrow("exit 1");

			spy.mockRestore();
		});

		it("should throw not a js/ts file error", async () => {
			const spy = vi.spyOn(process, "exit").mockImplementation((code) => {
				throw new Error(`exit ${code}`);
			});

			await expect(
				build({
					entry: "temp/im-not-a-js-ts-file",
					outDir: "temp",
					node: "node_v22.15.1-win-x64",
					disShasumCheck: false,
					noMetadata: true,
				}),
			).rejects.toThrow("exit 1");

			spy.mockRestore();
		});
	},
	1000 * 60,
);

afterAll(() => {
	fs.rmSync("temp", { recursive: true, force: true });
});
