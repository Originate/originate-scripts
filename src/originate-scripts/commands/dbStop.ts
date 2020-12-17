import { findContainer } from "../docker";
import { dbContainerName } from "../environment";
import { emphasized } from "../formatting";
import { info } from "../output";

export async function dbStop() {
  const containerName = dbContainerName();
  const container = await findContainer(containerName);
  if (container) {
    await container.stop();
    info(`Stopped database container, ${emphasized(containerName)}`);
  } else {
    info(
      `Could not stop database container, ${emphasized(
        containerName
      )}, because it does not exist`
    );
  }
}
