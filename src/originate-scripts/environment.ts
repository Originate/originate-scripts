import { loadEnvConfig } from "@next/env";
import fs from "fs";

const env = loadEnvConfig("./", true).combinedEnv;

export function dbContainerName(): string {
  return `${getProjectName()}-postgres`;
}

function getProjectName(): string {
  try {
    const packageJsonRaw = fs.readFileSync("package.json", "utf8");
    const packageJson = JSON.parse(packageJsonRaw);
    return packageJson.name.replace(/^@(.*)\/.*$/, "$1");
  } catch (_err) {
    throw new Error(
      "Could not read package name from package.json. Please make sure that you run originate-scripts in a directory with a package.json file that hase a `name` field."
    );
  }
}

export function databasePort(envUrl = "DATABASE_URL"): string {
  try {
    const url = new URL(env[envUrl]);
    return url.port || "5432";
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    throw new Error(
      `there was an error reading database information from your DATABASE_URL environment variable: ${message}`
    );
  }
}
