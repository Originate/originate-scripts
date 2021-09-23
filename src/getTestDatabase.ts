import {
  Config,
  startPostgresContainer,
} from "@originate/docker-await-postgres";
import { createConnection } from "typeorm";

export interface Options {
  /**
   * Docker image to run; e.g. `postgres:12`
   */
  image?: string;
}

/**
 * Spins up a postgres database in a temporary Docker container. Sets the
 * environment variable, `DATABASE_URL`. Returns an object with a connection URI
 * for that database, and a function to call to stop and remove the container.
 *
 * @param options.image Docker image to run; e.g. `"postgres:12"` (default: "postgres:latest")
 */
export async function getTestDatabase({
  image = "postgres:latest",
}: Options): Promise<{
  stop: () => Promise<void>;
}> {
  const config: Config = {
    user: "postgres",
    password: "password",
    database: "postgres",
    image,
    ensureShutdown: true,
  };
  const { port, stop } = await startPostgresContainer(config);
  process.env.DATABASE_URL = `postgres://${config.user}:${config.password}@localhost:${port}/${config.database}`;

  const conn = await createConnection();
  await conn.runMigrations();
  await conn.close();

  return { stop };
}
