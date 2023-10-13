"use client"

import { FaX } from 'react-icons/fa6';
import { Prisma } from '@prisma/client';
import { useState } from 'react';

type ChatBot = Prisma.ChatBotGetPayload<{
    select: {
        name: true;
        description: true;
        model: true;
        frequency_bias: true;
        presence_bias: true;
        temperature: true;
        systemMessage: true;
        categories: true;
    }
}>;

type ChatBotEditProps = {
    chatbot?: ChatBot;
    onClose: () => void;
    onSave: (chatbot: ChatBot) => void;
};

export default function ChatBotEdit(props: ChatBotEditProps) {

    const [name, setName] = useState<string>(props.chatbot?.name ?? "");
    const [description, setDescription] = useState<string>(props.chatbot?.description ?? "");
    const [model, setModel] = useState<string>(props.chatbot?.model ?? "gpt-4");
    const [frequency_bias, setFrequencyBias] = useState<number>(props.chatbot?.frequency_bias ?? 0);
    const [presence_bias, setPresenceBias] = useState<number>(props.chatbot?.presence_bias ?? 0);
    const [temperature, setTemperature] = useState<number>(props.chatbot?.temperature ?? 0.7);
    const [systemMessage, setSystemMessage] = useState<string>(props.chatbot?.systemMessage ?? "");

    return <div className='bg-slate-300 p-2'>
        <div className='grid grid-cols-3 gap-6 align-middle p-3'>
            <div className='flex items-center h-full col-start-1 row-start-1'>
                <p>Name</p>
            </div>
            <input
                className='col-start-2 row-start-1'
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className='flex items-center h-full col-start-1 row-start-2'>
                <p>Description</p>
            </div>
            <textarea
                className='h-36 col-start-2 row-start-2 resize-none'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <div className='col-start-3 row-start-1 row-span-2 flex flex-col gap-6'>
                <div className='flex flex-row w-full gap-3 justify-stretch'>
                    <p>Model</p>
                    <select
                        className='flex-grow'
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    >
                        <option value="gpt-4">GPT-4 (8K)</option>
                        <option value="gpt-4-32k" disabled>GPT-4 (32K)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5</option>
                        <option value="mock">Test mock</option>
                    </select>
                </div>
                <div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Frequency penalty</p>
                        <input
                            type="range" min="-2.0" max="2.0" step="0.1"
                            className='flex-grow'
                            value={frequency_bias}
                            onChange={(e) => setFrequencyBias(parseFloat(e.target.value))}
                        />
                    </div>
                    {frequency_bias}
                </div>
                <div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Presence penalty</p>
                        <input
                            type="range" min="-2.0" max="2.0" step="0.1"
                            className='flex-grow'
                            value={presence_bias}
                            onChange={(e) => setPresenceBias(parseFloat(e.target.value))}
                        />
                    </div>
                    {presence_bias}
                </div>
                <div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Temperature</p>
                        <input
                            type="range" min="0" max="2.0" step="0.1"
                            className='flex-grow'
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        />
                    </div>
                    {temperature}
                </div>
            </div>
            <div className='flex items-center h-full col-start-1 row-start-3'>
                <p>System message</p>
            </div>
            <textarea
                className='h-56 col-start-2 row-start-3 col-span-2 resize-none'
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
            />
        </div>
        <div className='flex flex-row justify-end gap-2'>
            <button
                className='bg-gray-500 rounded p-2'
                onClick={() => {
                    props.onClose();
                }}
            >Cancel</button>
            <button
                className='bg-blue-400 rounded p-2'
                onClick={() => {
                    props.onSave({
                        name,
                        description,
                        model,
                        frequency_bias,
                        presence_bias,
                        temperature,
                        systemMessage,
                        categories: [],
                    });
                }}
            >Save</button>
        </div>
    </div>;
}