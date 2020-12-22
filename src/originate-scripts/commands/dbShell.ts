import { findContainer, interactiveShell, isRunning } from "../docker";
import { dbContainerName } from "../environment";
import { emphasized } from "../formatting";
import { info } from "../output";

export async function dbShell() {
  const containerName = dbContainerName();
  const container = await findContainer(containerName);

  if (!container) {
    info(
      `There is no database container named ${emphasized(
        containerName
      )} to connect to`
    );
    return;
  }

  if (!(await isRunning(container))) {
    info(
      `The database container, ${emphasized(containerName)}, is not running`
    );
    return;
  }

  await interactiveShell(container, { Cmd: ["psql", "-U", "postgres"] });

  // Explicitly exit - Node seems to wait for more input after
  // `interactiveShell` completes if we don't do this.
  process.exit(0);
}
