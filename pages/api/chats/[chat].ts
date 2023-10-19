import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// GET: get the chat and its messages
export type ApiChatGETResponse = Prisma.ChatGetPayload<{
  select: {
    messages: {
      select: {
        id: true;
        content: true;
        author: true;
      };
      orderBy: { createdAt: "asc" };
    };
    chatbot: {
      select: {
        id: true;
        name: true;
        model: true;
        systemMessage: true;
        temperature: true;
        frequency_bias: true;
        presence_bias: true;
        plugins: true;
      };
    };
  };
}>;

// POST: post a message to the chat
export type ApiChatPOSTBody =
  | {
      type: "message";
      author: "USER" | "CHATBOT";
      content: string;
    }
  | {
      type: "name";
      name: string;
    };

export type ApiChatPOSTResponse = {};

// DELETE: delete the chat
export type ApiChatDELETEResponse = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    ApiChatGETResponse | ApiChatPOSTResponse | ApiChatDELETEResponse | string
  >,
) {
  const session = await getServerSession(req, res, authOptions);
  if (
    session === null ||
    session.user === undefined ||
    session.user.email === undefined
  ) {
    res.statusCode = 401;
    res.send("Not authenticated");
    res.end();
    return;
  }
  try {
    switch (req.method) {
      case "GET":
        await getHandler(session, req, res);
        break;
      case "POST":
        await postHandler(session, req, res);
        break;
      case "DELETE":
        await deleteHandler(session, req, res);
        break;
      default:
        res.statusCode = 405;
        res.end();
    }
  } catch (e) {
    res.statusCode = 500;
    res.send("Failed to satisfy request: internal server error");
    res.end();
  }
}

async function getHandler(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<ApiChatGETResponse | string>,
) {
  const chat = await prisma.chat.findUnique({
    where: {
      id: req.query.chat as string,
      author: {
        email: session.user!.email!,
      },
    },
    select: {
      messages: {
        select: {
          id: true,
          content: true,
          author: true,
        },
        orderBy: { createdAt: "asc" },
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
    res.statusCode = 404;
    res.send("Chat not found");
    res.end();
    return;
  }

  res.statusCode = 200;
  res.json(chat);
  res.end();
}

async function postHandler(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<ApiChatPOSTResponse | string>,
) {
  const body = req.body as ApiChatPOSTBody;

  if (body.type === "message") {
    try {
      await prisma.chatMessage.create({
        data: {
          author: body.author,
          content: body.content,
          chat: {
            connect: {
              id: req.query.chat as string,
            },
          },
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        res.statusCode = 500;
        res.send(`Failed to post message: ${e.code}`);
        res.end();
        return;
      } else {
        res.statusCode = 500;
        res.send("Failed to post message: error occurred");
        res.end();
        return;
      }
    }
  } else if (body.type === "name") {
    try {
      await prisma.chat.update({
        where: {
          id: req.query.chat as string,
        },
        data: {
          name: body.name,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        res.statusCode = 500;
        res.send(`Failed to change chat name: ${e.code}`);
        res.end();
        return;
      } else {
        res.statusCode = 500;
        res.send("Failed to change chat name: error occurred");
        res.end();
        return;
      }
    }
  } else {
    res.statusCode = 400;
    res.send("Invalid request body");
    res.end();
    return;
  }

  res.statusCode = 200;
  res.json({});
  res.end();
}

async function deleteHandler(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<ApiChatDELETEResponse | string>,
) {
  try {
    await prisma.chat.delete({
      where: {
        id: req.query.chat as string,
        author: {
          email: session.user!.email!,
        },
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      res.statusCode = 500;
      res.send(`Failed to delete chat: ${e.code}`);
      res.end();
      return;
    } else {
      res.statusCode = 500;
      res.send("Failed to delete chat: error occurred");
      res.end();
      return;
    }
  }

  res.statusCode = 200;
  res.end();
}
