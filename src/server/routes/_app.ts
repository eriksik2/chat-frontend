import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { botsRouter } from "./bots";
import { chatsRouter } from "./chats";

export const appRouter = router({
  test: publicProcedure.query(({ input, ctx }) => {
    return {
      ctxUser: ctx.uid,
    };
  }),
  bots: botsRouter,
  chats: chatsRouter,
});

export type AppRouter = typeof appRouter;
