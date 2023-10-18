import TabsLayout from "@/components/Layout/TabsLayout";
import ChatBotList from "@/components/chatbot/ChatBotList";
import { useSession } from "next-auth/react";
import { ReactElement } from "react";
import { FaRegComments, FaUsersGear } from "react-icons/fa6";


export default function BotsPage() {
    return <ChatBotList />;
}