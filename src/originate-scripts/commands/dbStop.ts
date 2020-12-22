import { findContainer, isRunning } from "../docker";
import { dbContainerName } from "../environment";
import { emphasized } from "../formatting";
import { info } from "../output";

export async function dbStop() {
  const containerName = dbContainerName();
  const container = await findContainer(containerName);

  if (!container) {
    info(
      `There is no database container named ${emphasized(
        containerName
      )} to stop`
    );
    return;
  }

  if (!(await isRunning(container))) {
    info(`Database container, ${emphasized(containerName)} is already stopped`);
    return;
  }

  await container.stop();
  info(`Stopped database container, ${emphasized(containerName)}`);
}
