import App from "@/state/App";
import { ApiChatsGETResponse } from "../../../pages/api/chats";
import Link from "next/link";
import useSWR, { preload } from "swr";
import { useApiGET } from "@/api/fetcher";

type ChatsListProps = {
};

export default function ChatsList(props: ChatsListProps) {
    const { data, error, reloading } = useApiGET<ApiChatsGETResponse>("/api/chats");
    const chats = data;
    const loading = chats === null && reloading;

    // TODO better loading and null handling
    if (error !== null) return <div>
        <h1 className="text-2xl">Error</h1>
        <div>{error.status}</div>
        <div>{error.message}</div>
    </div>;

    return <div>
        <h1 className="text-2xl">Chats</h1>
        <div className="flex flex-col gap-2">
            {loading && <div>Loading...</div>}
            {(chats ?? []).map((chat) => {
                preload(`/api/chats/${chat.id}`, url => fetch(url).then(res => res.json()));
                return <Link key={chat.id} href={`/chats/${chat.id}`}>
                    <div className="bg-slate-400">
                        {chat.name}
                    </div>
                </Link>;
            })}
        </div>
    </div>
}