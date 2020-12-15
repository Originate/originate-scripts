import { Command } from "commander";
import { getVersion } from "./version";

export const program = new Command();
program.version(getVersion());
