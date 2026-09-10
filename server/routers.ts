import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { listVocabularyEntries, listVocabularyGroups, replaceVocabularyEntries, deleteVocabularyEntry } from "./db";

const vocabularyEntrySchema = z.object({
  id: z.string().min(1).max(191), text: z.string().min(1).max(500), kind: z.enum(["Word", "Phrase", "Sentence"]),
  groupId: z.string().max(191).nullable().optional(), partOfSpeech: z.string().min(1).max(32), meaning: z.string().max(10000), createdAt: z.number().int().nonnegative(), favorite: z.boolean(),
});
const vocabularyGroupSchema = z.object({ id: z.string().min(1).max(191), name: z.string().min(1).max(120), note: z.string().max(5000), createdAt: z.number().int().nonnegative() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  vocabulary: router({
    list: protectedProcedure.query(async ({ ctx }) => ({ entries: await listVocabularyEntries(ctx.user.id), groups: await listVocabularyGroups(ctx.user.id) })),
    replaceAll: protectedProcedure.input(z.object({ entries: z.array(vocabularyEntrySchema).max(1000), groups: z.array(vocabularyGroupSchema).max(200) })).mutation(({ ctx, input }) => replaceVocabularyEntries(ctx.user.id, input.entries, input.groups)),
    remove: protectedProcedure.input(z.object({ id: z.string().min(1).max(191) })).mutation(({ ctx, input }) => deleteVocabularyEntry(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;
