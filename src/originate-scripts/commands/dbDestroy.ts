import { findContainer } from "../docker";
import { dbContainerName } from "../environment";
import { emphasized } from "../formatting";
import { info } from "../output";

export async function dbDestroy() {
  const containerName = dbContainerName();
  const container = await findContainer(containerName);
  if (container) {
    await container.stop();
    await container.remove();
    info(`Deleted database container, ${emphasized(containerName)}`);
  } else {
    info(
      `Could not delete database container, ${emphasized(
        containerName
      )}, because it does not exist`
    );
  }
}
