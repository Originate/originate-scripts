import {
  Config,
  startPostgresContainer,
} from "@originate/docker-await-postgres";
import type { ConnectionOptions } from "typeorm";

export interface Options {
  /**
   * Docker image to run; e.g. `postgres:12`
   */
  image?: string;

  /**
   * If true, connect and run migrations according to configuration in `ormconfig.js`
   */
  runMigrations?: boolean;

  /**
   * Configuration options for TypeORM. TypeORM is invoked if `runMigrations` is
   * set to `true`. If this configuration is not provided then configuration will
   * be read from `ormconfig.js` instead.
   *
   * originate-scripts is currently unable to load TypeScript ormconfig modules.
   * If you use TypeScript for your TypeORM configuration then source your
   * `ormconfig.ts` file, and pass the exported object as `typeormConfig` here.
   */
  typeormConfig?: () => Promise<ConnectionOptions>;
}

/**
 * Spins up a postgres database in a temporary Docker container. Sets the
 * environment variable, `DATABASE_URL`. Returns an object with a connection URI
 * for that database, and a function to call to stop and remove the container.
 *
 * @param options.image Docker image to run; e.g. `"postgres:12"` (default: "postgres:latest")
 * @param options.runMigrations If true, connect and run migrations according to configuration in `ormconfig.js` (default: true)
 * @param options.typeormConfig Async callback that returns configuration options for TypeORM. If you use an `ormconfig.ts` file you should import it in the callback using the `import` operator so that configuration is evaluated *after* `process.env.DATABASE_URL` is set. If not set config for migrations will be read from `ormconfig.js`.
 */
export async function getTestDatabase({
  image = "postgres:latest",
  runMigrations = true,
  typeormConfig,
}: Options = {}): Promise<{
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

  if (runMigrations) {
    await runTypeormMigrations(await typeormConfig?.());
  }

  return { stop };
}

async function runTypeormMigrations(typeormConfig?: ConnectionOptions) {
  const typeorm = await import("typeorm");
  const conn = typeormConfig
    ? await typeorm.createConnection(typeormConfig)
    : await typeorm.createConnection();
  await conn.runMigrations();
  await conn.close();
}
