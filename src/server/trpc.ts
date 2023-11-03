/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */
import * as trpcNext from "@trpc/server/adapters/next";
import { TRPCError, initTRPC } from "@trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// @ts-ignore
import superjson from "superjson";

export const createContext = async (
  opts: trpcNext.CreateNextContextOptions,
) => {
  const session = await getServerSession(opts.req, opts.res, authOptions);
  return {
    uid: session?.user?.id ?? null,
    prisma,
  };
};

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

/**
 * Routers
 */
export const router = t.router;
export const mergeRouters = t.mergeRouters;

/**
 * Middleware
 */
export const middleware = t.middleware;
const isAuthorized = t.middleware(({ ctx, next }) => {
  if (!ctx.uid) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      uid: ctx.uid,
    },
  });
});

/**
 * Procedures
 **/
export const publicProcedure = t.procedure;
export const authorizedProcedure = t.procedure.use(isAuthorized);
