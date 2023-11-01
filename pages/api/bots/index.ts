import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export type ApibotsGETQuery = {
  search?: string;
  searchByDesc?: "1";
  searchBySysm?: "1"; // system message
  maxTemp?: `${number}`;
  minTemp?: `${number}`;
  models?: string[];
  tags?: string[];
  sortBy?: "new" | "rating" | "popular" | "name";

  user?: `${number}`;
  published?: `${boolean}`;

  getCount?: "1";
  show?: `${number}`;
  page?: `${number}`;
};

export type ApibotsGETResponse =
  | {
      type: "data";
      data: Prisma.ChatBotGetPayload<{
        select: {
          id: true;
          tags: true;
          featured: true;
        };
      }>[];
    }
  | {
      type: "count";
      count: number;
      pages: number;
    };

// POST: create a new chatbot
export type ApibotsPOSTBody = {
  name: string;
  description: string;
  tags: string[];
  model: string;
  systemMessage: string | null;
  temperature: number;
  frequency_bias: number;
  presence_bias: number;
};

export type ApibotsPOSTResponse = {
  id: string;
};

function validateTags(tags: string[]): boolean {
  const valid = [
    "Famous person",
    "Math",
    "Science",
    "History",
    "Language",
    "Creative",
    "Entertainment",
    "Politics",
    "Religion",
    "Philosophy",
    "Psychology",
    "Geography",
    "Health",
    "Business",
  ];
  for (const tag of tags) {
    if (!valid.includes(tag)) {
      return false;
    }
  }
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApibotsGETResponse | ApibotsPOSTResponse | string>,
) {
  const session = await getServerSession(req, res, authOptions);

  try {
    switch (req.method) {
      case "GET":
        await getHandler(session, req, res);
        break;
      case "POST":
        await postHandler(session, req, res);
        break;
      default:
        res.statusCode = 405;
        res.send(`Method ${req.method} not allowed`);
        res.end();
    }
  } catch (e) {
    res.statusCode = 500;
    res.send("Failed to satisfy request: internal server error: " + e);
    res.end();
  }
}

async function getHandler(
  session: Session | null,
  req: NextApiRequest,
  res: NextApiResponse<ApibotsGETResponse | string>,
) {
  const query = req.query as ApibotsGETQuery;
  if (query.models !== undefined) {
    query.models = (query.models as unknown as string).split(",");
  }
  if (query.tags !== undefined) {
    query.tags = (query.tags as unknown as string).split(",");
    if (!validateTags(query.tags)) {
      res.statusCode = 400;
      res.send("Invalid tags");
      res.end();
      return;
    }
  }

  var orderBy: Prisma.ChatBotOrderByWithRelationInput;
  switch (query.sortBy) {
    case "new":
      orderBy = {
        createdAt: "desc",
      };
      break;
    case "rating":
      orderBy = {
        published: {
          rating: "desc",
        },
      };
      break;
    case undefined:
    case "popular":
      orderBy = {
        chats: {
          _count: "desc",
        },
      };
      break;
    case "name":
      orderBy = {
        name: "asc",
      };
      break;
  }

  const userid = query.user ? parseInt(query.user) : undefined;
  const userIsSelf = userid !== undefined && session?.user?.id === userid;

  if (!userIsSelf && query.published === "false") {
    res.statusCode = 200;
    res.json({ type: "data", data: [] });
    res.end();
    return;
  }

  const published = userIsSelf ? query.published : "true";

  const take = query.show ? parseInt(query.show) : 20;
  const skip = query.page ? parseInt(query.page) * take : 0;

  const prismaWhereQuery: Prisma.ChatBotWhereInput = {
    AND: [
      {
        // User is author or bot is published
        AND: (() => {
          const and: Prisma.ChatBotWhereInput[] = [];
          if (userid) {
            and.push({
              author: {
                id: userid,
              },
            });
          }
          if (published === "true") {
            and.push({
              published: {
                publishedAt: {
                  lte: new Date(),
                },
              },
            });
          } else if (published === "false") {
            and.push({
              published: null,
            });
          }
          return and;
        })(),
      },

      // TODO Apparently Prisma doesnt support full text search properly. https://github.com/prisma/prisma/issues/8950
      {
        // Search by name, description, or system message
        OR: (() => {
          const or: Prisma.ChatBotWhereInput[] = [];
          if (query.search) {
            or.push({
              name: {
                contains: query.search,
                mode: "insensitive",
              },
            });
            if (query.searchByDesc) {
              or.push({
                description: {
                  contains: query.search,
                  mode: "insensitive",
                },
              });
            }
            if (query.searchBySysm) {
              or.push({
                systemMessage: {
                  contains: query.search,
                  mode: "insensitive",
                },
              });
            }
          }
          return or;
        })(),
      },
    ],

    // Filter by category
    tags:
      query.tags === undefined
        ? undefined
        : {
            hasEvery: query.tags,
          },

    // Filter by temperature
    temperature: {
      gte: query.minTemp ? parseFloat(query.minTemp) : 0,
      lte: query.maxTemp ? parseFloat(query.maxTemp) : 2,
    },

    // Filter by model
    model: {
      in: query.models ?? [],
    },
  };

  if (query.getCount !== "1") {
    const bots =
      (await prisma.chatBot.findMany({
        skip,
        take,
        orderBy,
        where: prismaWhereQuery,
        select: {
          id: true,
          tags: true,
          featured: true,
        },
      })) ?? [];

    res.statusCode = 200;
    res.json({
      type: "data",
      data: bots,
    });
    res.end();
  } else {
    const count = await prisma.chatBot.count({
      where: prismaWhereQuery,
    });
    res.statusCode = 200;
    res.json({
      type: "count",
      count: count,
      pages: Math.ceil(count / take),
    });
    res.end();
  }
}

async function postHandler(
  session: Session | null,
  req: NextApiRequest,
  res: NextApiResponse<ApibotsPOSTResponse | string>,
) {
  if (session === null || session.user === undefined) {
    res.statusCode = 401;
    res.send("Not authenticated");
    res.end();
    return;
  }

  const body = req.body as ApibotsPOSTBody;

  if (!validateTags(body.tags)) {
    res.statusCode = 400;
    res.send("Invalid tags");
    res.end();
    return;
  }

  var bot;
  try {
    bot = await prisma.chatBot.create({
      data: {
        name: body.name,
        description: body.description,
        tags: body.tags,
        model: body.model,
        systemMessage: body.systemMessage,
        temperature: body.temperature,
        frequency_bias: body.frequency_bias,
        presence_bias: body.presence_bias,

        author: {
          connect: {
            id: session.user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      res.statusCode = 500;
      res.send(`Failed to create chatbot: ${e.code}`);
      res.end();
      return;
    } else {
      res.statusCode = 500;
      res.send("Failed to create chatbot: error occurred: " + e);
      res.end();
      return;
    }
  }

  res.statusCode = 200;
  res.json(bot);
  res.end();
}
