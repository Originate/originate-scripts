import Dockerode from "dockerode";
import { pullImageAsync } from "dockerode-utils";
import { docker, findContainer, imageExists, isRunning } from "../docker";
import { databasePort, dbContainerName } from "../environment";
import { emphasized } from "../formatting";
import { info } from "../output";

export async function dbStart(
  image: string = "postgres:latest",
  envUrl: string = "DATABASE_URL"
) {
  const containerName = dbContainerName();

  const started = await startExisting(containerName);
  if (started) {
    info(`Started existing database container, ${emphasized(containerName)}`);
    return;
  }

  if (!(await imageExists(image))) {
    info(`Downloading ${image}...`);
    await pullImageAsync(docker, image, (_progress) => {
      // TODO: show progress
    });
  }

  const dbPort = databasePort(envUrl);
  const newContainer = await createContainer({
    containerName,
    image,
    dbPort,
  });
  await startNew(newContainer);

  info(
    `Created a new database container, ${emphasized(
      containerName
    )}, published on port ${emphasized(dbPort)}`
  );
}

// Resolves to true if there is an existing container and it was started, or it
// was already running; false if there is no existing container.
async function startExisting(containerName: string): Promise<boolean> {
  const container = await findContainer(containerName);
  if (!container) {
    return false;
  }

  if (!(await isRunning(container))) {
    await container.start();
  }
  return true;
}

async function createContainer(opts: {
  containerName: string;
  image: string;
  dbPort: string;
}): Promise<Dockerode.Container> {
  try {
    return await docker.createContainer({
      name: opts.containerName,
      Image: opts.image,
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: false,
      Env: ["POSTGRES_PASSWORD=password"],
      HostConfig: {
        PortBindings: {
          "5432/tcp": [{ HostIp: "127.0.0.1", HostPort: opts.dbPort }],
        },
      },
      Tty: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    throw new Error(`failed to create a new database container: ${message}`);
  }
}

async function startNew(container: Dockerode.Container): Promise<void> {
  try {
    await container.start();
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    throw new Error(
      `created a new container, but there was an error starting it: ${message}`
    );
  }
}
