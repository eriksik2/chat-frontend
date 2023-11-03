import { mergeRouters } from "../../trpc";
import { botMutationsRouter } from "./botMutations";
import { botQueriesRouter } from "./botQueries";

export const botsRouter = mergeRouters(botMutationsRouter, botQueriesRouter);
