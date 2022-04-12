import {
  Config,
  startPostgresContainer,
} from "@originate/docker-await-postgres";
import type { DataSourceOptions } from "typeorm";

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
  typeormConfig?: DataSourceOptions;
}

/**
 * Spins up a postgres database in a temporary Docker container. Sets the
 * environment variable, `DATABASE_URL`. Returns an object with a connection URI
 * for that database, and a function to call to stop and remove the container.
 *
 * @param options.image Docker image to run; e.g. `"postgres:12"` (default: "postgres:latest")
 * @param options.runMigrations If true, connect and run migrations according to configuration in `ormconfig.js` (default: true)
 * @param options.typeormConfig Configuration options for TypeORM. If not provided then configuration for running migrations will be read from `ormconfig.js` instead.
 */
export async function getTestDatabase(
  options: Options = {}
): Promise<{
  stop: () => Promise<void>;
}> {
  const { runMigrations = true } = options;
  const config: Config = {
    user: "postgres",
    password: "password",
    database: "postgres",
    image: options.image,
    ensureShutdown: true,
  };
  const { port, stop } = await startPostgresContainer(config);
  process.env.DATABASE_URL = `postgres://${config.user}:${config.password}@localhost:${port}/${config.database}`;

  if (runMigrations) {
    await runTypeormMigrations(options);
  }

  return { stop };
}

async function runTypeormMigrations({ typeormConfig }: Options) {
  const typeorm = await import("typeorm");
  const conn = typeormConfig
    ? await typeorm.createConnection(typeormConfig)
    : await typeorm.createConnection();
  await conn.runMigrations();
  await conn.destroy();
}
