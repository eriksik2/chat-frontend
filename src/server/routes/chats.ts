import { z } from "zod";
import { authorizedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const chatsRouter = router({
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
              frequency_bias: true,
              presence_bias: true,
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

  // Post a message to a chat
  postMessage: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
        author: z.union([z.literal("USER"), z.literal("CHATBOT")]),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.chatMessage.create({
        data: {
          author: input.author,
          content: input.content,
          chat: {
            connect: {
              authorId: ctx.uid,
              id: input.id,
            },
          },
        },
      });
    }),

  // Rename a chat
  rename: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.chat.update({
        where: {
          id: input.id,
          authorId: ctx.uid,
        },
        data: {
          name: input.name,
        },
      });
    }),
});
