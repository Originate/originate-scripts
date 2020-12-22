// This file is used for testing TypeORM integration

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "You must configure a database via the DATABASE_URL environment variable."
  );
}

module.exports = [
  // Default connection
  {
    type: "postgres",
    url: dbUrl,

    entities: ["temp/**/*.entity.ts"],
    migrations: ["temp/migration/**/*.ts"],
    subscribers: ["temp/**/*.subscriber.ts"],

    cli: {
      entitiesDir: "temp/entity",
      migrationsDir: "temp/migration",
      subscribersDir: "temp/subscriber",
    },
  },
];
