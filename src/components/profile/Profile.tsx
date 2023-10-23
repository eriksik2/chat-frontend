import { useSession } from "next-auth/react";
import Image from "next/image";
import ChatBotList from "../chatbot/ChatBotList";
import { useApiPOST } from "@/api/fetcher";
import { useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { ApibotsPOSTBody } from "../../../pages/api/bots";
import Modal from "../Modal";
import ChatBotEditStatic from "../chatbot/ChatBotEdit";

type ProfileProps = {
  user: {
    id: number;
    name: string;
    image: string | null;
  };
};

export default function Profile(props: ProfileProps) {
  const { data: session } = useSession();

  // Identity says if you are viewing your own profile, someone else's profile, or if you are not logged in
  const identity =
    session?.user?.id === props.user.id
      ? "you"
      : !session || !session.user
      ? "anon"
      : "user";

  const { post: postBot, error: postError } = useApiPOST<
    ApibotsPOSTBody,
    never
  >(`/api/bots`);

  const [showAdd, setShowAdd] = useState<boolean>(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0">
      <div className="no-scrollbar overflow-auto">
        <div className="flex flex-col items-stretch gap-2 px-4 py-6">
          {identity === "you" ? (
            <h1 className="pb-2 text-5xl">Your profile</h1>
          ) : (
            <h1 className="pb-2 text-5xl">{props.user.name + "'"}s profile</h1>
          )}
          <div className="flex gap-2">
            <button className="text-lg" onClick={() => setShowAdd(true)}>
              <div className="flex items-center gap-2 rounded bg-blue-500 p-2 hover:bg-blue-600">
                Create a chatbot
                <FaCirclePlus />
              </div>
            </button>
          </div>
          {identity === "you" && (
            <>
              <h2 className="text-3xl">Private chatbots</h2>
              <ChatBotList
                userId={props.user.id}
                published={false}
                showTools={true}
              />
            </>
          )}
          <h2 className="text-3xl">Public chatbots</h2>
          <ChatBotList
            userId={props.user.id}
            published={true}
            showTools={identity === "you"}
          />
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
    </div>
  );
}
