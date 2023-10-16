import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authOptions } from "../../auth/[...nextauth]";


export type ApiBotStatsGETResponse = {
    chats: number;
};


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiBotStatsGETResponse | string>
) {
    const session = await getServerSession(req, res, authOptions);
    if (req.query.bot === undefined || typeof req.query.bot !== "string") {
        res.statusCode = 400;
        res.send("Bad request: bot id not specified correctly");
        res.end();
        return;
    }

    try { // Make sure the chatbot is published or the user owns the chatbot.
        const OR: Prisma.ChatBotWhereInput[] = [];
        if (session !== null && session.user !== undefined && session.user.email) {
            OR.push({
                author: {
                    email: session.user.email,
                },
            });
        }
        OR.push({
            published: {
                publishedAt: {
                    lte: new Date(),
                },
            },
        });

        const bot = await prisma.chatBot.findUnique({
            where: {
                id: req.query.bot as string,
                OR: OR,
            },
            select: {
                id: true,
            }
        });
    } catch (e) {
        res.statusCode = 500;
        res.send("Failed to get chatbot stats: internal server error");
        res.end();
        return;
    }

    try {
        switch (req.method) {
            case "GET":
                await getHandler(session, req, res);
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
    res: NextApiResponse<ApiBotStatsGETResponse | string>
) {
    var count;
    try {
        count = await prisma.chat.count({
            where: {
                chatbot: {
                    id: req.query.bot as string,
                },
            }
        });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            res.statusCode = 500;
            res.send(`Failed to get chatbot stats: ${e.code}`);
            res.end();
            return;
        } else {
            res.statusCode = 500;
            res.send(`Failed to get chatbot stats: ${e}`);
            res.end();
            return;
        }
    }



    res.statusCode = 200;
    res.json({
        chats: count,
    });
    res.end();
}
