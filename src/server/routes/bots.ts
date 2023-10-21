import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const botsRouter = router({
  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const bot = await ctx.prisma.chatBot.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          published: {
            select: {
              publishedAt: true,
            },
          },
          model: true,
          systemMessage: true,
          temperature: true,
          frequency_bias: true,
          presence_bias: true,
        },
      });

      if (!bot) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (bot.published === null && bot.author.id !== ctx.uid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      return {
        bot,
      };
    }),
});
