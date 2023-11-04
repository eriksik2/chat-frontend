import {
  ChatBotFilters,
  Filter,
  defaultFilter,
} from "@/components/chatbot/ChatBotFilters";
import { useState } from "react";
import clsx from "clsx";
import ChatBotList from "@/components/chatbot/ChatBotList";

export default function BotsPage() {
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0">
      <div className="no-scrollbar overflow-auto">
        <div className="flex flex-col items-center gap-4 px-8 py-6 lg:flex-row">
          <div className="flex items-center justify-center lg:w-1/2">
            <div className="max-w-2xl">
              <h1 className="pb-2 text-5xl">Chatbots</h1>
              <p>
                List of chatbots tagged by categories. You can select a
                pre-existing bot or add, edit, and remove chatbots as needed.
              </p>
              <br />
              <p>
                Select a chatbot and press the New Chat button, then you can
                chat with it in the Chats tab.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center lg:w-1/2">
            <ChatBotFilters value={filter} onChange={setFilter} />
          </div>
        </div>
        <ChatBotList filter={filter} />
      </div>
    </div>
  );
}
