import TabsLayout from "@/components/Layout/TabsLayout";
import ChatBotList from "@/components/chatbot/ChatBotList";
import { useSession } from "next-auth/react";
import { ReactElement } from "react";
import { FaRegComments, FaUsersGear } from "react-icons/fa6";


export default function BotsPage() {
    return <ChatBotList />;
}

BotsPage.getLayout = function getLayout(page: ReactElement) {
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
                route: "/api/chats/latest?redirect=true",
                isActive: (activeRoute, btnRoute) => {
                    return activeRoute.includes("/chats/");
                },
                icon: <FaRegComments className="text-2xl" />,
            }
        ]}
    >
        {page}
    </TabsLayout>;
}