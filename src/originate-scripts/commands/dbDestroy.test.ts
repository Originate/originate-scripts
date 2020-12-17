import { findContainer, docker } from "../docker";
import { dbStart } from "./dbStart";
import { dbDestroy } from "./dbDestroy";

process.env.DATABASE_URL = "postgres://localhost:30632/postgres";

const containerName = "originate-postgres";

jest.setTimeout(30_000);

describe("db:destroy", () => {
  it("stops and removes a running database container", async () => {
    await dbStart();
    expect(
      (await docker.getContainer(containerName).inspect()).State.Status
    ).toBe("running");

    await dbDestroy();
    expect(await findContainer(containerName)).not.toBeDefined();
  });

  it("removes a stopped database container", async () => {
    await dbStart();
    const container = docker.getContainer(containerName);
    await container.stop();
    const state0 = await container.inspect();
    expect(state0.State.Status).toBe("exited");

    await dbDestroy();
    expect(await findContainer(containerName)).not.toBeDefined();
  });

  it("does not produce an error if there is no container to destroy", async () => {
    expect(await findContainer(containerName)).not.toBeDefined();
    await dbDestroy();
    expect(await findContainer(containerName)).not.toBeDefined();
  });
});
