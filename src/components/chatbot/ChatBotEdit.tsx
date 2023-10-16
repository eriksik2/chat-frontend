"use client"

import { useState } from 'react';
import { useApiGET, useApiPOST } from '@/api/fetcher';
import { ApiBotPOSTBody, ApiBotPOSTResponse, ApibotGETResponse } from '../../../pages/api/bots/[bot]';
import LoadingIcon from '../util/LoadingIcon';
import clsx from 'clsx';
import Textbox from '../util/Textbox';

type ChatBotEditData = {
    name: string;
    description: string;
    model: string;
    frequency_bias: number;
    presence_bias: number;
    temperature: number;
    systemMessage: string | null;
}

type ChatBotEditStaticProps = {
    chatbot?: ChatBotEditData;
    onClose: () => void;
    onSave: (chatbot: ChatBotEditData) => void;
};

export default function ChatBotEditStatic(props: ChatBotEditStaticProps) {

    const [name, setName] = useState<string>(props.chatbot?.name ?? "");
    const [description, setDescription] = useState<string>(props.chatbot?.description ?? "");
    const [model, setModel] = useState<string>(props.chatbot?.model ?? "gpt-4");
    const [frequency_bias, setFrequencyBias] = useState<number>(props.chatbot?.frequency_bias ?? 0);
    const [presence_bias, setPresenceBias] = useState<number>(props.chatbot?.presence_bias ?? 0);
    const [temperature, setTemperature] = useState<number>(props.chatbot?.temperature ?? 0.7);
    const [systemMessage, setSystemMessage] = useState<string>(props.chatbot?.systemMessage ?? "");

    return <div className={clsx(
        'rounded-md shadow-inner p-2',
        'bg-gradient-to-br from-slate-400/70 via-slate-300 to-slate-400/60'
    )}>
        <div className='grid grid-cols-3 gap-6 align-middle p-2'>
            <div className='flex items-center h-full col-start-1 row-start-1'>
                <p>Name</p>
            </div>
            <Textbox
                className='col-start-2 row-start-1'
                value={name}
                onChange={value => setName(value)}
            />
            <div className='flex items-center h-full col-start-1 row-start-2'>
                <p>Description</p>
            </div>
            <Textbox
                className='h-36 col-start-2 row-start-2'
                value={description}
                onChange={value => setDescription(value)}
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
            <Textbox
                className='h-56 col-start-2 row-start-3 col-span-2'
                value={systemMessage}
                onChange={(value) => setSystemMessage(value)}
            />
        </div>
        <div className='flex flex-row justify-end gap-2 p-2'>
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
                    });
                }}
            >Save</button>
        </div>
    </div>;
}


type ChatBotEditProps = {
    id: string;
    onClose: () => void;
    onSave?: () => void;
};

export function ChatBotEdit(props: ChatBotEditProps) {
    const { data, error } = useApiGET<ApibotGETResponse>(`/api/bots/${props.id}`);
    const { post, error: postError } = useApiPOST<ApiBotPOSTBody, ApiBotPOSTResponse>(`/api/bots/${props.id}`);

    if (data === undefined) return <LoadingIcon />;

    return <ChatBotEditStatic
        chatbot={{
            name: data.name,
            description: data.description,
            model: data.model,
            frequency_bias: data.frequency_bias,
            presence_bias: data.presence_bias,
            temperature: data.temperature,
            systemMessage: data.systemMessage,
        }}
        onClose={props.onClose}
        onSave={(chatbot) => {
            post({
                name: chatbot.name,
                description: chatbot.description,
                model: chatbot.model,
                frequency_bias: chatbot.frequency_bias,
                presence_bias: chatbot.presence_bias,
                temperature: chatbot.temperature,
                systemMessage: chatbot.systemMessage,
                categories: data.categories,
            });
            if (props.onSave) props.onSave();
        }}
    />;
}