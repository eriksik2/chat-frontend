"use client";

import { useMemo, useState } from "react";
import Modal from "../Modal";

import useSWR from "swr";
import { ApibotsGETResponse } from "../../../pages/api/bots";
import { ChatBotEdit } from "./ChatBotEdit";
import clsx from "clsx";
import { Filter, defaultFilter } from "./ChatBotFilters";
import LoadingIcon from "../util/LoadingIcon";
import { ChatBotCard } from "./ChatBotCard";

type ChatBotListProps = {
  filter?: Filter;
  userId?: number;
  published?: boolean;
  showTools?: boolean;
};

export default function ChatBotList(props: ChatBotListProps) {
  const filter = props.filter ?? defaultFilter;
  const query = useMemo(() => {
    const q = new URLSearchParams();
    filter.search.trim() !== "" && q.set("search", filter.search);
    filter.searchDescription && q.set("searchByDesc", "1");
    filter.searchSystemMessage && q.set("searchBySysm", "1");
    q.set("models", filter.models.join(","));
    q.set("maxTemp", filter.temperature[1].toString());
    q.set("minTemp", filter.temperature[0].toString());
    q.set("sortBy", filter.sortBy);

    props.userId !== undefined && q.set("user", `${props.userId}`);
    props.published !== undefined && q.set("published", `${props.published}`);
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

  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div>
      <div className={clsx(loading ? "visible" : "invisible")}>
        <LoadingIcon />
      </div>
      <div
        className={clsx(
          "flex gap-2 px-8 pt-4",
          "flex-row flex-wrap items-stretch justify-start gap-8",
        )}
      >
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
