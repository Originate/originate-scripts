import { docker, findContainer } from "../docker";
import { dbStart } from "./dbStart";
import { dbStop } from "./dbStop";

process.env.DATABASE_URL = "postgres://localhost:30632/postgres";

const containerName = "originate-postgres";

jest.setTimeout(30_000);

describe("db:stop", () => {
  afterEach(async () => {
    const container = await findContainer(containerName);
    if (container) {
      await container.stop();
      await container.remove();
    }
  });

  test("it stops a running database container", async () => {
    await dbStart();
    const container = docker.getContainer(containerName);
    const state0 = await container.inspect();
    expect(state0.State.Status).toBe("running");

    await dbStop();
    const state = await container.inspect();
    expect(state.State.Status).toBe("exited");
  });

  test("it does not error if there is a container that is already stopped", async () => {
    await dbStart();
    await dbStop();
    await dbStop();
  });

  test("it does not error if there is no container to stop", async () => {
    await dbStop();
  });
});
