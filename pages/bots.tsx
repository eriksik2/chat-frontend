import {
  ChatBotFilters,
  Filter,
  defaultFilter,
} from "@/components/chatbot/ChatBotFilters";
import { useState } from "react";
import clsx from "clsx";
import ChatBotList from "@/components/chatbot/ChatBotList";
import Link from "next/link";

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
                Here you can search for chatbots to chat with. Each of these has
                a different personality or use case. Find the one you want and
                press the Start Chat button to start chatting.
              </p>
              <br />
              <p>
                Want to create your own? Go to your{" "}
                <Link
                  className="text-blue-600 visited:text-purple-500"
                  href={"/user/profile"}
                >
                  profile
                </Link>{" "}
                and click the Create a chatbot button. You can also just ask any
                chatbot with the Chat Labs plugin enabled to create one for you.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center lg:w-1/2">
            <ChatBotFilters value={filter} onChange={setFilter} />
          </div>
        </div>
        <div className="lg:px-44">
          <ChatBotList filter={filter} />
        </div>
      </div>
    </div>
  );
}
