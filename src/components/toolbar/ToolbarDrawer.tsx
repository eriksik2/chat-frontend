"use client"

import ChatMessage from '@/state/ChatMessage';
import { useReactive } from '@/util/Reactive';
import { useState } from 'react';
import Toolbar from './Toolbar';

import { FaAngleUp } from 'react-icons/fa6';

type ToolbarDrawerProps = {
    children?: React.ReactNode[];
};

export default function ToolbarDrawer(props: ToolbarDrawerProps) {
    const [open, setOpen] = useState(false);

    function handleChange() {
        setOpen(!open);
    }

    return <div className='overflow-hidden flex flex-row w-full'>
        <div
            className='flex flex-col p-2 justify-center bg-slate-400 rounded-b-lg cursor-pointer'
            style={{
                borderBottomRightRadius: open ? 0 : undefined,
                transition: 'border-bottom-right-radius 0.25s ease',
            }}
            onClick={handleChange}
        >
            <FaAngleUp
                style={{
                    transform: `rotate(${open ? 0 : 180}deg)`,
                    transition: 'transform 0.25s ease',
                }}
            />
        </div>
        <div
            className='flex flex-row flex-grow gap-4 justify-stretch bg-slate-400 rounded-br-lg overflow-hidden'
            style={{
                transform: `translateY(${open ? 0 : 'calc(100% - 200%)'})`,
                transition: 'transform 0.25s ease',
            }}
        >

            {(props.children ?? []).filter(child => child !== null).map((child, i) => {
                return <div key={i} className='group flex flex-row items-stretch'>
                    <div className='w-px my-2 mr-4 bg-slate-700 group-first:hidden' />
                    <div className=''>
                        {child}
                    </div>
                </div>;
            })}
        </div>
    </div>
}