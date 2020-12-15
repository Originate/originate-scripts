import { loadEnvConfig } from "@next/env";
import fs from "fs";

const env = loadEnvConfig("./", true).combinedEnv;

export function dbContainerName(): string {
  return `${getProjectName()}-postgres`;
}

function getProjectName(): string {
  const packageJsonRaw = fs.readFileSync("package.json", "utf8");
  const packageJson = JSON.parse(packageJsonRaw);
  return packageJson.name.replace(/^@(.*)\/.*$/, "$1");
}

export function databasePort(): string {
  try {
    const url = new URL(env.DATABASE_URL);
    return url.port || "5432";
  } catch (err) {
    throw new Error(
      `there was an error reading database information from your DATABASE_URL environment variable: ${err.message}`
    );
  }
}
