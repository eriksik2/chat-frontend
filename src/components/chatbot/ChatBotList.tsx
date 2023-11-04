"use client";

import { useState } from "react";
import Modal from "../Modal";

import { ChatBotEdit } from "./ChatBotEdit";
import clsx from "clsx";
import { Filter, defaultFilter } from "./ChatBotFilters";
import LoadingIcon from "../util/LoadingIcon";
import { ChatBotCard } from "./ChatBotCard";
import PageSelector from "../util/PageSelector";
import { trpc } from "@/util/trcp";

type ChatBotListProps = {
  filter?: Filter;
  userId?: number;
  published?: boolean;
  showTools?: boolean;
};

export default function ChatBotList(props: ChatBotListProps) {
  const filter = props.filter ?? defaultFilter;

  const [page, setPage] = useState(0);

  const {
    data: countData,
    error: countError,
    isInitialLoading: countLoading,
  } = trpc.bots.search.useQuery({
    search: filter.search,
    searchByDesc: filter.searchDescription,
    searchBySysm: filter.searchSystemMessage,
    models: filter.models,
    maxTemp: filter.temperature[1],
    minTemp: filter.temperature[0],
    sortBy: filter.sortBy,
    user: props.userId,
    published: props.published,
    getCount: true,
  });

  const totalPages = countData?.count ? Math.ceil(countData?.count / 8) : null;

  const { data, error, isInitialLoading } = trpc.bots.search.useQuery({
    search: filter.search,
    searchByDesc: filter.searchDescription,
    searchBySysm: filter.searchSystemMessage,
    models: filter.models,
    maxTemp: filter.temperature[1],
    minTemp: filter.temperature[0],
    sortBy: filter.sortBy,
    user: props.userId,
    published: props.published,
    page: page,
    show: 8,
  });

  const bots = data?.bots ?? [];

  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div>
      <div className={clsx(isInitialLoading ? "visible" : "invisible")}>
        <LoadingIcon />
      </div>
      <div className="flex flex-col gap-4 p-8">
        <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {(bots ?? []).map((bot) => {
            return (
              <ChatBotCard
                id={bot.id}
                key={bot.id}
                showTools={props.showTools}
                onEdit={() => setEditId(bot.id)}
              />
            );
          })}
        </div>
        {totalPages !== null && (
          <PageSelector
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
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
