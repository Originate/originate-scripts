import Docker from "dockerode";
import fs from "fs";

const socketPath = process.env.DOCKER_SOCKET || "/var/run/docker.sock";
const stats = fs.statSync(socketPath);
if (!stats.isSocket()) {
  throw new Error(
    "Could not connect to Docker socket. Please make sure that Docker is running."
  );
}

export const docker = new Docker({ socketPath });

const runningStatuses = ["restarting", "running", "paused"];
// const stoppedStatuses = ["created", "removing", "exited", "dead"];

export async function findContainer(
  name: string
): Promise<Docker.Container | undefined> {
  const containerInfo = (
    await docker.listContainers({ all: true })
  ).find((info) => info.Names.includes(`/${name}`));
  if (containerInfo) {
    return docker.getContainer(containerInfo.Id);
  }
}

export async function imageExists(imageName: string): Promise<boolean> {
  const images = await docker.listImages({
    filters: { reference: [imageName] },
  });
  return images.length > 0;
}

export async function stopAndRemove(
  containerName: string | Docker.Container
): Promise<void> {
  const container =
    containerName instanceof Docker.Container
      ? containerName
      : await findContainer(containerName);

  if (container && (await isRunning(container))) {
    await container.stop();
  }

  if (container) {
    await container.remove();
  }
}

export async function isRunning(container: Docker.Container): Promise<boolean> {
  const status = (await container.inspect()).State.Status;
  return runningStatuses.includes(status);
}

// Interactive shell code is adapted from answers to https://github.com/apocas/dockerode/issues/523
export async function interactiveShell(
  container: Docker.Container,
  opts: Docker.ExecCreateOptions
): Promise<void> {
  const exec = await container.exec({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    ...opts,
  });

  const onResize = () => {
    resize(exec);
  };

  const ioStream = await exec.start({ stdin: true });

  await withRawTerminal(async () => {
    // Connect Docker output to terminal
    ioStream.pipe(process.stdout);

    // Connect terminal input to Docker stdin
    process.stdin.pipe(ioStream);

    // Forward terminal resize events to container process
    process.stdout.on("resize", onResize);

    await new Promise((resolve) => {
      ioStream.on("end", resolve);
    });

    process.stdout.removeListener("resize", onResize);
    process.stdin.removeAllListeners();
  });
}

// Modify process stdin settings for forwarding input to Docker process, run the
// given callback, and then restore settings.
async function withRawTerminal<T>(fn: () => Promise<T>): Promise<T> {
  const isRaw = process.stdin.isRaw;
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  const result = await fn();

  if (isRaw && process.stdin.isTTY) {
    process.stdin.setRawMode(isRaw);
    process.stdin.resume();
  }

  return result;
}

// Forward terminal resize events to container process
async function resize(exec: Docker.Exec) {
  const dimensions = {
    h: process.stdout.rows,
    w: process.stderr.columns,
  };
  if (dimensions.h != 0 && dimensions.w != 0) {
    await exec.resize(dimensions);
  }
}
