import TabsLayout from "@/components/Layout/TabsLayout";
import ChatBotList from "@/components/chatbot/ChatBotList";
import { useSession } from "next-auth/react";
import { ReactElement } from "react";
import { FaRegComments, FaUsersGear } from "react-icons/fa6";


export default function BotsPage() {
    return <ChatBotList />;
}

function BotsPageLayout(props: { page: ReactElement }) {
    const { data } = useSession();

    return <TabsLayout
        tabsLocation="top"
        pages={[
            {
                name: "Chatbots",
                route: "/bots",
                icon: <FaUsersGear className="text-2xl" />,
            },
            {
                name: "Chats",
                route: data === null ? "/chats" : "/api/chats/latest?redirect=true",
                isActive: (activeRoute, btnRoute) => {
                    return activeRoute.includes("/chats/");
                },
                icon: <FaRegComments className="text-2xl" />,
            }
        ]}
    >
        {props.page}
    </TabsLayout>;
}

BotsPage.getLayout = function getLayout(page: ReactElement) {
    return <BotsPageLayout page={page} />;
}