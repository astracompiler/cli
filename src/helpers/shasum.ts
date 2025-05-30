import { createHash } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises"; // ⬅️ Używamy wersji async `fs`
import got from "got";
import { cache } from "../astra.js";

function hash(b: Buffer): string {
	return createHash("sha256").update(b).digest("hex");
}

export default async function shasumMatch(
	pathToNode: string,
): Promise<boolean> {
	try {
		// get shasums.json
		const res: Record<string, unknown> = await got(
			"https://raw.githubusercontent.com/astracompiler/binaries/refs/heads/main/shasums.json",
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

		// getting file name
		const file = path.parse(pathToNode).name;

		// check if file exists in shasums.json
		if (!(file in res)) {
			console.error(`❌ Brak pliku '${file}' w shasums.json`);
			return false;
		}

		// read file
		const buffer = await fs.readFile(pathToNode);

		// calculate hash of node
		const hashOfNode = hash(buffer);

		// return comparison
		return res[file] === hashOfNode;
	} catch (error) {
		console.error("❌ Error in shasumMatch():", error);
		return false;
	}
}
