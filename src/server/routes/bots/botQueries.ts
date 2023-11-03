import { z } from "zod";
import { authorizedProcedure, publicProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

export const botQueriesRouter = router({
  search: publicProcedure
    .input(
      z.object({
        sortBy: z.enum(["new", "rating", "popular", "name"]),

        search: z.string().optional(),
        searchByDesc: z.boolean().default(false),
        searchBySysm: z.boolean().default(false),
        maxTemp: z.number().optional(),
        minTemp: z.number().optional(),
        models: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),

        user: z.number().optional(),
        published: z.boolean().default(true),

        getCount: z.boolean().default(false),
        show: z
          .number()
          .min(1)
          .max(60, "Can't query more than 60 per page")
          .default(10),
        page: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input, ctx }) => {
      var orderBy: Prisma.ChatBotOrderByWithRelationInput;
      switch (input.sortBy) {
        case "new":
          orderBy = { createdAt: "desc" };
          break;
        case "rating":
          orderBy = { published: { rating: "desc" } };
          break;
        case "popular":
          orderBy = { chats: { _count: "desc" } };
          break;
        case "name":
          orderBy = { name: "asc" };
          break;
      }

      const userIsSelf = input.user !== undefined && ctx.uid === input.user;
      if (!userIsSelf && input.published === false) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const take = input.show;
      const skip = input.page * take;

      const prismaWhereQuery: Prisma.ChatBotWhereInput = {
        AND: [
          {
            // User is author or bot is published
            AND: (() => {
              const and: Prisma.ChatBotWhereInput[] = [];
              if (input.user !== undefined) {
                and.push({
                  author: {
                    id: input.user,
                  },
                });
              }
              if (input.published) {
                and.push({
                  published: {
                    publishedAt: {
                      lte: new Date(),
                    },
                  },
                });
              } else {
                and.push({
                  published: null,
                });
              }
              return and;
            })(),
          },

          // TODO Apparently Prisma doesnt support full text search properly. https://github.com/prisma/prisma/issues/8950
          {
            // Search by name, description, or system message
            OR: (() => {
              const or: Prisma.ChatBotWhereInput[] = [];
              if (input.search !== undefined) {
                or.push({
                  name: {
                    contains: input.search,
                    mode: "insensitive",
                  },
                });
                if (input.searchByDesc) {
                  or.push({
                    description: {
                      contains: input.search,
                      mode: "insensitive",
                    },
                  });
                }
                if (input.searchBySysm) {
                  or.push({
                    systemMessage: {
                      contains: input.search,
                      mode: "insensitive",
                    },
                  });
                }
              }
              return or;
            })(),
          },
        ],

        // Filter by category
        tags:
          input.tags.length === 0
            ? undefined
            : {
                hasEvery: input.tags,
              },

        // Filter by temperature
        temperature: {
          gte: input.minTemp,
          lte: input.maxTemp,
        },

        // Filter by model
        model: {
          in: input.models,
        },
      };

      if (!input.getCount) {
        const bots =
          (await ctx.prisma.chatBot.findMany({
            skip,
            take,
            orderBy,
            where: prismaWhereQuery,
            select: {
              id: true,
              tags: true,
              featured: true,
            },
          })) ?? [];

        return {
          bots: bots,
        };
      } else {
        const count = await ctx.prisma.chatBot.count({
          where: prismaWhereQuery,
        });
        return {
          count: count,
        };
      }
    }),
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
          tags: true,
          plugins: true,
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

  // Get how many are chatting with a bot
  getNumberOfChats: publicProcedure
    .input(
      z.object({
        chatbotId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const count = await ctx.prisma.chat.count({
        where: {
          chatbotId: input.chatbotId,
        },
      });

      return {
        count: count,
      };
    }),
});
