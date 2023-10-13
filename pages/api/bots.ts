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
        }
    }) ?? [];

    res.statusCode = 200;
    res.json(bots);
    res.end();
}