import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react";


export type ApiChatsResponseData = Prisma.ChatGetPayload<{
    select: {
        id: true,
        name: true,
    }
}>[];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiChatsResponseData | string>
) {
    const session = await getSession({ req });
    if (!session || !session.user) {
        res.statusCode = 403;
        res.send("Not authenticated");
        res.end();
        return;
    }

    const chats = await prisma.chat.findMany({
        where: {
            author: {
                email: session.user.email,
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