import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authOptions } from "../../auth/[...nextauth]";

export type ApiBotFavouriteGETResponse = {
  favourite: boolean;
};

export type ApiBotFavouritePOSTResponse = {};
export type ApiBotFavouriteDELETEResponse = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | ApiBotFavouriteGETResponse
    | ApiBotFavouritePOSTResponse
    | ApiBotFavouriteDELETEResponse
    | string
  >,
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.query.bot === undefined || typeof req.query.bot !== "string") {
    res.statusCode = 400;
    res.send("Bad request: bot id not specified correctly");
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
  session: Session | null,
  req: NextApiRequest,
  res: NextApiResponse<ApiBotFavouriteGETResponse | string>,
) {
  if (session === null || session.user === undefined) {
    res.statusCode = 200;
    res.json({ favourite: false });
    res.end();
    return;
  }
  var bot;
  try {
    bot = await prisma.favoriteChatBot.findUnique({
      where: {
        userId_chatbotId: {
          chatbotId: req.query.bot as string,
          userId: session.user.id,
        },
      },
      select: {
        chatbotId: true,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      res.statusCode = 500;
      res.send(`Failed to get chatbot favourite status: ${e.code}`);
      res.end();
      return;
    } else {
      res.statusCode = 500;
      res.send(`Failed to get chatbot favourite status: ${e}`);
      res.end();
      return;
    }
  }

  res.statusCode = 200;
  res.json({
    favourite: bot !== null,
  });
  res.end();
}

async function postHandler(
  session: Session | null,
  req: NextApiRequest,
  res: NextApiResponse<ApiBotFavouritePOSTResponse | string>,
) {
  if (session === null || session.user === undefined) {
    res.statusCode = 401;
    res.send("Not authenticated");
    res.end();
    return;
  }
  //const body = req.body as ApiBotPublishPOSTBody;

  try {
    await prisma.favoriteChatBot.create({
      data: {
        chatbot: {
          connect: {
            id: req.query.bot as string,
          },
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      res.statusCode = 500;
      res.send(`Failed to favourite chatbot: ${e}`);
      res.end();
      return;
    } else {
      res.statusCode = 500;
      res.send("Failed to favourite chatbot: error occurred");
      res.end();
      return;
    }
  }

  res.statusCode = 200;
  res.json({});
  res.end();
}

async function deleteHandler(
  session: Session | null,
  req: NextApiRequest,
  res: NextApiResponse<ApiBotFavouriteDELETEResponse | string>,
) {
  if (session === null || session.user === undefined) {
    res.statusCode = 401;
    res.send("Not authenticated");
    res.end();
    return;
  }

  try {
    await prisma.favoriteChatBot.delete({
      where: {
        userId_chatbotId: {
          chatbotId: req.query.bot as string,
          userId: session.user.id,
        },
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      res.statusCode = 500;
      res.send(`Failed to unfavourite chatbot: ${e.code}`);
      res.end();
      return;
    } else {
      res.statusCode = 500;
      res.send("Failed to unfavourite chatbot: error occurred");
      res.end();
      return;
    }
  }

  res.statusCode = 200;
  res.json({});
  res.end();
}
