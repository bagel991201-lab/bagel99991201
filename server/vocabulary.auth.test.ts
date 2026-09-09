import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("vocabulary ownership", () => {
  it("requires an authenticated user to list personal entries", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.vocabulary.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires an authenticated user before accepting a sync payload", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(
      caller.vocabulary.replaceAll({
        entries: [
          {
            id: "example-entry",
            text: "keep going",
            kind: "Phrase",
            partOfSpeech: "phrase",
            meaning: "繼續努力",
            createdAt: 1,
            favorite: false,
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
