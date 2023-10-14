import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


export type ApibotsGETResponse = Prisma.ChatBotGetPayload<{
    select: {
        id: true,
        name: true,
        description: true,
        categories: true,
        featured: true,
        author: {
            select: {
                name: true,
            },
        },
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

export type ApibotsPOSTResponse = {};

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
        res.send("Failed to satisfy request: internal server error");
        res.end();
    }
}

async function getHandler(
    session: Session | null,
    req: NextApiRequest,
    res: NextApiResponse<ApibotsGETResponse>
) {
    const bots = await prisma.chatBot.findMany({
        where: {
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
                    publishedAt: {
                        lte: new Date(),
                    }
                });
                return or;
            })(),
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
                },
            },
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
    try {
        await prisma.chatBot.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                categories: req.body.categories,
                model: req.body.model,
                systemMessage: req.body.systemMessage,
                temperature: req.body.temperature,
                frequency_bias: req.body.frequency_bias,
                presence_bias: req.body.presence_bias,

                author: {
                    connect: {
                        email: session!.user!.email!,
                    },
                }
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
            res.send("Failed to create chatbot: error occurred");
            res.end();
            return;
        }
    }

    res.statusCode = 200;
    res.json({});
    res.end();
}