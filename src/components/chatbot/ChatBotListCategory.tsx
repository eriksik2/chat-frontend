"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/util/Reactive';
import { useEffect, useMemo, useState } from 'react';
import ChatBotCard from './ChatBotCard';
import Modal from '../Modal';
import ChatBotAdd from './ChatBotAdd';

import { FaAngleDown } from 'react-icons/fa6';
import clsx from 'clsx';

type ChatBotListCategoryProps = {
    app: App;
    category: string | null;
};

export default function ChatBotListCategory(props: ChatBotListCategoryProps) {
    const state = useReactive(props.app);

    const [open, setOpen] = useState(true);

    const filteredBots = useMemo(() => {
        return state.chatbots.filter((chatbot) => {
            if (props.category === null) {
                return chatbot.tags.length === 0;
            } else {
                return chatbot.tags.includes(props.category);
            }
        });
    }, [state, props.category]);
    if (filteredBots.length === 0) return null;

    return <div className={clsx(
    )}>
        <div
            className='w-full bg-slate-300 rounded px-2 flex flex-row items-center gap-2'
            onClick={() => setOpen(!open)}
        >
            <FaAngleDown
                className={clsx(
                    "transition-transform transform",
                    open ? "rotate-0" : "-rotate-90",
                )}
            />
            <h1 className='text-lg'>{props.category ?? "Other"}</h1>
        </div>
        <div className='overflow-hidden'>
            <div
                className={clsx(
                    'flex flex-row flex-wrap gap-4 items-center content-start justify-start px-4',
                    open ? 'max-h-screen py-4' : 'max-h-0 py-0 -translate-y-[10rem]',
                    "transition-height duration-300 ease-in-out"
                )}
            >
                {filteredBots.map((chatbot, i) => {
                    return <ChatBotCard key={i} chatbot={chatbot} />;
                })}
            </div>
        </div>
    </div>;
}