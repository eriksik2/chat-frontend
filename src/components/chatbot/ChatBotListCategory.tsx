"use client";

import { useState } from "react";
import ChatBotCardStatic, { ChatBotCard } from "./ChatBotCard";

import { FaAngleDown } from "react-icons/fa6";
import clsx from "clsx";
import { ApibotsGETResponse } from "../../../pages/api/bots";

type ChatBotListCategoryProps = {
  bots: ApibotsGETResponse;
  category: string | null;
  onEdit: (id: string) => void;
};

export default function ChatBotListCategory(props: ChatBotListCategoryProps) {
  const isFeatured = props.category === "⭐Featured";

  const [open, setOpen] = useState(isFeatured ? true : true);

  return (
    <div
      style={{
        order: isFeatured ? -1 : undefined,
      }}
    >
      <div
        className="flex w-full flex-row items-center gap-2 rounded bg-gradient-to-br from-slate-400/60 via-slate-300 to-slate-400/50 px-2 shadow-inner"
        onClick={() => !isFeatured && setOpen(!open)}
      >
        {!isFeatured && (
          <FaAngleDown
            className={clsx(
              "transform transition-transform",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
        )}
        <h1 className="text-lg">{props.category ?? "Other"}</h1>
      </div>
      <div className="overflow-hidden">
        <div
          className={clsx(
            "flex flex-row flex-wrap content-start items-stretch justify-start gap-4 px-4",
            open ? "max-h-screen py-4" : "max-h-0 -translate-y-[10rem] py-0",
            "transition-height duration-300 ease-in-out",
          )}
        >
          {props.bots.map((chatbot, i) => {
            return (
              <ChatBotCard
                key={chatbot.id}
                id={chatbot.id}
                onEdit={props.onEdit}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
