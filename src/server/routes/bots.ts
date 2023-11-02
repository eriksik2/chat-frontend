import { z } from "zod";
import { authorizedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const botsRouter = router({
  // Get a single bot
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
              rating: true,
              ratingsCount: true,
              ChatBotRatings: !ctx.uid
                ? undefined
                : {
                    where: {
                      userId: ctx.uid,
                    },
                    select: {
                      rating: true,
                    },
                  },
            },
          },
          model: true,
          systemMessage: true,
          temperature: true,
          frequency_bias: true,
          presence_bias: true,

          favorites: !ctx.uid
            ? undefined
            : {
                select: {
                  createdAt: true,
                },
                where: {
                  userId: ctx.uid,
                },
              },
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

      const { favorites, ...botWithoutFavorites } = bot;

      return {
        bot: {
          ...botWithoutFavorites,
          published:
            bot.published === null
              ? null
              : {
                  ratingsCount: bot.published.ratingsCount,
                  rating: bot.published.rating,
                  yourRating:
                    bot.published.ChatBotRatings &&
                    bot.published.ChatBotRatings.length !== 0
                      ? bot.published.ChatBotRatings[0].rating
                      : null,
                  publishedAt: bot.published.publishedAt,
                },
          favoritedAt:
            !bot.favorites || bot.favorites.length === 0
              ? null
              : bot.favorites[0].createdAt,
        },
      };
    }),

  // Publish a bot
  publish: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.publishedChatBot.create({
        data: {
          chatbot: {
            connect: {
              id: input.id,
              author: {
                id: ctx.uid,
              },
            },
          },
        },
      });
    }),

  // Unpublish a bot
  unpublish: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.publishedChatBot.delete({
        where: {
          id: input.id,
          chatbot: {
            author: {
              id: ctx.uid,
            },
          },
        },
      });
    }),

  // Favorite a bot
  favorite: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.favoriteChatBot.create({
        data: {
          chatbot: {
            connect: {
              id: input.id,
            },
          },
          user: {
            connect: {
              id: ctx.uid,
            },
          },
        },
      });
    }),

  // Unfavorite a bot
  unfavorite: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.favoriteChatBot.delete({
        where: {
          userId_chatbotId: {
            chatbotId: input.id,
            userId: ctx.uid,
          },
        },
      });
    }),

  // Rate a bot
  rate: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
        rating: z.number().min(1).max(5),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingRating = await ctx.prisma.chatBotRating.findUnique({
        where: {
          chatbotId_userId: {
            chatbotId: input.id,
            userId: ctx.uid,
          },
        },
        select: {
          rating: true,
          chatbot: {
            select: {
              ratingsCount: true,
              ratingsTotal: true,
            },
          },
        },
      });
      if (existingRating) {
        const newCount = existingRating.chatbot.ratingsCount;
        const newTotal =
          existingRating.chatbot.ratingsTotal -
          existingRating.rating +
          input.rating;
        const newAvg = newTotal / newCount;
        await ctx.prisma.chatBotRating.update({
          where: {
            chatbotId_userId: {
              chatbotId: input.id,
              userId: ctx.uid,
            },
          },
          data: {
            rating: input.rating,
            chatbot: {
              update: {
                ratingsTotal: newTotal,
                ratingsCount: newCount,
                rating: newAvg,
              },
            },
          },
        });
      } else {
        await ctx.prisma.publishedChatBot.update({
          where: {
            id: input.id,
          },
          data: {
            ChatBotRatings: {
              create: {
                rating: input.rating,
                user: {
                  connect: {
                    id: ctx.uid,
                  },
                },
              },
            },
            ratingsTotal: {
              increment: input.rating,
            },
            ratingsCount: {
              increment: 1,
            },
          },
        });
      }
    }),
});
