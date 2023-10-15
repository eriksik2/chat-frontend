import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


export type ApibotGETResponse = Prisma.ChatBotGetPayload<{
    select: {
        id: true,
        name: true,
        description: true,
        categories: true,
        featured: true,
        author: {
            select: {
                name: true,
                email: true,
            },
        },

        model: true,
        temperature: true,
        frequency_bias: true,
        presence_bias: true,
        systemMessage: true,
    },
}>;

export type ApiBotPOSTBody = Prisma.ChatBotGetPayload<{
    select: {
        name: true,
        description: true,
        categories: true,

        model: true,
        temperature: true,
        frequency_bias: true,
        presence_bias: true,
        systemMessage: true,
    },
}>;

export type ApiBotPOSTResponse = {};

export type ApiBotDELETEResponse = {};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApibotGETResponse | ApiBotPOSTResponse | ApiBotDELETEResponse | string>
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
    res: NextApiResponse<ApibotGETResponse | string>
) {
    var bot;
    try {
        bot = await prisma.chatBot.findUnique({
            where: {
                id: req.query.bot as string,
                OR: [
                    {
                        author: {
                            email: session?.user?.email,
                        },
                    },
                    {
                        publishedAt: {
                            lte: new Date(),
                        }
                    }
                ],
            },
            select: {
                id: true,
                name: true,
                description: true,
                categories: true,
                featured: true,
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },

                model: true,
                temperature: true,
                frequency_bias: true,
                presence_bias: true,
                systemMessage: true,
            }
        });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            res.statusCode = 500;
            res.send(`Failed to get chatbot: ${e.code}`);
            res.end();
            return;
        } else {
            res.statusCode = 500;
            res.send(`Failed to get chatbot: ${e}`);
            res.end();
            return;
        }
    }

    if (!bot) {
        res.statusCode = 404;
        res.send("Chatbot not found");
        res.end();
        return;
    }

    res.statusCode = 200;
    res.json(bot);
    res.end();
}

async function postHandler(
    session: Session | null,
    req: NextApiRequest,
    res: NextApiResponse<ApiBotPOSTResponse | string>
) {
    if (session === null || session.user === undefined || session.user.email === undefined) {
        res.statusCode = 401;
        res.send("Not authenticated");
        res.end();
        return;
    }

    const body = req.body as ApiBotPOSTBody;

    try {
        await prisma.chatBot.update({
            where: {
                id: req.query.bot as string,
                author: {
                    email: session.user.email,
                },
            },
            data: {
                name: body.name,
                description: body.description,
                categories: body.categories,

                model: body.model,
                temperature: body.temperature,
                frequency_bias: body.frequency_bias,
                presence_bias: body.presence_bias,
                systemMessage: body.systemMessage,
            },
        });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            res.statusCode = 500;
            res.send(`Failed to edit chatbot: ${e}`);
            res.end();
            return;
        } else {
            res.statusCode = 500;
            res.send("Failed to edit chatbot: error occurred");
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
    res: NextApiResponse<ApiBotDELETEResponse | string>
) {
    if (session === null || session.user === undefined || session.user.email === undefined) {
        res.statusCode = 401;
        res.send("Not authenticated");
        res.end();
        return;
    }
    try {
        await prisma.chatBot.delete({
            where: {
                id: req.query.bot as string,
                author: {
                    email: session.user.email,
                },
            }
        });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            res.statusCode = 500;
            res.send(`Failed to delete chatbot: ${e.code}`);
            res.end();
            return;
        } else {
            res.statusCode = 500;
            res.send("Failed to delete chatbot: error occurred");
            res.end();
            return;
        }
    }

    res.statusCode = 200;
    res.json({});
    res.end();
}
