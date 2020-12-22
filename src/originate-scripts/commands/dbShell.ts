import { docker, interactiveShell } from "../docker";
import { dbContainerName } from "../environment";

export async function dbShell() {
  const container = docker.getContainer(dbContainerName());
  await interactiveShell(container, { Cmd: ["psql", "-U", "postgres"] });

  // Explicitly exit - Node seems to wait for more input after
  // `interactiveShell` completes if we don't do this.
  process.exit(0);
}
