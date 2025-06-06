import { spawnSync } from "node:child_process";

export default function isWineInstalled(): boolean {
    const x = spawnSync("wine --version", { stdio: "ignore" });
    if (x.status === 0) {
        return true;
    }
    return false;
}