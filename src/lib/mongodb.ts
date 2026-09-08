import "server-only";

import { Db, MongoClient } from "mongodb";

export class DatabaseConfigurationError extends Error {
  constructor(message = "MongoDB is not configured.") {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

declare global {
  var portfolioMongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new DatabaseConfigurationError(
      "Set MONGODB_URI before using the portfolio admin.",
    );
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 8_000,
  });

  return client.connect();
}

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export function getMongoClient() {
  if (!globalThis.portfolioMongoClientPromise) {
    const connection = createClientPromise();
    globalThis.portfolioMongoClientPromise = connection;
    void connection.catch(() => {
      if (globalThis.portfolioMongoClientPromise === connection) {
        globalThis.portfolioMongoClientPromise = undefined;
      }
    });
  }

  return globalThis.portfolioMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(
    process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || "portfolio",
  );
}
