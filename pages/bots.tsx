import {
  ChatBotFilters,
  Filter,
  defaultFilter,
} from "@/components/chatbot/ChatBotFilters";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { ApibotsGETResponse, ApibotsPOSTBody } from "./api/bots";
import { useApiPOST } from "@/api/fetcher";
import clsx from "clsx";
import { FaCirclePlus } from "react-icons/fa6";
import LoadingIcon from "@/components/util/LoadingIcon";
import { ChatBotCard } from "@/components/chatbot/ChatBotCard";
import Modal from "@/components/Modal";
import ChatBotEditStatic, {
  ChatBotEdit,
} from "@/components/chatbot/ChatBotEdit";
import ChatBotList from "@/components/chatbot/ChatBotList";

export default function BotsPage() {
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0">
      <div className="no-scrollbar overflow-auto">
        <div className={clsx("flex flex-col lg:flex-row", "gap-4 px-4 py-6")}>
          <div className="lg:w-2/5">
            <h1 className="pb-2 text-5xl">Chatbots</h1>
            <p>
              List of chatbots tagged by categories. You can select a
              pre-existing bot or add, edit, and remove chatbots as needed.
            </p>
            <br />
            <p>
              Select a chatbot and press the New Chat button, then you can chat
              with it in the Chats tab.
            </p>
          </div>
          <div className="flex flex-grow flex-col items-center justify-center">
            <ChatBotFilters value={filter} onChange={setFilter} />
          </div>
        </div>
        <ChatBotList filter={filter} />
      </div>
    </div>
  );
}
