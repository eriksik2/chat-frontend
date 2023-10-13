import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";


export type ApiChatsGETResponse = Prisma.ChatGetPayload<{
    select: {
        id: true,
        name: true,
    }
}>[];

export type ApiChatsPOSTBody = {
    chatName: string;
    chatbotId: string;
};

export type ApiChatsPOSTResponse = {
    chatId: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiChatsGETResponse | ApiChatsPOSTResponse | string>
) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.email) {
        res.statusCode = 403;
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
            res.send(`Method ${req.method} not allowed`);
            res.end();
    }
}

async function getHandler(
    session: Session,
    req: NextApiRequest,
    res: NextApiResponse<ApiChatsGETResponse | string>
) {

    const chats = await prisma.chat.findMany({
        where: {
            author: {
                email: session.user!.email,
            },
        },
        select: {
            id: true,
            name: true,
        }
    }) ?? [];

    res.statusCode = 200;
    res.json(chats);
    res.end();
}

async function postHandler(
    session: Session,
    req: NextApiRequest,
    res: NextApiResponse<ApiChatsPOSTResponse | string>
) {
    const body = req.body as ApiChatsPOSTBody;

    const chat = await prisma.chat.create({
        data: {
            name: body.chatName,
            author: {
                connect: {
                    email: session.user!.email!,
                },
            },
            chatbot: {
                connect: {
                    id: body.chatbotId,
                }
            }
        },
    });

    res.statusCode = 200;
    res.json({ chatId: chat.id });
    res.end();
}