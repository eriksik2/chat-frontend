import { FaRegComments } from "react-icons/fa6";
import { navPage, navPageBuilder } from "../nav/NavController";
import TabsNav from "../nav/SideTabs/TabsNav";
import clsx from "clsx";
import App from "@/state/App";
import { useReactive } from "@/lib/Reactive";
import ChatComponent from "./ChatComponent";
import { useEffect, useState } from "react";
import { ApiChatsResponseData } from "../../../pages/api/chats";
import Link from "next/link";

type ChatsListProps = {
    app: App;
};

export default function ChatsList(props: ChatsListProps) {
    const app = useReactive(props.app);

    const [chats, setChats] = useState<ApiChatsResponseData>([]);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/chats");
            const json = (await res.json()) as ApiChatsResponseData;
            setChats(json);
        })();
    });

    return <div>
        <h1 className="text-2xl">Chats</h1>
        <div className="flex flex-col gap-2">
            {chats.map((chat) => {
                return <Link href={`/chat/${chat.id}`}>
                    <div className="bg-slate-400">
                        {chat.name}
                    </div>
                </Link>;
            })}
        </div>
    </div>
}