import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { botsRouter } from "./bots/bots";
import { chatsRouter } from "./chats/chats";

export const appRouter = router({
  bots: botsRouter,
  chats: chatsRouter,
});

export type AppRouter = typeof appRouter;
