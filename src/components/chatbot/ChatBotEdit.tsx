"use client"

import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { FaX } from 'react-icons/fa6';

type ChatBotEditProps = {
    chatbot: ChatBot;
    onClose: () => void;
};

export default function ChatBotEdit(props: ChatBotEditProps) {
    const chatbot = useReactive(props.chatbot);

    return <div className='bg-slate-300 p-2'>
        <div className='flex flex-row justify-end'>
            <button
                onClick={() => {
                    props.onClose();
                }}
            ><FaX /></button>
        </div>
        <div className='grid grid-cols-3 gap-6 align-middle p-3'>
            <div className='flex items-center h-full col-start-1 row-start-1'>
                <p>Name</p>
            </div>
            <input
                className='col-start-2 row-start-1'
                value={chatbot.name}
                onChange={(e) => chatbot.setName(e.target.value)}
            />
            <div className='flex items-center h-full col-start-1 row-start-2'>
                <p>Description</p>
            </div>
            <textarea
                className='h-36 col-start-2 row-start-2 resize-none'
                value={chatbot.description}
                onChange={(e) => chatbot.setDescription(e.target.value)}
            />
            <div className='col-start-3 row-start-1 row-span-2 flex flex-col gap-6'>
                <div className='flex flex-row w-full gap-3 justify-stretch'>
                    <p>Model</p>
                    <select
                        className='flex-grow'
                        value={chatbot.model}
                        onChange={(e) => chatbot.setModel(e.target.value)}
                    >
                        <option value="gpt-4">GPT-4 (8K)</option>
                        <option value="gpt-4-32k">GPT-4 (32K)</option>
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
                            value={chatbot.frequency_penalty ?? undefined}
                            onChange={(e) => chatbot.setFrequencyPenalty(parseFloat(e.target.value))}
                        />
                    </div>
                    {chatbot.frequency_penalty ?? 0}
                </div>
                <div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Presence penalty</p>
                        <input
                            type="range" min="-2.0" max="2.0" step="0.1"
                            className='flex-grow'
                            value={chatbot.presence_penalty ?? undefined}
                            onChange={(e) => chatbot.setPresencePenalty(parseFloat(e.target.value))}
                        />
                    </div>
                    {chatbot.presence_penalty ?? 0}
                </div>
                <div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Temperature</p>
                        <input
                            type="range" min="0" max="2.0" step="0.1"
                            className='flex-grow'
                            value={chatbot.temperature ?? undefined}
                            onChange={(e) => chatbot.setTemperature(parseFloat(e.target.value))}
                        />
                    </div>
                    {chatbot.temperature ?? 0}
                </div>
            </div>
            <div className='flex items-center h-full col-start-1 row-start-3'>
                <p>System message</p>
            </div>
            <textarea
                className='h-56 col-start-2 row-start-3 col-span-2 resize-none'
                value={chatbot.system_message ?? ""}
                onChange={(e) => chatbot.setSystemMessage(e.target.value)}
            />
        </div>
    </div>;
}