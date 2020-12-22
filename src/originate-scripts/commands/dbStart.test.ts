import { findContainer, docker } from "../docker";
import { dbStart } from "./dbStart";

// This is based on the package name in package.json
const containerName = "originate-scripts-postgres";

// Matches the port in DATABASE_URL in `.env.test`
const dbPort = "30632";

jest.setTimeout(30_000);

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
      { HostIp: "127.0.0.1", HostPort: dbPort },
    ]);
  });

  it("starts up an existing stopped container", async () => {
    expect(await findContainer(containerName)).not.toBeDefined();
    await dbStart();
    const container = docker.getContainer(containerName);
    await container.stop();
    const state0 = await container.inspect();
    expect(state0.State.Status).toBe("exited");

    await dbStart();
    const state = await container.inspect();
    expect(state.State.Status).toBe("running");
    expect(state.NetworkSettings.Ports["5432/tcp"]).toMatchObject([
      { HostIp: "127.0.0.1", HostPort: dbPort },
    ]);
  });
});
