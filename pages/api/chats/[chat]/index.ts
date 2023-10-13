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
        name: true,
        messages: {
            select: {
                id: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" },
        },
        chatbot: {
            select: {
                name: true,
            },
        },
    },
}>;

// POST: post a message to the chat
export type ApiChatPOSTBody = {
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
            name: true,
            messages: {
                select: {
                    id: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "asc" },
            },
            chatbot: {
                select: {
                    name: true,
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
            author: "USER",
            content: body.content,
            chat: {
                connect: {
                    id: chat.id,
                },
            },
        },
    });

    (async () => {
        const dataPromise = prisma.chat.findUnique({
            where: {
                id: req.query.chat as string,
                author: {
                    email: session.user!.email,
                },
            },
            select: {
                messages: {
                    select: {
                        author: true,
                        content: true,
                    },
                    orderBy: { createdAt: "asc" },
                },
                chatbot: {
                    select: {
                        systemMessage: true,
                        model: true,
                        temperature: true,
                        frequency_bias: true,
                        presence_bias: true,
                    },
                },
            }
        });
        const openai = new OpenAI({});

        const data = (await dataPromise)!;

        var messages: Array<ChatCompletionMessageParam> = [];
        if ((data.chatbot.systemMessage ?? "").trim().length > 0) {
            messages.push({
                content: data.chatbot.systemMessage!,
                role: "system",
            });
        }
        for (const message of data.messages) {
            messages.push({
                content: message.content,
                role: message.author === "USER" ? "user" : "assistant",
            });
        }

        const response = await openai.chat.completions.create({
            stream: true,
            model: data.chatbot.model,
            temperature: data.chatbot.temperature,
            frequency_penalty: data.chatbot.frequency_bias,
            presence_penalty: data.chatbot.presence_bias,
            messages: messages,
            n: 1,
        });

        const newMessage = await prisma.chatMessage.create({
            data: {
                author: "CHATBOT",
                content: "",
                streaming: true,
                chat: {
                    connect: {
                        id: chat.id,
                    },
                },
            },
        });
        var messageAcc = "";
        for await (const chunk of response) {
            const choice = chunk.choices[0];
            messageAcc += choice.delta.content ?? "";
            if (choice.finish_reason === "stop") {
                await prisma.chatMessage.update({
                    where: {
                        id: newMessage.id,
                    },
                    data: {
                        content: messageAcc,
                        streaming: false,
                    },
                });
                break;
            } else if (choice.finish_reason === null) {
                await prisma.chatMessage.update({
                    where: {
                        id: newMessage.id,
                    },
                    data: {
                        content: messageAcc + " ...",
                    },
                });
            }
        }
    })();

    res.statusCode = 200;
    res.json({
        type: "success",
    });
    res.end();
}
