import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export type ApiChatLatestGETResponse = Prisma.ChatGetPayload<{
  select: {
    id: true;
  };
}> | null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiChatLatestGETResponse | string>,
) {
  const session = await getServerSession(req, res, authOptions);
  const notAuthenticated = !session?.user;
  const doRedirect =
    req.query.redirect === "true" || req.query.redirect === "1";

  if (notAuthenticated && doRedirect) {
    res.redirect(307, `/chats`);
    return;
  }

  if (notAuthenticated) {
    res.statusCode = 401;
    res.send("Not authenticated");
    res.end();
    return;
  }

  var chatId;
  try {
    chatId = await prisma.chat.findFirst({
      where: {
        author: {
          id: session.user!.id,
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (e) {
    res.statusCode = 500;
    res.send("Failed to satisfy request: internal server error");
    res.end();
  }

  if (doRedirect) {
    res.redirect(307, `/chats/${chatId?.id ?? ""}`);
  } else {
    res.statusCode = 200;
    res.json(chatId ?? null);
    res.end();
  }
}
