import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";


export type ApiChatMsgResponseData = Prisma.ChatMessageGetPayload<{
    select: {
        author: true,
        content: true,
        streaming: true,
    }
}>;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiChatMsgResponseData | string>
) {
    const session = await getServerSession(req, res, authOptions);
    if (session === null || session.user === undefined) {
        res.statusCode = 401;
        res.send("Not authenticated");
        res.end();
        return;
    }

    const msgId = req.query.msg as string;

    const message = await prisma.chatMessage.findUnique({
        where: {
            id: msgId,
        },
        select: {
            author: true,
            content: true,
            streaming: true,
        }
    });

    if (message === null) {
        res.statusCode = 404;
        res.send("Message not found");
        res.end();
        return;
    }

    res.statusCode = 200;
    res.json(message);
    res.end();
}