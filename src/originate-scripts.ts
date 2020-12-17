#!/usr/bin/env node

import { Command } from "commander";
import { dbDestroy } from "./originate-scripts/commands/dbDestroy";
import { dbStart } from "./originate-scripts/commands/dbStart";
import { getVersion } from "./originate-scripts/version";

export const program = new Command();
program.version(getVersion());
program
  .command("db:start")
  .description("start the dev database, or spin up a new one")
  .action(dbStart);
program
  .command("db:destroy")
  .description("remove the dev database, permanently deleting ALL DATA")
  .action(dbDestroy);

program.parseAsync(process.argv);
