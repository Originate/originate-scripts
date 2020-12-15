import { databasePort, dbContainerName } from "../environment";
import { emphasized } from "../formatting";
import { info } from "../output";
import { shellCommand } from "../shellCommand";

export async function dbStart() {
  const containerName = dbContainerName();
  const imageTag = "latest";

  const startStatus = await shellCommand("docker", ["start", containerName], {
    stdio: [process.stdin, "ignore", "ignore"],
  });
  if (startStatus === 0) {
    info(`Started existing database container, ${emphasized(containerName)}`);
    return;
  }

  const dbPort = databasePort();
  const runStatus = await shellCommand(
    "docker",
    [
      "run",
      "--env",
      "POSTGRES_PASSWORD=password",
      "--publish",
      `${dbPort}:5432`,
      "--detach",
      "--name",
      containerName,
      `postgres:${imageTag}`,
    ],
    {
      stdio: [process.stdin, "ignore", process.stderr],
    }
  );
  if (runStatus === 0) {
    info(
      `Created a new database container, ${emphasized(
        containerName
      )}, published on port ${emphasized(dbPort)}`
    );
    return;
  }

  throw new Error("failed to start the database");
}
