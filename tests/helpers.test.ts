import { describe, expect, it } from "vitest";
import nameparse, { generate, isLTS } from "../src/helpers/nameparse.js";
import { isVersionInstalled } from "../src/helpers/cache.js";

describe("helpers", () => {
	it("should return it's LTS version", () => {
		expect(isLTS("node_v22.15.1-win-x64")).resolves.toBe(true);
	});

	it("should return it's not LTS version", () => {
		expect(isLTS("node_v23.11.1-win-x64")).resolves.toBe(false);
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

	it("should return version is not installed", () => {
		expect(isVersionInstalled("invalid_version")).toBe(false);
	});
});
