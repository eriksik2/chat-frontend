"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaX } from 'react-icons/fa6';

type ChatBotEditProps = {
    chatbot: ChatBot;
    onClose: () => void;
};

export default function ChatBotEdit(props: ChatBotEditProps) {
    const chatbot = useReactive(props.chatbot);

    return <div
        className='absolute w-screen h-screen top-0 left-0 flex flex-col items-center justify-center backdrop-blur-lg'
        onClick={(e) => {
            if (e.target === e.currentTarget) {
                props.onClose();
            }
        }}
    >
        <div className='bg-slate-300 p-2'>
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
                <input
                    className='h-36 col-start-2 row-start-2'
                    value={chatbot.description}
                    onChange={(e) => chatbot.setDescription(e.target.value)}
                />
                <div className='col-start-3 row-start-1 row-span-2 flex flex-col gap-6'>
                    <div className='flex flex-row w-full gap-3 justify-stretch'>
                        <p>Model</p>
                        <select className='flex-grow'>
                            <option>gpt-4</option>
                            <option>gpt-3.5</option>
                        </select>
                    </div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Frequency penalty</p>
                        <input type="range" min="-2.0" max="2.0" className='flex-grow' />
                    </div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Presence penalty</p>
                        <input type="range" min="-2.0" max="2.0" className='flex-grow' />
                    </div>
                    <div className='flex flex-row w-full gap-3'>
                        <p>Temperature</p>
                        <input type="range" min="0" max="2.0" className='flex-grow' />
                    </div>
                </div>
                <div className='flex items-center h-full col-start-1 row-start-3'>
                    <p>System message</p>
                </div>
                <input
                    className='h-56 col-start-2 row-start-3 col-span-2'
                    value={chatbot.system_message ?? ""}
                    onChange={(e) => chatbot.setSystemMessage(e.target.value)}
                />
            </div>
        </div>
    </div>;
}