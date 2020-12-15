import Dockerode from "dockerode";
import { docker } from "../docker";
import { dbStart } from "./dbStart";

process.env.DATABASE_URL = "postgres://localhost:1234/postgres";

jest.setTimeout(30_000);

const containerName = "originate-postgres";

describe("db:start", () => {
  afterEach(async () => {
    const container = await findContainer(containerName);
    if (container) {
      await container.stop();
      await container.remove();
    }
  });

  it("starts a database in a new container", async () => {
    expect(await findContainer(containerName)).not.toBeDefined();
    await dbStart();
    const state = await docker.getContainer(containerName).inspect();
    expect(state.State.Status).toBe("running");
    expect(state.NetworkSettings.Ports["5432/tcp"]).toMatchObject([
      { HostIp: "0.0.0.0", HostPort: "1234" },
    ]);
  });

  it("starts up an existing stopped container", async () => {
    await dbStart();
    const container = docker.getContainer(containerName);
    await container.stop();
    const state0 = await container.inspect();
    expect(state0.State.Status).toBe("exited");

    await dbStart();
    const state = await container.inspect();
    expect(state.State.Status).toBe("running");
    expect(state.NetworkSettings.Ports["5432/tcp"]).toMatchObject([
      { HostIp: "0.0.0.0", HostPort: "1234" },
    ]);
  });
});

async function findContainer(
  name: string
): Promise<Dockerode.Container | undefined> {
  const containerInfo = (await docker.listContainers()).find((info) =>
    info.Names.includes(`/${name}`)
  );
  if (containerInfo) {
    return docker.getContainer(containerInfo.Id);
  }
}
