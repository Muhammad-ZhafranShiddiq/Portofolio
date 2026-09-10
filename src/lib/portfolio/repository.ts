import "server-only";

import { cache } from "react";
import {
  type Collection,
  type ClientSession,
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
  getMongoClient,
  isMongoConfigured,
} from "@/lib/mongodb";
import type {
  Certification,
  ContentMutationInput,
  ContentRecord,
  Experience,
  PortfolioData,
  Profile,
  Project,
  Skill,
  SkillCategory,
} from "@/lib/portfolio/types";

export type ContentCollectionName =
  | "experiences"
  | "projects"
  | "certifications"
  | "skills";

export class ContentOrderConflictError extends Error {
  constructor() {
    super("The content list changed before the new order could be saved.");
    this.name = "ContentOrderConflictError";
  }
}

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
    .sort({ displayOrder: 1, updatedAt: -1, _id: 1 })
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
  input: ContentMutationInput<T>,
): Promise<T> {
  const collection = await getContentCollection<T>(name);
  const filter = (
    name === "skills"
      ? { category: (input as unknown as ContentMutationInput<Skill>).category }
      : {}
  ) as Filter<StoredContent<T>>;
  const lastItem = await collection
    .find(filter, { projection: { displayOrder: 1 } })
    .sort({ displayOrder: -1 })
    .limit(1)
    .next();
  const now = new Date();
  const document = {
    ...input,
    displayOrder: (lastItem?.displayOrder ?? 0) + 1,
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
  input: ContentMutationInput<T>,
): Promise<T | null> {
  if (!isValidContentId(id)) {
    return null;
  }

  const collection = await getContentCollection<T>(name);
  let displayOrder: number | undefined;

  if (name === "skills") {
    const existing = await collection.findOne(
      { _id: new ObjectId(id) } as Filter<StoredContent<T>>,
      { projection: { category: 1 } },
    );
    if (!existing) return null;

    const nextCategory = (input as unknown as ContentMutationInput<Skill>)
      .category;
    if ((existing as unknown as Pick<Skill, "category">).category !== nextCategory) {
      const lastItem = await collection
        .find(
          {
            category: nextCategory,
            _id: { $ne: new ObjectId(id) },
          } as unknown as Filter<StoredContent<T>>,
          { projection: { displayOrder: 1 } },
        )
        .sort({ displayOrder: -1 })
        .limit(1)
        .next();
      displayOrder = (lastItem?.displayOrder ?? 0) + 1;
    }
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) } as Filter<StoredContent<T>>,
    {
      $set: {
        ...input,
        ...(displayOrder === undefined ? {} : { displayOrder }),
        updatedAt: new Date(),
      },
    } as UpdateFilter<StoredContent<T>>,
    { returnDocument: "after" },
  );

  return result ? serializeContent<T>(result) : null;
}

type StoredOrderRecord = {
  _id: ObjectId;
  displayOrder: number;
  updatedAt: Date;
  category?: SkillCategory;
};

function hasExactContentIds(records: StoredOrderRecord[], orderedIds: string[]) {
  if (records.length !== orderedIds.length) return false;
  const currentIds = new Set(records.map((record) => record._id.toHexString()));
  return orderedIds.every((id) => currentIds.has(id));
}

export async function reorderContent(
  name: ContentCollectionName,
  orderedIds: string[],
  expectedIds: string[],
  category?: SkillCategory,
): Promise<void> {
  if (
    new Set(orderedIds).size !== orderedIds.length ||
    new Set(expectedIds).size !== expectedIds.length ||
    orderedIds.some((id) => !isValidContentId(id)) ||
    expectedIds.some((id) => !isValidContentId(id)) ||
    (name === "skills" && !category) ||
    (name !== "skills" && category)
  ) {
    throw new ContentOrderConflictError();
  }

  const [client, database] = await Promise.all([
    getMongoClient(),
    getDatabase(),
  ]);
  const collection = database.collection<StoredOrderRecord>(name);
  const filter = (name === "skills" ? { category } : {}) as Filter<StoredOrderRecord>;
  const session: ClientSession = client.startSession();

  try {
    await session.withTransaction(async () => {
      const records = await collection
        .find(
          filter,
          { projection: { _id: 1, displayOrder: 1, updatedAt: 1 }, session },
        )
        .sort({ displayOrder: 1, updatedAt: -1, _id: 1 })
        .toArray();

      const currentIds = records.map((record) => record._id.toHexString());
      if (
        !hasExactContentIds(records, orderedIds) ||
        !hasExactContentIds(records, expectedIds) ||
        currentIds.some((id, index) => id !== expectedIds[index])
      ) {
        throw new ContentOrderConflictError();
      }

      if (orderedIds.length === 0) return;

      const result = await collection.bulkWrite(
        orderedIds.map((id, index) => ({
          updateOne: {
            filter: { _id: new ObjectId(id) },
            update: { $set: { displayOrder: index + 1 } },
          },
        })),
        { ordered: true, session },
      );

      if (result.matchedCount !== orderedIds.length) {
        throw new ContentOrderConflictError();
      }
    });
  } finally {
    await session.endSession();
  }
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
