"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";

import useSWR from "swr";
import { ApibotsGETResponse } from "../../../pages/api/bots";
import { ChatBotEdit } from "./ChatBotEdit";
import clsx from "clsx";
import { Filter, defaultFilter } from "./ChatBotFilters";
import LoadingIcon from "../util/LoadingIcon";
import { ChatBotCard } from "./ChatBotCard";
import PageSelector from "../util/PageSelector";

type ChatBotListProps = {
  filter?: Filter;
  userId?: number;
  published?: boolean;
  showTools?: boolean;
};

export default function ChatBotList(props: ChatBotListProps) {
  const filter = props.filter ?? defaultFilter;

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);

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

    q.set("page", page.toString());
    q.set("show", "8");
    return q;
  }, [filter, page]);

  useEffect(() => {
    const countQuery = new URLSearchParams(query);
    countQuery.set("getCount", "1");
    fetch(`/api/bots?${countQuery.toString()}`)
      .then((res) => res.json())
      .then((res: ApibotsGETResponse & { type: "count" }) => {
        setTotalPages(res.pages);
      });
  }, [query]);

  const data = useSWR(
    `/api/bots?${query.toString()}`,
    (url: string) =>
      fetch(url).then(
        (res) => res.json() as Promise<ApibotsGETResponse & { type: "data" }>,
      ),
    {
      keepPreviousData: true,
    },
  );
  const bots = data.data?.data;
  const loading = data.isLoading;

  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div>
      <div className={clsx(loading ? "visible" : "invisible")}>
        <LoadingIcon />
      </div>
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex flex-row flex-wrap items-stretch justify-center gap-8">
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
