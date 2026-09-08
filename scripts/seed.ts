import { MongoClient, ObjectId } from "mongodb";

import {
  defaultCertifications,
  defaultExperiences,
  defaultProfile,
  defaultProjects,
  defaultSkills,
} from "../src/lib/portfolio/default-data";
import type { ContentRecord } from "../src/lib/portfolio/types";

function toDocuments<T extends ContentRecord>(records: T[]) {
  const now = new Date();
  return records.map(({ id, createdAt, updatedAt, ...content }) => {
    void id;
    void createdAt;
    void updatedAt;
    return { ...content, _id: new ObjectId(), createdAt: now, updatedAt: now };
  });
}

async function insertWhenEmpty<T extends ContentRecord>(
  client: MongoClient,
  databaseName: string,
  collectionName: string,
  records: T[],
) {
  const collection = client.db(databaseName).collection(collectionName);
  if ((await collection.countDocuments()) === 0) {
    await collection.insertMany(toDocuments(records));
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Set MONGODB_URI before running npm run seed.");
  }

  const databaseName =
    process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || "portfolio";
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8_000 });

  try {
    await client.connect();
    const database = client.db(databaseName);
    const { id, updatedAt, ...profile } = defaultProfile;
    void id;
    void updatedAt;

    await database.collection<{ _id: string }>("profile").updateOne(
      { _id: "profile" },
      {
        $setOnInsert: {
          _id: "profile",
          ...profile,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    await Promise.all([
      insertWhenEmpty(client, databaseName, "experiences", defaultExperiences),
      insertWhenEmpty(client, databaseName, "projects", defaultProjects),
      insertWhenEmpty(
        client,
        databaseName,
        "certifications",
        defaultCertifications,
      ),
      insertWhenEmpty(client, databaseName, "skills", defaultSkills),
      database.collection("experiences").createIndex({ status: 1, displayOrder: 1 }),
      database.collection("projects").createIndex({ status: 1, displayOrder: 1 }),
      database
        .collection("certifications")
        .createIndex({ status: 1, displayOrder: 1 }),
      database.collection("skills").createIndex({ status: 1, displayOrder: 1 }),
    ]);

    console.log("Portfolio data seeded successfully.");
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unable to seed data.");
  process.exitCode = 1;
});
