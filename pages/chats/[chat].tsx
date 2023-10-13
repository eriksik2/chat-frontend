import { useState, useEffect, useRef, ReactElement, ReactNode } from "react";
import { ApiChatGETResponse, ApiChatPOSTBody } from "../api/chats/[chat]";
import { useRouter } from "next/router";
import ChatMessageComponent from "@/components/chat/ChatMessageComponent";
import ChatTextBox from "@/components/chat/ChatTextBox";
import clsx from "clsx";
import useSWR from 'swr';
import BotsPage from "../bots";
import TabsLayout from "@/components/Layout/TabsLayout";
import { ApiChatsGETResponse } from "../api/chats";
import Chat from "@/components/chat/Chat";
import { useApiGET } from "@/api/fetcher";

type ChatPageProps = {};

export default function ChatPage(props: ChatPageProps) {
    const router = useRouter();
    // TODO null handling
    if (typeof router.query.chat !== 'string') return null;
    return <Chat id={router.query.chat} />
}

function ChatButtonBuilder({ name, icon, route }: { name: string, icon: ReactNode, route: string }) {
    const router = useRouter();
    const active = router.asPath.includes(route);
    return <div className={clsx(
        "bg-slate-400 px-4 py-3 flex flex-row justify-start gap-2",
        active ? "bg-slate-500" : "bg-slate-400",
    )}>
        <div>{icon}</div>
        <div>{name}</div>
    </div>;
}

function ChatPageLayout(props: { page: ReactElement }) {
    const { data, error, reloading } = useApiGET<ApiChatsGETResponse>("/api/chats");
    const chats = data;
    const loading = chats === null && reloading;

    // TODO better loading and null handling
    if (error !== null) return <div>
        <h1 className="text-2xl">Error</h1>
        <div>{error.status}</div>
        <div>{error.message}</div>
    </div>;

    return <TabsLayout
        tabsLocation="left"
        tabsGap="0"
        pages={(chats ?? []).map(chat => {
            return {
                name: chat.name ?? "Chat",
                route: `/chats/${chat.id}`,
                icon: "🤖",
            }
        })}
        buttonBuilder={ChatButtonBuilder}
    >
        {props.page}
    </TabsLayout>;
}

ChatPage.getLayout = function getLayout(page: ReactElement) {
    return BotsPage.getLayout(<ChatPageLayout page={page} />);
}