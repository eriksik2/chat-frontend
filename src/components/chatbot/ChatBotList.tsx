"use client";

import { useMemo, useState } from "react";
import Modal from "../Modal";

import { FaCirclePlus } from "react-icons/fa6";
import ChatBotListCategory from "./ChatBotListCategory";
import useSWR from "swr";
import { ApibotsGETResponse, ApibotsPOSTBody } from "../../../pages/api/bots";
import ChatBotEditStatic, { ChatBotEdit } from "./ChatBotEdit";
import { useApiPOST } from "@/api/fetcher";
import clsx from "clsx";
import { ChatBotFilters, Filter } from "./ChatBotFilters";
import LoadingIcon from "../util/LoadingIcon";
import { ChatBotCard } from "./ChatBotCard";

function groupByMulti<T>(
  list: T[],
  keysGetter: (item: T) => string[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of list) {
    const keys = keysGetter(item);
    for (const key of keys) {
      const collection = map.get(key);
      if (collection === undefined) {
        map.set(key, new Array(item));
      } else {
        collection.push(item);
      }
    }
  }
  return map;
}

type ChatBotListProps = {};

export default function ChatBotList(props: ChatBotListProps) {
  const [filter, setFilter] = useState<Filter>({
    search: "",
    searchDescription: true,
    searchSystemMessage: false,
    models: ["gpt-4", "gpt-3.5-turbo"],
    temperature: [0, 2],
    sortBy: "popular",
  });

  const query = useMemo(() => {
    const q = new URLSearchParams();
    filter.search.trim() !== "" && q.set("search", filter.search);
    filter.searchDescription && q.set("searchByDesc", "1");
    filter.searchSystemMessage && q.set("searchBySysm", "1");
    q.set("models", filter.models.join(","));
    q.set("maxTemp", filter.temperature[1].toString());
    q.set("minTemp", filter.temperature[0].toString());
    q.set("sortBy", filter.sortBy);
    return q.toString();
  }, [filter]);

  const data = useSWR(
    `/api/bots?${query}`,
    (url: string) =>
      fetch(url).then((res) => res.json() as Promise<ApibotsGETResponse>),
    {
      keepPreviousData: true,
    },
  );
  const bots = data.data;
  const loading = data.isLoading;

  const { post: postBot, error: postError } = useApiPOST<
    ApibotsPOSTBody,
    never
  >(`/api/bots`);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);

  const groupedBots = useMemo(
    () =>
      Array.from(
        groupByMulti(bots ?? [], (bot) => {
          const keys = new Array<string>();
          if (bot.featured) keys.push("⭐Featured");
          if (bot.categories.length === 0) keys.push("Other");
          else keys.push(...bot.categories);
          return keys;
        }).entries(),
      ),
    [bots],
  );

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
            <br />
            <button className="text-lg" onClick={() => setShowAdd(true)}>
              <div className="flex items-center gap-2 rounded bg-blue-500 p-2 hover:bg-blue-600">
                Create a chatbot
                <FaCirclePlus />
              </div>
            </button>
          </div>
          <div className="flex flex-grow flex-col items-center justify-center">
            <ChatBotFilters value={filter} onChange={setFilter} />
          </div>
        </div>
        <div className={clsx(loading ? "visible" : "invisible")}>
          <LoadingIcon />
        </div>
        <div
          className={clsx(
            "flex gap-2 px-8 pt-4",
            "flex-row flex-wrap items-stretch justify-center gap-8",
          )}
        >
          {(bots ?? []).map((bot) => {
            return <ChatBotCard id={bot.id} key={bot.id} />;
          })}
        </div>
      </div>
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <ChatBotEditStatic
            onClose={() => setShowAdd(false)}
            onSave={(bot) => {
              setShowAdd(false);
              postBot({
                name: bot.name,
                description: bot.description,
                model: bot.model,
                frequency_bias: bot.frequency_bias,
                presence_bias: bot.presence_bias,
                temperature: bot.temperature,
                systemMessage: bot.systemMessage,
                categories: [],
              });
            }}
          />
        </Modal>
      )}
      {editId !== null && (
        <Modal onClose={() => setEditId(null)}>
          <ChatBotEdit
            id={editId}
            onClose={() => setEditId(null)}
            onSave={() => setEditId(null)}
          />
        </Modal>
      )}
    </div>
  );
}
