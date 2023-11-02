import { FaPen, FaStar, FaTrash } from "react-icons/fa6";
import clsx from "clsx";
import { ApibotsGETResponse } from "../../../pages/api/bots";
import { useApiDELETE, useApiGET, useApiPOST } from "@/api/fetcher";
import {
  ApiChatsPOSTBody,
  ApiChatsPOSTResponse,
} from "../../../pages/api/chats";
import { useRouter } from "next/router";
import Modal from "../Modal";
import { ChatBotEdit } from "./ChatBotEdit";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import LoadingIcon from "../util/LoadingIcon";
import { ApibotGETResponse } from "../../../pages/api/bots/[bot]";
import {
  ApiBotPublishDELETEResponse,
  ApiBotPublishPOSTResponse,
} from "../../../pages/api/bots/[bot]/publish";
import {
  ApiBotFavouriteDELETEResponse,
  ApiBotFavouriteGETResponse,
  ApiBotFavouritePOSTResponse,
} from "../../../pages/api/bots/[bot]/favourite";
import ChatBotRating from "./ChatBotRating";
import { trpc } from "@/util/trcp";

type ChatBotCardProps = {
  id: string;
  showTools?: boolean;
  showLoading?: boolean;
  onEdit?: (id: string) => void;
};

export function ChatBotCard(props: ChatBotCardProps) {
  const {
    data,
    isInitialLoading,
    error: chatbotError,
  } = trpc.bots.get.useQuery({
    id: props.id,
  });
  const chatbot = data?.bot ?? undefined;

  const showLoading = props.showLoading ?? true;
  const loading = chatbot === undefined && isInitialLoading;

  if (loading) return showLoading ? <LoadingIcon /> : null;

  if (chatbotError !== null)
    return (
      <div
        className={clsx(
          "flex max-w-xs flex-col justify-between rounded bg-gradient-to-br from-slate-500/80 via-slate-300 to-slate-500/60 p-2 shadow-inner",
          "relative overflow-hidden",
        )}
      >
        Error while loading chatbot
      </div>
    );

  return (
    <ChatBotCardStatic
      chatbot={chatbot!}
      showTools={props.showTools}
      onEdit={props.onEdit}
    />
  );
}

type ChatBotCardStaticProps = {
  chatbot: {
    id: string;
    name: string;
    description: string;
    model: string;
    published: {
      ratingsCount: number;
      rating: number | null;
      yourRating: number | null;
      publishedAt: Date;
    } | null;
    author: {
      id: number;
      name: string;
    };
    favoritedAt: Date | null;
  };
  showTools?: boolean;
  onEdit?: (id: string) => void;
};

const tiltRotationFactor = 3;
const tiltTranslationFactor = 2;
const tiltZoomFactor = 1.2;

export default function ChatBotCardStatic(props: ChatBotCardStaticProps) {
  const swr = useSWRConfig();
  const router = useRouter();
  const { post: postChat, error: postChatError } = useApiPOST<
    ApiChatsPOSTBody,
    ApiChatsPOSTResponse
  >(`/api/chats`);

  const trpcUtils = trpc.useUtils();

  const {
    mutate: publish,
    error: publishError,
    isLoading: publishLoading,
  } = trpc.bots.publish.useMutation({
    onSuccess() {
      trpcUtils.bots.invalidate();
    },
  });
  const {
    mutate: unpublish,
    error: unpublishError,
    isLoading: unpublishLoading,
  } = trpc.bots.unpublish.useMutation({
    onSuccess() {
      trpcUtils.bots.invalidate();
    },
  });

  const {
    mutate: favorite,
    error: favouriteError,
    isLoading: favouriteLoading,
  } = trpc.bots.favorite.useMutation({
    onSuccess() {
      trpcUtils.bots.get.invalidate({ id: props.chatbot.id });
    },
  });

  const {
    mutate: unfavorite,
    error: unfavouriteError,
    isLoading: unfavouriteLoading,
  } = trpc.bots.unfavorite.useMutation({
    onSuccess() {
      trpcUtils.bots.get.invalidate({ id: props.chatbot.id });
    },
  });

  const {
    mutate: rate,
    error: rateError,
    isLoading: rateLoading,
  } = trpc.bots.rate.useMutation({
    onSuccess() {
      trpcUtils.bots.get.invalidate({ id: props.chatbot.id });
    },
  });

  const isPublished = props.chatbot.published !== null;
  const isFavourite = props.chatbot.favoritedAt !== null ?? null;

  const { data: session } = useSession();
  const loggedIn = session !== null;
  const ownsBot =
    props.chatbot.author.id !== null &&
    session?.user?.id === props.chatbot.author.id;
  const showTools = props.showTools ?? false;

  const [doTilt, setDoTilt] = useState<boolean>(false);
  const [tiltFactor, setTiltFactor] = useState<[number, number]>([0, 0]);

  return (
    <div
      className={clsx(
        "flex w-96 flex-col justify-between rounded bg-gradient-to-br from-slate-500/80 via-slate-300 to-slate-500/60 p-2 shadow-inner",
        "relative overflow-hidden",
      )}
      onMouseMove={(e) => {
        const card = e.currentTarget.getBoundingClientRect();
        const x = (2 * (e.clientX - card.x)) / card.width - 1;
        const y = (2 * (e.clientY - card.y)) / card.height - 1;
        setTiltFactor([x, y]);
      }}
      onMouseLeave={() => {
        setDoTilt(false);
        setTiltFactor([0, 0]);
      }}
      onMouseEnter={() => setDoTilt(true)}
      style={{
        transform: doTilt
          ? `perspective(500px)
                        rotateX(${Math.round(
                          tiltFactor[1] * -tiltRotationFactor,
                        )}deg)
                        rotateY(${Math.round(
                          tiltFactor[0] * tiltRotationFactor,
                        )}deg)
                        translateX(${Math.round(
                          tiltFactor[0] * -tiltTranslationFactor,
                        )}px)
                        translateY(${Math.round(
                          tiltFactor[1] * -tiltTranslationFactor,
                        )}px)
                        translateZ(${20 * tiltZoomFactor}px)
                        `
          : undefined,
        transition: doTilt ? "transform 0.1s" : "transform 0.5s",
      }}
    >
      <div className="px-2 pt-1">
        <div className="flex flex-row items-baseline gap-2">
          <p className="flex-auto text-xl">{props.chatbot.name}</p>
          <p className="flex-initial whitespace-nowrap text-sm">
            by {props.chatbot.author.name}
          </p>
        </div>
        <br />
        <p className="max-w-xs">{props.chatbot.description}</p>
        <br />
      </div>
      <div className="flex flex-row justify-end gap-2 pt-2">
        <button
          className="rounded bg-blue-500 p-1 text-sm shadow-inner"
          onClick={async () => {
            if (!loggedIn) {
              router.push(`/chats?chatbot=${props.chatbot.id}`);
              return;
            }
            const response = await postChat({
              chatName: `New chat with ${props.chatbot.name}`,
              chatbotId: props.chatbot.id,
            });
            if (response.chatId !== null) {
              router.push(`/chats/${response.chatId}`);
            }
          }}
        >
          New Chat
        </button>
        {isFavourite !== null && (
          <button
            className={clsx(
              "rounded bg-slate-500 p-1",
              ownsBot ? "block" : "hidden",
            )}
            onClick={async () => {
              if (isFavourite) await unfavorite({ id: props.chatbot.id });
              else await favorite({ id: props.chatbot.id });
            }}
          >
            {isFavourite ? (
              <FaStar className="text-yellow-300" />
            ) : (
              <FaStar className="text-gray-400" />
            )}
          </button>
        )}
        <div className="flex-grow" />
        {!(ownsBot && showTools) && (
          <ChatBotRating
            ratingsCount={props.chatbot.published?.ratingsCount ?? undefined}
            rating={props.chatbot.published?.rating ?? undefined}
            yourRating={props.chatbot.published?.yourRating ?? undefined}
            onRate={async (rating) => {
              await rate({
                id: props.chatbot.id,
                rating,
              });
            }}
          />
        )}
        <button
          className={clsx(
            "rounded bg-slate-500 p-1",
            ownsBot && showTools ? "block" : "hidden",
          )}
          onClick={async () => {
            if (isPublished)
              await unpublish({
                id: props.chatbot.id,
              });
            else
              await publish({
                id: props.chatbot.id,
              });
          }}
        >
          {isPublished ? "Unpublish" : "Publish"}
        </button>
        {props.onEdit && (
          <button
            className={clsx(
              "rounded bg-slate-500 p-1",
              ownsBot && showTools ? "block" : "hidden",
            )}
            onClick={() => props.onEdit?.(props.chatbot.id)}
          >
            <FaPen />
          </button>
        )}
        <button
          className={clsx(
            "rounded bg-red-400 p-1",
            ownsBot && showTools ? "block" : "hidden",
          )}
          onClick={async () => {
            const response = await fetch(`/api/bots/${props.chatbot.id}`, {
              method: "DELETE",
            });
            swr.mutate("/api/bots");
          }}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
