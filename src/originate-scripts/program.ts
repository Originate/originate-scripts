import { Command } from "commander";
import { dbStart } from "./commands/dbStart";
import { getVersion } from "./version";

export const program = new Command();
program.version(getVersion());
program.command("db:start").description("start dev database").action(dbStart);
