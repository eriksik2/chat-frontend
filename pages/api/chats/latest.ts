import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";


export type ApiChatLatestGETResponse = Prisma.ChatGetPayload<{
    select: {
        id: true,
    },
}> | null;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiChatLatestGETResponse | string>
) {
    const session = await getServerSession(req, res, authOptions);
    if (session === null || session.user === undefined || session.user.email === undefined) {
        res.statusCode = 401;
        res.send("Not authenticated");
        res.end();
        return;
    }

    const doRedirect =
        req.query.redirect === "true" ||
        req.query.redirect === "1";

    var chatId;
    try {
        chatId = await prisma.chat.findFirst({
            where: {
                author: {
                    email: session.user.email,
                },
            },
            select: {
                id: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        });
    } catch (e) {
        res.statusCode = 500;
        res.send("Failed to satisfy request: internal server error");
        res.end();
    }

    res.statusCode = 200;
    doRedirect && res.redirect(307, `/chats/${chatId?.id ?? ""}`);
    res.json(chatId ?? null);
    res.end();
}