import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { botsRouter } from "./bots";

export const appRouter = router({
  test: publicProcedure.query(({ input, ctx }) => {
    return {
      ctxUser: ctx.uid,
    };
  }),
  bots: botsRouter,
});

export type AppRouter = typeof appRouter;
