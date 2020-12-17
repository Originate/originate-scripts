import Docker from "dockerode";

export const docker = new Docker();

export async function findContainer(
  name: string
): Promise<Docker.Container | undefined> {
  const containerInfo = (await docker.listContainers()).find((info) =>
    info.Names.includes(`/${name}`)
  );
  if (containerInfo) {
    return docker.getContainer(containerInfo.Id);
  }
}
