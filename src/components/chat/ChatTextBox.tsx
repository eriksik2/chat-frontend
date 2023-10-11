"use client"

import { useEffect, useMemo, useState } from 'react';

type ChatTextBoxProps = {
    onSend: (message: string) => void;
    canSend?: boolean;
};

export default function ChatTextBox(props: ChatTextBoxProps) {
    const canSend = props.canSend ?? true;

    const [value, setValue] = useState('');
    const [bigEditor, setBigEditor] = useState(false);

    const [lines, cols] = useMemo(() => {
        var maxcol = 0;
        var col = 0;
        var lines = 1;
        for (const char of value) {
            if (char === '\n') {
                lines++;
                col = 0;
            } else {
                col++;
                if (col > maxcol) {
                    maxcol = col;
                }
            }
        }
        return [lines, Math.max(maxcol, 40)];
    }, [value]);

    function onKey(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter') {
            if (bigEditor) return;
            if (event.shiftKey) {
                setValue(value + '\n');
                return;
            }
            onSubmit();
        }
    }

    function onSubmit() {
        if (!canSend) return;
        if (value.trim().length !== 0) {
            props.onSend(value);
        }
        setValue('');
    }

    return <div className='flex flex-row items-center justify-center gap-4 h-full w-1/2'>
        <button
            className='px-4 py-2 text-white bg-blue-500 rounded-full drop-shadow-lg '
            onClick={(event) => {
                event.preventDefault();
                setBigEditor(!bigEditor);
                return false;
            }}
        >^</button>
        <div
            onKeyDown={onKey}
        >
            <textarea
                wrap={bigEditor ? "soft" : "off"}
                rows={1}
                cols={40}
                className='px-3 py-2 text-black bg-white rounded-xl flex-grow drop-shadow-lg resize-none flex items-center no-scrollbar'
                style={{
                    height: !bigEditor ? `calc(1rem + ${1}lh)` : "65vh",
                    width: !bigEditor ? `calc(1.5rem + ${60}ch)` : "50vw",
                    transition: "height 0.2s ease-in-out, width 0.2s ease-in-out",
                }}
                value={value}
                onChange={(e) => {
                    const newValue = e.target.value;
                    if (!bigEditor && newValue.length > value.length && newValue[newValue.length - 1] === '\n') return;
                    setValue(e.target.value);
                }}
            />
        </div>
        <button
            className='px-4 py-2 text-white bg-blue-500 rounded-full drop-shadow-lg '
            onClick={(event) => {
                event.preventDefault();
                onSubmit();
                return false;
            }}
        >Send</button>
    </div>
}