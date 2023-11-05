import { z } from "zod";
import { authorizedProcedure, publicProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const chatQueriesRouter = router({
  // Get a chat
  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const chat = await ctx.prisma.chat.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          author: {
            select: {
              name: true,
            },
          },
          linkSharedAt: true,
          authorId: true,
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              author: true,
              content: true,
              createdAt: true,
            },
          },
          chatbot: {
            select: {
              id: true,
              name: true,
              model: true,
              systemMessage: true,
              temperature: true,
              plugins: true,
            },
          },
        },
      });

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const linkAccess =
        chat.linkSharedAt !== null && chat.linkSharedAt < new Date();
      const authorAccess = ctx.uid !== null && chat.authorId === ctx.uid;

      if (!linkAccess && !authorAccess) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      return {
        chat,
      };
    }),

  all: authorizedProcedure.query(async ({ input, ctx }) => {
    const chats = await ctx.prisma.chat.findMany({
      where: {
        author: {
          id: ctx.uid,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!chats) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return {
      chats,
    };
  }),

  // Get id of newest chat
  newest: authorizedProcedure.query(async ({ input, ctx }) => {
    const chat = await ctx.prisma.chat.findFirst({
      where: {
        authorId: ctx.uid,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
      },
    });

    return {
      id: chat?.id ?? null,
    };
  }),
});
