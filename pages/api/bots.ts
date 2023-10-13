import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react";


export type ApibotsResponseData = Prisma.ChatBotGetPayload<{
    select: {
        id: true,
        name: true,
        description: true,
        categories: true,
        featured: true,
    }
}>[];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApibotsResponseData>
) {
    const session = await getSession({ req });
    if (!session || !session.user) {
        res.statusCode = 403;
        return { notFound: true, };
    }

    const bots = await prisma.chatBot.findMany({
        where: {
            OR: [
                {
                    author: {
                        email: session.user.email,
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
        }
    }) ?? [];

    res.statusCode = 200;
    res.json(bots);
}