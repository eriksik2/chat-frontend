"use client";

import { useState } from "react";
import LoadingIcon from "../util/LoadingIcon";
import clsx from "clsx";
import Textbox from "../util/Textbox";
import { trpc } from "@/util/trcp";

type ChatBotEditData = {
  name: string;
  description: string;
  model: string;
  frequency_bias: number;
  presence_bias: number;
  temperature: number;
  systemMessage: string | null;
};

type ChatBotEditStaticProps = {
  chatbot?: ChatBotEditData;
  onClose: () => void;
  onSave: (chatbot: ChatBotEditData) => void;
};

export default function ChatBotEditStatic(props: ChatBotEditStaticProps) {
  const [name, setName] = useState<string>(props.chatbot?.name ?? "");
  const [description, setDescription] = useState<string>(
    props.chatbot?.description ?? "",
  );
  const [model, setModel] = useState<string>(props.chatbot?.model ?? "gpt-4");
  const [frequency_bias, setFrequencyBias] = useState<number>(
    props.chatbot?.frequency_bias ?? 0,
  );
  const [presence_bias, setPresenceBias] = useState<number>(
    props.chatbot?.presence_bias ?? 0,
  );
  const [temperature, setTemperature] = useState<number>(
    props.chatbot?.temperature ?? 0.7,
  );
  const [systemMessage, setSystemMessage] = useState<string>(
    props.chatbot?.systemMessage ?? "",
  );

  return (
    <div
      className={clsx(
        "rounded-md p-2 shadow-inner",
        "bg-gradient-to-br from-slate-400/70 via-slate-300 to-slate-400/60",
      )}
    >
      <div className="grid grid-cols-3 gap-6 p-2 align-middle">
        <div className="col-start-1 row-start-1 flex h-full items-center">
          <p>Name</p>
        </div>
        <Textbox
          className="col-start-2 row-start-1"
          value={name}
          onChange={(value) => setName(value)}
        />
        <div className="col-start-1 row-start-2 flex h-full items-center">
          <p>Description</p>
        </div>
        <Textbox
          className="col-start-2 row-start-2 h-36"
          value={description}
          onChange={(value) => setDescription(value)}
        />
        <div className="col-start-3 row-span-2 row-start-1 flex flex-col gap-6">
          <div className="flex w-full flex-row justify-stretch gap-3">
            <p>Model</p>
            <select
              className="flex-grow"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-4">GPT-4 (8K)</option>
              <option value="gpt-4-32k" disabled>
                GPT-4 (32K)
              </option>
              <option value="gpt-3.5-turbo">GPT-3.5</option>
              <option value="mock">Test mock</option>
            </select>
          </div>
          <div>
            <div className="flex w-full flex-row gap-3">
              <p>Frequency penalty</p>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.1"
                className="flex-grow"
                value={frequency_bias}
                onChange={(e) => setFrequencyBias(parseFloat(e.target.value))}
              />
            </div>
            {frequency_bias}
          </div>
          <div>
            <div className="flex w-full flex-row gap-3">
              <p>Presence penalty</p>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.1"
                className="flex-grow"
                value={presence_bias}
                onChange={(e) => setPresenceBias(parseFloat(e.target.value))}
              />
            </div>
            {presence_bias}
          </div>
          <div>
            <div className="flex w-full flex-row gap-3">
              <p>Temperature</p>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.1"
                className="flex-grow"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </div>
            {temperature}
          </div>
        </div>
        <div className="col-start-1 row-start-3 flex h-full items-center">
          <p>System message</p>
        </div>
        <Textbox
          className="col-span-2 col-start-2 row-start-3 h-56"
          value={systemMessage}
          onChange={(value) => setSystemMessage(value)}
        />
      </div>
      <div className="flex flex-row justify-end gap-2 p-2">
        <button
          className="rounded bg-gray-500 p-2"
          onClick={() => {
            props.onClose();
          }}
        >
          Cancel
        </button>
        <button
          className="rounded bg-blue-400 p-2"
          onClick={() => {
            props.onSave({
              name,
              description,
              model,
              frequency_bias,
              presence_bias,
              temperature,
              systemMessage,
            });
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

type ChatBotEditProps = {
  id: string;
  onClose: () => void;
  onSave?: () => void;
};

export function ChatBotEdit(props: ChatBotEditProps) {
  const { data, error, isInitialLoading } = trpc.bots.get.useQuery({
    id: props.id,
  });

  const { mutate: updateBot, error: updateError } =
    trpc.bots.create.useMutation();

  if (data === undefined) return <LoadingIcon />;
  const bot = data.bot;

  return (
    <ChatBotEditStatic
      chatbot={{
        name: bot.name,
        description: bot.description,
        model: bot.model,
        frequency_bias: bot.frequency_bias,
        presence_bias: bot.presence_bias,
        temperature: bot.temperature,
        systemMessage: bot.systemMessage,
      }}
      onClose={props.onClose}
      onSave={(chatbot) => {
        updateBot({
          id: props.id,
          name: chatbot.name,
          description: chatbot.description,
          model: chatbot.model,
          frequency_bias: chatbot.frequency_bias,
          presence_bias: chatbot.presence_bias,
          temperature: chatbot.temperature,
          systemMessage: chatbot.systemMessage,
          tags: bot.tags,
        });
        if (props.onSave) props.onSave();
      }}
    />
  );
}
