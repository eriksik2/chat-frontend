import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authOptions } from "../../auth/[...nextauth]";

export type ApiBotRateGETResponse = {
  yourRating: number | null;
  average: {
    ratingsTotal: number;
    ratingsCount: number;
  };
};

export type ApiBotRatePOSTBody = {
  rating: number;
};

export type ApiBotRatePOSTResponse = {};
export type ApiBotRateDELETEResponse = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | ApiBotRateGETResponse
    | ApiBotRatePOSTResponse
    | ApiBotRateDELETEResponse
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
  res: NextApiResponse<ApiBotRateGETResponse | string>,
) {
  var personal: {
    rating: number;
  } | null = null;
  try {
    // TODO
    // Thought I could just do delete where: { user: ..., chatbot: ... } but apparently not
    // So I have to fetch the user id first seperately.
    const userId = await prisma.user.findUnique({
      where: {
        email: session!.user!.email as string,
      },
      select: {
        id: true,
      },
    });
    personal = await prisma.chatBotRating.findUnique({
      where: {
        chatbotId_userId: {
          chatbotId: req.query.bot as string,
          userId: userId!.id,
        },
      },
      select: {
        rating: true,
      },
    });
  } catch (e) {
    // Failed to get user rating, thats fine
  }

  var average: {
    ratingsTotal: number;
    ratingsCount: number;
  } | null = null;
  try {
    average = await prisma.publishedChatBot.findUnique({
      where: {
        id: req.query.bot as string,
      },
      select: {
        ratingsTotal: true,
        ratingsCount: true,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      res.statusCode = 500;
      res.send(`Failed to get chatbot rating: ${e.code}`);
      res.end();
      return;
    } else {
      res.statusCode = 500;
      res.send(`Failed to get chatbot rating: ${e}`);
      res.end();
      return;
    }
  }

  if (average === null) {
    res.statusCode = 404;
    res.send("Chatbot not found");
    res.end();
    return;
  }

  res.statusCode = 200;
  res.json({
    yourRating: personal?.rating ?? null,
    average: {
      ratingsTotal: average.ratingsTotal,
      ratingsCount: average.ratingsCount,
    },
  });
  res.end();
}

async function postHandler(
  session: Session | null,
  req: NextApiRequest,
  res: NextApiResponse<ApiBotRatePOSTResponse | string>,
) {
  if (session === null || session.user === undefined || !session.user.email) {
    res.statusCode = 401;
    res.send("Not authenticated");
    res.end();
    return;
  }

  const body = req.body as ApiBotRatePOSTBody;
  if (![1, 2, 3, 4, 5].includes(body.rating)) {
    res.statusCode = 400;
    res.send("Bad request: rating must an integer between 1 and 5 inclusive");
    res.end();
    return;
  }

  try {
    // remove old rating if it exists
    // TODO
    // Thought I could just do delete where: { user: ..., chatbot: ... } but apparently not
    // So I have to fetch the user id first seperately.
    const userId = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string,
      },
      select: {
        id: true,
      },
    });
    const data = await prisma.chatBotRating.delete({
      where: {
        chatbotId_userId: {
          chatbotId: req.query.bot as string,
          userId: userId!.id,
        },
      },
      select: {
        rating: true,
        chatbot: {
          select: {
            id: true,
          },
        },
      },
    });
    await prisma.publishedChatBot.update({
      where: {
        id: data.chatbot.id,
      },
      data: {
        ratingsTotal: {
          decrement: data.rating,
        },
        ratingsCount: {
          decrement: 1,
        },
      },
    });
  } catch (e) {
    // Failed to delete old rating because it doesnt exist, thats fine
  }

  try {
    const data = await prisma.chatBotRating.create({
      data: {
        rating: body.rating,
        chatbot: {
          connect: {
            id: req.query.bot as string,
          },
        },
        user: {
          connect: {
            email: session?.user?.email as string,
          },
        },
      },
      select: {
        rating: true,
        chatbot: {
          select: {
            id: true,
          },
        },
      },
    });
    const ratingData = await prisma.publishedChatBot.update({
      where: {
        id: data.chatbot.id,
      },
      data: {
        ratingsTotal: {
          increment: data.rating,
        },
        ratingsCount: {
          increment: 1,
        },
      },
      select: {
        ratingsCount: true,
        ratingsTotal: true,
      },
    });
    await prisma.publishedChatBot.update({
      where: {
        id: data.chatbot.id,
      },
      data: {
        rating: ratingData.ratingsTotal / ratingData.ratingsCount,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      res.statusCode = 500;
      res.send(`Failed to post rating: ${e}`);
      res.end();
      return;
    } else {
      res.statusCode = 500;
      res.send("Failed to post rating: error occurred");
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
  res: NextApiResponse<ApiBotRateDELETEResponse | string>,
) {
  if (session === null || session.user === undefined || !session.user.email) {
    res.statusCode = 401;
    res.send("Not authenticated");
    res.end();
    return;
  }
  try {
    // TODO
    // Thought I could just do delete where: { user: ..., chatbot: ... } but apparently not
    // So I have to fetch the user id first seperately.
    const userId = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string,
      },
      select: {
        id: true,
      },
    });
    const data = await prisma.chatBotRating.delete({
      where: {
        chatbotId_userId: {
          chatbotId: req.query.bot as string,
          userId: userId!.id,
        },
      },
      select: {
        rating: true,
        chatbot: {
          select: {
            id: true,
          },
        },
      },
    });
    const ratingData = await prisma.publishedChatBot.update({
      where: {
        id: data.chatbot.id,
      },
      data: {
        ratingsTotal: {
          decrement: data.rating,
        },
        ratingsCount: {
          decrement: 1,
        },
      },
      select: {
        ratingsCount: true,
        ratingsTotal: true,
      },
    });
    await prisma.publishedChatBot.update({
      where: {
        id: data.chatbot.id,
      },
      data: {
        rating:
          ratingData.ratingsCount === 0
            ? 0
            : ratingData.ratingsTotal / ratingData.ratingsCount,
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
