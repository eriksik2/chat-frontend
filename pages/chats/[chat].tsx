import { useState, useEffect, useRef, ReactElement, ReactNode } from "react";
import { ApiChatGETResponse, ApiChatPOSTBody } from "../api/chats/[chat]";
import { useRouter } from "next/router";
import ChatMessageComponent from "@/components/chat/ChatMessageComponent";
import ChatTextBox from "@/components/chat/ChatTextBox";
import clsx from "clsx";
import useSWR from 'swr';
import BotsPage from "../bots";
import TabsLayout from "@/components/Layout/TabsLayout";
import { ApiChatsResponseData } from "../api/chats";
import Chat from "@/components/chat/Chat";

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
        "bg-slate-400 px-2 flex flex-row",
        active ? "bg-slate-500" : "bg-slate-400",
    )}>
        {icon}
        {name}
    </div>;
}

function ChatPageLayout(props: { page: ReactElement }) {
    const data = useSWR("/api/chats", (url: string) => fetch(url).then(res => res.json() as Promise<ApiChatsResponseData>));
    const chats = data.data;
    const reloading = data.isLoading;
    const loading = chats === undefined && reloading;
    const noChats = chats === undefined && !reloading;

    return BotsPage.getLayout(
        <TabsLayout
            tabsLocation="left"
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
        </TabsLayout>
    );
}

ChatPage.getLayout = function getLayout(page: ReactElement) {
    return <ChatPageLayout page={page} />;
}