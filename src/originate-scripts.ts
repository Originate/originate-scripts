#!/usr/bin/env node

import { Command } from "commander";
import { dbDestroy } from "./originate-scripts/commands/dbDestroy";
import { dbShell } from "./originate-scripts/commands/dbShell";
import { dbStart } from "./originate-scripts/commands/dbStart";
import { dbStop } from "./originate-scripts/commands/dbStop";
import { getVersion } from "./originate-scripts/version";

export const program = new Command();
program.version(getVersion());
program
  .command("db:start")
  .description("start the dev database, or spin up a new one")
  .action(dbStart);
program
  .command("db:stop")
  .description(
    "stop the dev database; data is preserved in the stopped container"
  )
  .action(dbStop);
program
  .command("db:destroy")
  .description("remove the dev database, permanently deleting ALL DATA")
  .action(dbDestroy);
program
  .command("db:shell")
  .description("run the psql shell to interact directly with the dev database")
  .action(dbShell);

// This is the "main" entry point to the program
program.parseAsync(process.argv);
