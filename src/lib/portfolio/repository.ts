import "server-only";

import { cache } from "react";
import {
  type Collection,
  type Filter,
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoOperationTimeoutError,
  MongoServerSelectionError,
  ObjectId,
  type OptionalUnlessRequiredId,
  type UpdateFilter,
  type WithId,
} from "mongodb";

import {
  defaultCertifications,
  defaultExperiences,
  defaultPortfolioData,
  defaultProfile,
  defaultProjects,
  defaultSkills,
} from "@/lib/portfolio/default-data";
import {
  DatabaseConfigurationError,
  getDatabase,
  isMongoConfigured,
} from "@/lib/mongodb";
import type {
  Certification,
  ContentRecord,
  Experience,
  NewContentRecord,
  PortfolioData,
  Profile,
  Project,
  Skill,
} from "@/lib/portfolio/types";

export type ContentCollectionName =
  | "experiences"
  | "projects"
  | "certifications"
  | "skills";

type StoredContent<T extends ContentRecord> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
> & {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

type StoredProfile = Omit<Profile, "id" | "updatedAt"> & {
  _id: "profile";
  updatedAt: Date;
};

function serializeContent<T extends ContentRecord>(
  document: WithId<StoredContent<T>>,
): T {
  const { _id, createdAt, updatedAt, ...content } = document;

  return {
    ...content,
    id: _id.toHexString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  } as unknown as T;
}

function serializeProfile(document: StoredProfile): Profile {
  const { _id, updatedAt, ...profile } = document;

  return {
    ...profile,
    id: _id,
    updatedAt: updatedAt.toISOString(),
  };
}

async function getContentCollection<T extends ContentRecord>(
  name: ContentCollectionName,
): Promise<Collection<StoredContent<T>>> {
  const database = await getDatabase();
  return database.collection<StoredContent<T>>(name);
}

export function isValidContentId(id: string) {
  return ObjectId.isValid(id);
}

export async function listContent<T extends ContentRecord>(
  name: ContentCollectionName,
  options: { includeDrafts?: boolean } = {},
): Promise<T[]> {
  const collection = await getContentCollection<T>(name);
  const filter = options.includeDrafts
    ? {}
    : ({ status: "published" } as Filter<StoredContent<T>>);
  const records = await collection
    .find(filter)
    .sort({ displayOrder: 1, updatedAt: -1 })
    .toArray();

  return records.map(serializeContent<T>);
}

export async function getContentById<T extends ContentRecord>(
  name: ContentCollectionName,
  id: string,
): Promise<T | null> {
  if (!isValidContentId(id)) {
    return null;
  }

  const collection = await getContentCollection<T>(name);
  const record = await collection.findOne({
    _id: new ObjectId(id),
  } as Filter<StoredContent<T>>);

  return record ? serializeContent<T>(record) : null;
}

export async function createContent<T extends ContentRecord>(
  name: ContentCollectionName,
  input: NewContentRecord<T>,
): Promise<T> {
  const collection = await getContentCollection<T>(name);
  const now = new Date();
  const document = {
    ...input,
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
  } as OptionalUnlessRequiredId<StoredContent<T>>;

  await collection.insertOne(document);
  return serializeContent<T>(document as WithId<StoredContent<T>>);
}

export async function updateContent<T extends ContentRecord>(
  name: ContentCollectionName,
  id: string,
  input: NewContentRecord<T>,
): Promise<T | null> {
  if (!isValidContentId(id)) {
    return null;
  }

  const collection = await getContentCollection<T>(name);
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) } as Filter<StoredContent<T>>,
    {
      $set: {
        ...input,
        updatedAt: new Date(),
      },
    } as UpdateFilter<StoredContent<T>>,
    { returnDocument: "after" },
  );

  return result ? serializeContent<T>(result) : null;
}

export async function deleteContent(
  name: ContentCollectionName,
  id: string,
): Promise<boolean> {
  if (!isValidContentId(id)) {
    return false;
  }

  const database = await getDatabase();
  const result = await database.collection(name).deleteOne({
    _id: new ObjectId(id),
  });
  return result.deletedCount === 1;
}

export async function getProfile(): Promise<Profile | null> {
  const database = await getDatabase();
  const profile = await database
    .collection<StoredProfile>("profile")
    .findOne({ _id: "profile" });

  return profile ? serializeProfile(profile) : null;
}

export async function saveProfile(
  profile: Omit<Profile, "id" | "updatedAt">,
): Promise<Profile> {
  const database = await getDatabase();
  const updatedAt = new Date();
  await database.collection<StoredProfile>("profile").updateOne(
    { _id: "profile" },
    {
      $set: { ...profile, updatedAt },
      $setOnInsert: { _id: "profile" },
    },
    { upsert: true },
  );

  return { ...profile, id: "profile", updatedAt: updatedAt.toISOString() };
}

function isOperationalDatabaseError(error: unknown) {
  return (
    error instanceof DatabaseConfigurationError ||
    error instanceof MongoServerSelectionError ||
    error instanceof MongoNetworkError ||
    error instanceof MongoNetworkTimeoutError ||
    error instanceof MongoOperationTimeoutError
  );
}

async function readPortfolioData(): Promise<PortfolioData> {
  if (!isMongoConfigured()) {
    return defaultPortfolioData;
  }

  try {
    const profile = await getProfile();

    if (!profile) {
      return defaultPortfolioData;
    }

    const [experiences, projects, certifications, skills] = await Promise.all([
      listContent<Experience>("experiences"),
      listContent<Project>("projects"),
      listContent<Certification>("certifications"),
      listContent<Skill>("skills"),
    ]);

    return {
      profile,
      experiences,
      projects,
      certifications,
      skills,
      source: "mongodb",
    };
  } catch (error) {
    if (isOperationalDatabaseError(error)) {
      console.error("Portfolio database unavailable; using bundled content.");
      return defaultPortfolioData;
    }
    throw error;
  }
}

export const getPortfolioData = cache(readPortfolioData);

export async function getAdminCounts() {
  const database = await getDatabase();
  const [experiences, projects, certifications, skills] = await Promise.all([
    database.collection("experiences").countDocuments(),
    database.collection("projects").countDocuments(),
    database.collection("certifications").countDocuments(),
    database.collection("skills").countDocuments(),
  ]);

  return { experiences, projects, certifications, skills };
}

async function insertDefaultsWhenEmpty<T extends ContentRecord>(
  name: ContentCollectionName,
  defaults: T[],
) {
  const collection = await getContentCollection<T>(name);
  if ((await collection.countDocuments()) > 0) {
    return;
  }

  const now = new Date();
  const documents = defaults.map(({ id, createdAt, updatedAt, ...record }) => {
    void id;
    void createdAt;
    void updatedAt;
    return {
      ...record,
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
    } as OptionalUnlessRequiredId<StoredContent<T>>;
  });

  if (documents.length > 0) {
    await collection.insertMany(documents);
  }
}

export async function seedPortfolioData() {
  const database = await getDatabase();
  const { id, updatedAt, ...profile } = defaultProfile;
  void id;
  void updatedAt;

  await database.collection<StoredProfile>("profile").updateOne(
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
    insertDefaultsWhenEmpty<Experience>("experiences", defaultExperiences),
    insertDefaultsWhenEmpty<Project>("projects", defaultProjects),
    insertDefaultsWhenEmpty<Certification>(
      "certifications",
      defaultCertifications,
    ),
    insertDefaultsWhenEmpty<Skill>("skills", defaultSkills),
    database
      .collection("experiences")
      .createIndex({ status: 1, displayOrder: 1 }),
    database.collection("projects").createIndex({ status: 1, displayOrder: 1 }),
    database
      .collection("certifications")
      .createIndex({ status: 1, displayOrder: 1 }),
    database.collection("skills").createIndex({ status: 1, displayOrder: 1 }),
  ]);
}
