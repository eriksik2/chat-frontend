"use client"

import { useEffect, useState } from 'react';

type ChatTextBoxProps = {
    onSend: (message: string) => void;
    canSend?: boolean;
};

export default function ChatTextBox(props: ChatTextBoxProps) {
    const canSend = props.canSend ?? true;

    const [value, setValue] = useState('');

    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValue(event.target.value);
    }

    function onSubmit() {
        if (!canSend) return;
        props.onSend(value);
        setValue('');
    }

    return <div className='flex flex-row items-center justify-center h-full w-1/2'>
        <form
            className='flex flex-row items-center justify-center gap-2 w-full h-full'
            action=""
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
                return false;
            }}
        >
            <input
                className='px-4 py-2 text-black bg-white rounded-full flex-grow drop-shadow-lg '
                type="text"
                value={value}
                onChange={onChange}
            />
            <button
                className='px-4 py-2 text-white bg-blue-500 rounded-full drop-shadow-lg '
                onClick={(event) => {
                    event.preventDefault();
                    onSubmit();
                    return false;
                }}
            >Send</button>
        </form>
    </div>
}