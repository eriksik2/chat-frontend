import { ReactElement, ReactNode } from "react";
import { useRouter } from "next/router";
import clsx from "clsx";
import BotsPage from "../bots";
import TabsLayout from "@/components/Layout/TabsLayout";
import { ApiChatsGETResponse } from "../api/chats";
import Chat from "@/components/chat/Chat";
import { useApiGET } from "@/api/fetcher";
import Link from "next/link";
import { FaTrash } from "react-icons/fa6";
import { preload, useSWRConfig } from "swr";

type ChatPageProps = {};

export default function ChatPage(props: ChatPageProps) {
    const router = useRouter();
    // TODO null handling
    if (typeof router.query.chat !== 'string') return null;
    return <Chat id={router.query.chat} />
}

function ChatButtonBuilder({ name, icon, route }: { name: string, icon: ReactNode, route: string }) {
    const router = useRouter();
    const swr = useSWRConfig();
    const active = router.asPath.includes(route);
    preload(`${route}`, url => fetch(url).then(res => res.json()));
    return <Link href={route} className={clsx(
        "flex flex-row justify-between items-center gap-2 p-2",
        active ? "bg-slate-500" : "bg-slate-400",
    )}>
        <span className="flex flex-row gap-2">
            <span>{icon}</span>
            <span>{name}</span>
        </span>
        <button
            onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const response = await fetch(`/api${route}`, {
                    method: "DELETE",
                });
                swr.mutate("/api/chats");
            }}
        >
            <FaTrash />
        </button>
    </Link>;
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