import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authOptions } from "../../auth/[...nextauth]";



export type ApiBotPublishPOSTResponse = {};
export type ApiBotPublishDELETEResponse = {};


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiBotPublishPOSTResponse | ApiBotPublishDELETEResponse | string>
) {
    const session = await getServerSession(req, res, authOptions);
    if (session === null || session.user === undefined || !session.user.email) {
        res.statusCode = 401;
        res.send("Not authenticated");
        res.end();
        return;
    }
    if (req.query.bot === undefined || typeof req.query.bot !== "string") {
        res.statusCode = 400;
        res.send("Bad request: bot id not specified correctly");
        res.end();
        return;
    }

    try { // Query for the bot id AND author email === session email to ensure the user owns the bot.
        const bot = await prisma.chatBot.findUnique({
            where: {
                id: req.query.bot as string,
                author: {
                    email: session.user.email,
                }
            },
            select: {
                id: true,
            }
        });
    } catch (e) {
        res.statusCode = 500;
        res.send("Failed to change the publicity of chatbot: You must own the chatbot to do this");
        res.end();
        return;
    }

    try {
        switch (req.method) {
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



async function postHandler(
    session: Session | null,
    req: NextApiRequest,
    res: NextApiResponse<ApiBotPublishPOSTResponse | string>
) {
    //const body = req.body as ApiBotPublishPOSTBody;

    try {
        await prisma.publishedChatBot.create({
            data: {
                chatbot: {
                    connect: {
                        id: req.query.bot as string,
                    },
                },
            },
        });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            res.statusCode = 500;
            res.send(`Failed to publish chatbot: ${e}`);
            res.end();
            return;
        } else {
            res.statusCode = 500;
            res.send("Failed to publish chatbot: error occurred");
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
    res: NextApiResponse<ApiBotPublishDELETEResponse | string>
) {
    try {
        await prisma.publishedChatBot.delete({
            where: {
                id: req.query.bot as string,
            }
        });
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            res.statusCode = 500;
            res.send(`Failed to unpublish chatbot: ${e.code}`);
            res.end();
            return;
        } else {
            res.statusCode = 500;
            res.send("Failed to unpublish chatbot: error occurred");
            res.end();
            return;
        }
    }

    res.statusCode = 200;
    res.json({});
    res.end();
}
