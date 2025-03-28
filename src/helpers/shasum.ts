import { createHash } from "crypto";
import path from "path";
import fs from "fs/promises"; // ⬅️ Używamy wersji async `fs`
import got from "got";

function hash(b: Buffer): string {
    return createHash("sha256").update(b).digest("hex");
}

export default async function shasumMatch(pathToNode: string): Promise<boolean> {
    try {
        // get shasums.json
        const res: Record<string, any> = await got('https://raw.githubusercontent.com/astracompiler/binaries/refs/heads/main/shasums.json').json();

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
        console.error(`❌ Error in shasumMatch():`, error);
        return false;
    }
}
