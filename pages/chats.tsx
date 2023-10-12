import TabsLayout from "@/components/Layout/TabsLayout";
import ChatsList from "@/components/chat/ChatsList";
import { ReactElement } from "react";
import { FaRegComments, FaUsersGear } from "react-icons/fa6";


export default function ChatsPage() {
    return <ChatsList />;
}

ChatsPage.getLayout = function getLayout(page: ReactElement) {
    return <TabsLayout
        tabsLocation="bottom"
        pages={[
            {
                name: "Chatbots",
                route: "/bots",
                icon: <FaUsersGear className="text-2xl" />,
            },
            {
                name: "Chats",
                route: "/chats",
                icon: <FaRegComments className="text-2xl" />,
            }
        ]}
    >
        {page}
    </TabsLayout>;
}