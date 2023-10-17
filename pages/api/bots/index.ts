import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
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
    category?: string;
    sortBy?: "new" | "rating" | "popular" | "name";

    show?: `${number}`;
    page?: `${number}`;
};

export type ApibotsGETResponse = Prisma.ChatBotGetPayload<{
    select: {
        id: true,
        categories: true,
        featured: true,
    }
}>[];

// POST: create a new chatbot
export type ApibotsPOSTBody = {
    name: string;
    description: string;
    categories: string[];
    model: string;
    systemMessage: string | null;
    temperature: number;
    frequency_bias: number;
    presence_bias: number;
};

export type ApibotsPOSTResponse = {
    id: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApibotsGETResponse | ApibotsPOSTResponse | string>
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
    res: NextApiResponse<ApibotsGETResponse>
) {
    const query = req.query as ApibotsGETQuery;
    if (query.models !== undefined) {
        query.models = (query.models as unknown as string).split(",");
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

    const take = query.show ? parseInt(query.show) : 10;
    const skip = query.page ? parseInt(query.page) * take : 0;

    const bots = await prisma.chatBot.findMany({
        skip,
        take,
        orderBy,
        where: {
            AND: [
                { // User is author or bot is published
                    OR: (() => {
                        const or: Prisma.ChatBotWhereInput[] = [];
                        if (session && session.user && session.user.email) {
                            or.push({
                                author: {
                                    email: session.user.email,
                                },
                            });
                        }
                        or.push({
                            published: {
                                publishedAt: {
                                    lte: new Date(),
                                }
                            }
                        });
                        return or;
                    })(),
                },

                // TODO Apparently Prisma doesnt support full text search properly. https://github.com/prisma/prisma/issues/8950
                { // Search by name, description, or system message
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
            categories: query.category === undefined ? undefined : {
                has: query.category,
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
        },
        select: {
            id: true,
            categories: true,
            featured: true,
        }
    }) ?? [];

    res.statusCode = 200;
    res.json(bots);
    res.end();
}

async function postHandler(
    session: Session | null,
    req: NextApiRequest,
    res: NextApiResponse<ApibotsPOSTResponse | string>
) {
    const body = req.body as ApibotsPOSTBody;
    var bot;
    try {
        bot = await prisma.chatBot.create({
            data: {
                name: body.name,
                description: body.description,
                categories: body.categories,
                model: body.model,
                systemMessage: body.systemMessage,
                temperature: body.temperature,
                frequency_bias: body.frequency_bias,
                presence_bias: body.presence_bias,

                author: {
                    connect: {
                        email: session!.user!.email!,
                    },
                }
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