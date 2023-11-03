import { mergeRouters } from "../../trpc";
import { chatMutationsRouter } from "./chatMutations";
import { chatQueriesRouter } from "./chatQueries";

export const chatsRouter = mergeRouters(chatMutationsRouter, chatQueriesRouter);
