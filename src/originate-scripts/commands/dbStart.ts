import Dockerode from "dockerode";
import { docker } from "../docker";
import { databasePort, dbContainerName } from "../environment";
import { emphasized } from "../formatting";
import { info } from "../output";

export async function dbStart() {
  const containerName = dbContainerName();
  const imageTag = "latest";

  const started = await startExisting(containerName);
  if (started) {
    info(`Started existing database container, ${emphasized(containerName)}`);
    return;
  }

  const dbPort = databasePort();
  const newContainer = await createContainer({
    containerName,
    imageTag,
    dbPort,
  });
  await startNew(newContainer);

  info(
    `Created a new database container, ${emphasized(
      containerName
    )}, published on port ${emphasized(dbPort)}`
  );
}

async function startExisting(containerName: string): Promise<boolean> {
  try {
    const existingContainer = docker.getContainer(containerName);
    await existingContainer.start();
    return true;
  } catch (_err) {
    return false;
  }
}

async function createContainer(opts: {
  containerName: string;
  imageTag: string;
  dbPort: string;
}): Promise<Dockerode.Container> {
  try {
    return await docker.createContainer({
      name: opts.containerName,
      Image: `postgres:${opts.imageTag}`,
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: true,
      Env: ["POSTGRES_PASSWORD=password"],
      HostConfig: {
        PortBindings: {
          "5432/tcp": [{ HostIp: "127.0.0.1", HostPort: opts.dbPort }],
        },
      },
      Tty: false,
    });
  } catch (err) {
    throw new Error(
      `failed to create a new database container: ${err.message}`
    );
  }
}

async function startNew(container: Dockerode.Container): Promise<void> {
  try {
    await container.start();
  } catch (err) {
    throw new Error(
      `created a new container, but there was an error starting it: ${err.message}`
    );
  }
}
