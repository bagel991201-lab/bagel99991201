import { bigint, boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const vocabularyEntries = mysqlTable("vocabulary_entries", {
  id: varchar("id", { length: 191 }).primaryKey(),
  userId: int("userId").notNull(),
  text: varchar("text", { length: 500 }).notNull(),
  kind: mysqlEnum("kind", ["Word", "Phrase", "Sentence"]).notNull(),
  partOfSpeech: varchar("partOfSpeech", { length: 32 }).notNull(),
  meaning: text("meaning").notNull(),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  favorite: boolean("favorite").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("vocabulary_entries_user_id_idx").on(table.userId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type VocabularyEntry = typeof vocabularyEntries.$inferSelect;
export type InsertVocabularyEntry = typeof vocabularyEntries.$inferInsert;

// TODO: Keep user-owned product data in tables with a userId column and enforce ownership in every protected procedure.
