import { z } from "zod";
import { authorizedProcedure, router } from "../../trpc";

export const botMutationsRouter = router({
  // Create a new bot
  create: authorizedProcedure
    .input(
      z.object({
        id: z.string().optional(), // When updating existing bot
        name: z.string().min(1).max(100),
        description: z.string().min(1).max(1000),
        tags: z.array(z.string()),
        model: z.string(),
        systemMessage: z.string().min(1).max(1000).nullable(),
        temperature: z.number().min(0).max(2),
        frequency_bias: z.number().min(-2).max(2),
        presence_bias: z.number().min(-2).max(2),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const bot = await ctx.prisma.chatBot.upsert({
        where: {
          id: input.id ?? "-1",
          authorId: ctx.uid,
        },
        create: {
          name: input.name,
          description: input.description,
          tags: input.tags,
          model: input.model,
          systemMessage: input.systemMessage,
          temperature: input.temperature,
          frequency_bias: input.frequency_bias,
          presence_bias: input.presence_bias,

          author: {
            connect: {
              id: ctx.uid,
            },
          },
        },
        update: {
          name: input.name,
          description: input.description,
          tags: input.tags,
          model: input.model,
          systemMessage: input.systemMessage,
          temperature: input.temperature,
          frequency_bias: input.frequency_bias,
          presence_bias: input.presence_bias,
        },
        select: {
          id: true,
        },
      });
      return {
        id: bot.id,
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
