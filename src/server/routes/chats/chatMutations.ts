import { z } from "zod";
import { authorizedProcedure, router } from "../../trpc";

export const chatMutationsRouter = router({
  // Create a new chat
  create: authorizedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        chatbotId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const chat = await ctx.prisma.chat.create({
        data: {
          name: input.name,
          author: {
            connect: {
              id: ctx.uid,
            },
          },
          chatbot: {
            connect: {
              id: input.chatbotId,
            },
          },
        },
        select: {
          id: true,
        },
      });
      return {
        id: chat.id,
      };
    }),

  // Delete a chat
  delete: authorizedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.chat.delete({
        where: {
          id: input.id,
          authorId: ctx.uid,
        },
      });
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
