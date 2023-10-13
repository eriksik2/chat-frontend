import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
import { Session, getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { authOptions } from "../../auth/[...nextauth]";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";


// GET: get the chat and its messages
export type ApiChatGETResponse = Prisma.ChatGetPayload<{
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
                name: true,
                model: true,
                systemMessage: true,
                temperature: true,
                frequency_bias: true,
                presence_bias: true,
            },
        },
    },
}>;

// POST: post a message to the chat
export type ApiChatPOSTBody = {
    author: "USER" | "CHATBOT";
    content: string;
};
export type ApiChatPOSTResponse = {
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiChatGETResponse | ApiChatPOSTResponse | string>
) {
    const session = await getServerSession(req, res, authOptions);
    if (session === null || session.user === undefined) {
        res.statusCode = 401;
        res.send("Not authenticated");
        res.end();
        return;
    }
    switch (req.method) {
        case "GET":
            await getHandler(session, req, res);
            break;
        case "POST":
            await postHandler(session, req, res);
            break;
        default:
            res.statusCode = 405;
            res.end();
    }
}

async function getHandler(
    session: Session,
    req: NextApiRequest,
    res: NextApiResponse<ApiChatGETResponse | string>
) {

    const chat = await prisma.chat.findUnique({
        where: {
            id: req.query.chat as string,
            author: {
                email: session.user!.email,
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
                    name: true,
                    model: true,
                    systemMessage: true,
                    temperature: true,
                    frequency_bias: true,
                    presence_bias: true,
                },
            },
        }
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
    res: NextApiResponse<ApiChatPOSTResponse | string>
) {
    const chat = await prisma.chat.findUnique({
        where: {
            id: req.query.chat as string,
        },
        select: {
            id: true,
        },
    });

    if (!chat) {
        res.statusCode = 404;
        res.send("Chat not found");
        res.end();
        return;
    }

    const body = req.body as ApiChatPOSTBody;

    const message = await prisma.chatMessage.create({
        data: {
            author: body.author,
            content: body.content,
            chat: {
                connect: {
                    id: chat.id,
                },
            },
        },
    });

    res.statusCode = 200;
    res.json({
        type: "success",
    });
    res.end();
}
