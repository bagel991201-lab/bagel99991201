import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertVocabularyEntry, InsertVocabularyGroup, users, vocabularyEntries, vocabularyGroups } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  values.lastSignedIn = user.lastSignedIn ?? new Date(); updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0];
}

export async function listVocabularyEntries(userId: number) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  return db.select().from(vocabularyEntries).where(eq(vocabularyEntries.userId, userId)).orderBy(asc(vocabularyEntries.createdAt));
}

export async function listVocabularyGroups(userId: number) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  return db.select().from(vocabularyGroups).where(eq(vocabularyGroups.userId, userId)).orderBy(asc(vocabularyGroups.createdAt));
}

export type VocabularyEntryInput = Omit<InsertVocabularyEntry, "userId" | "updatedAt">;
export type VocabularyGroupInput = Omit<InsertVocabularyGroup, "userId" | "updatedAt">;

export async function replaceVocabularyEntries(userId: number, entries: VocabularyEntryInput[], groups: VocabularyGroupInput[] = []) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  await db.transaction(async (tx) => {
    await tx.delete(vocabularyEntries).where(eq(vocabularyEntries.userId, userId));
    await tx.delete(vocabularyGroups).where(eq(vocabularyGroups.userId, userId));
    if (groups.length > 0) await tx.insert(vocabularyGroups).values(groups.map((group) => ({ ...group, userId })));
    if (entries.length > 0) await tx.insert(vocabularyEntries).values(entries.map((entry) => ({ ...entry, userId })));
  });
  return { entries: await listVocabularyEntries(userId), groups: await listVocabularyGroups(userId) };
}

export async function deleteVocabularyEntry(userId: number, id: string) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  await db.delete(vocabularyEntries).where(and(eq(vocabularyEntries.userId, userId), eq(vocabularyEntries.id, id))); return { success: true } as const;
}
