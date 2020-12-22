import { docker, stopAndRemove } from "../docker";
import { dbStart } from "./dbStart";
import { dbStop } from "./dbStop";

// This is based on the package name in package.json
const containerName = "originate-scripts-postgres";

jest.setTimeout(30_000);

describe("db:stop", () => {
  afterEach(async () => {
    await stopAndRemove(containerName);
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
