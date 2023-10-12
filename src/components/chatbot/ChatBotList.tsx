"use client"

import App from '@/state/App';
import ChatBot from '@/state/ChatBot';
import { useReactive } from '@/lib/Reactive';
import { useEffect, useMemo, useState } from 'react';
import ChatBotCard from './ChatBotCard';
import Modal from '../Modal';
import ChatBotAdd from './ChatBotAdd';

import { FaAngleDown, FaCirclePlus } from 'react-icons/fa6';
import ChatBotListCategory from './ChatBotListCategory';
import useSWR from 'swr';
import { ApibotsResponseData } from '../../../pages/api/bots';

function groupByMulti<T>(list: T[], keysGetter: (item: T) => string[]): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of list) {
        const keys = keysGetter(item);
        for (const key of keys) {
            const collection = map.get(key);
            if (collection === undefined) {
                map.set(key, new Array(item));
            } else {
                collection.push(item);
            }
        }
    }
    return map;
}

type ChatBotListProps = {
};

export default function ChatBotList(props: ChatBotListProps) {

    const data = useSWR("/api/bots", (url: string) => fetch(url).then(res => res.json() as Promise<ApibotsResponseData>));
    const bots = data.data;
    const loading = data.isLoading;

    const groupedBots = useMemo(() => Array.from(groupByMulti(bots ?? [], bot => {
        const keys = new Array<string>();
        if (bot.featured) keys.push('⭐Featured');
        if (bot.categories.length === 0) keys.push('Other');
        else keys.push(...bot.categories);
        return keys;
    }).entries()), [bots]);

    // TODO better loading and null handling
    if (loading) return <div>Loading...</div>;
    if (bots === null) return <div>Chatbots not found.</div>;

    return <div className='h-full relative'>
        <div className='flex flex-col items-stretch justify-start absolute top-0 left-0 right-0 bottom-0'>
            <div className='w-full shadow-xl z-30'>
                <div className='w-2/5 p-4 py-6'>
                    <h1 className='text-5xl pb-2'>Chatbots</h1>
                    <p>
                        List of chatbots tagged by categories. You can select a pre-existing bot or add, edit, and remove chatbots as needed.

                    </p>
                    <br />
                    <p>
                        Select a chatbot and press the New Chat button, then you can chat with it in the Chats tab.
                    </p>
                </div>
            </div>
            <div className='overflow-auto no-scrollbar flex flex-col gap-2 px-4 pt-4'>
                {groupedBots.map(([category, bots]) => {
                    return <ChatBotListCategory
                        key={category}
                        bots={bots}
                        category={category}
                    />;
                })}
                <button
                    className="text-xl"
                    onClick={() => { }}
                ><FaCirclePlus /></button>
            </div>
        </div>
    </div>
}