import { beforeAll, describe, expect, it } from "vitest";
import nameparse, { generate, isLTS } from "../src/helpers/nameparse.ts";
import { isVersionInstalled } from "../src/helpers/cache.ts";
import { got } from "got";
import isWineInstalled from "../src/helpers/iswineinstalled.ts";

describe("helpers", () => {
	beforeAll(async function () {
		try {
			if ((await got("https://api.github.com")).statusCode !== 200) {
				console.log(
					"GitHub API is not reachable. Rate limit exceeded or network issue.",
				);
				this.skip();
			}
		} catch (error) {
			console.log(
				"GitHub API is not reachable. Rate limit exceeded or network issue.",
			);
			this.skip();
		}
	});

	it("should return it's LTS version", async () => {
		await expect(isLTS("node_v22.15.1-win-x64")).resolves.toBe(true);
	}, 15000);

	it("should return it's not LTS version", async () => {
		await expect(isLTS("node_v23.11.1-win-x64")).resolves.toBe(false);
	});

	it("should return valid object", () => {
		expect(nameparse("node_v22.15.1-win-x64")).toEqual({
			arch: "x64",
			os: "win",
			isLTS: false,
			version: "v22.15.1",
		});
	});

	it("should return invalid valid object", () => {
		expect(nameparse("node-win-v22.15.1-x64")).not.toEqual({
			arch: "x64",
			os: "win",
			isLTS: false,
			version: "v22.15.1",
		});
	});

	it("should return valid version string", () => {
		expect(
			generate({
				arch: "x64",
				os: "win",
				isLTS: false,
				version: "v22.15.1",
			}),
		).toEqual("node_v22.15.1-win-x64");
	});

	it("should return wine is not installed", () => {
		if (
			process.env.CI &&
			(process.platform === "darwin" || process.platform === "linux")
		) {
			expect(isWineInstalled()).toBe(false);
		} else {
			// skip test
			expect(true).toBe(true);
		}
	});

	it("should return version is not installed", () => {
		expect(isVersionInstalled("invalid_version")).toBe(false);
	});
});
