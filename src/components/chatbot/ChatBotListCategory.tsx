"use client"

import { useState } from 'react';
import ChatBotCard from './ChatBotCard';

import { FaAngleDown } from 'react-icons/fa6';
import clsx from 'clsx';
import { ApibotsGETResponse } from '../../../pages/api/bots';

type ChatBotListCategoryProps = {
    bots: ApibotsGETResponse;
    category: string | null;
    onEdit: (id: string) => void;
};


export default function ChatBotListCategory(props: ChatBotListCategoryProps) {

    const isFeatured = props.category === '⭐Featured';

    const [open, setOpen] = useState(isFeatured ? true : false);

    return <div
        style={{
            order: isFeatured ? -1 : undefined,
        }}
    >
        <div
            className='w-full bg-slate-300 rounded px-2 flex flex-row items-center gap-2'
            onClick={() => !isFeatured && setOpen(!open)}
        >
            {!isFeatured && <FaAngleDown
                className={clsx(
                    "transition-transform transform",
                    open ? "rotate-0" : "-rotate-90",
                )}
            />}
            <h1 className='text-lg'>{props.category ?? "Other"}</h1>
        </div>
        <div className='overflow-hidden'>
            <div
                className={clsx(
                    'flex flex-row flex-wrap gap-4 items-stretch content-start justify-start px-4',
                    open ? 'max-h-screen py-4' : 'max-h-0 py-0 -translate-y-[10rem]',
                    "transition-height duration-300 ease-in-out"
                )}
            >
                {props.bots.map((chatbot, i) => {
                    return <ChatBotCard
                        key={chatbot.id}
                        chatbot={chatbot}
                        onEdit={props.onEdit}
                    />;
                })}
            </div>
        </div>
    </div>;
}