import { FaRegComments } from "react-icons/fa6";
import { navPage, navPageBuilder } from "../nav/NavController";
import TabsNav from "../nav/SideTabs/TabsNav";
import clsx from "clsx";
import App from "@/state/App";
import { useReactive } from "@/util/Reactive";
import ChatComponent from "./ChatComponent";

type ChatsListProps = {
    app: App;
};

export default function ChatsList(props: ChatsListProps) {
    const app = useReactive(props.app);

    return <TabsNav
        buttonBuilder={(name, params, isPage) => <div className={clsx(
            "flex flex-row items-center justify-between text-lg gap-4 p-3 hover:bg-slate-600",
            isPage ? "bg-slate-500" : "bg-transparent",
        )}>
            {params.icon}
            <p className="">{name}</p>
        </div>}
        pages={app.chats.map(chat => {
            return navPageBuilder(`Chat with ${chat.chatbot.name}`, {
                icon: <FaRegComments />,
                builder: (params) => <ChatComponent chat={chat} />,
            });
        })}
    />
}