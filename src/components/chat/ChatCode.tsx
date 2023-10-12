"use client"

import clsx from 'clsx';
import { useState } from 'react';
import { FaRegClipboard } from 'react-icons/fa6';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type ChatCodeProps = {
    content: string;
    language?: string;
    classNameOverride?: {
        [key: string]: string;
    }
};

const defaultClassNameOverride: {
    [key: string]: string;
} = {
    linenumber: clsx("pr-3 select-none"),
};

export default function ChatCode(props: ChatCodeProps) {
    const classNameOverride = props.classNameOverride ?? defaultClassNameOverride;

    const [highlight, setHighlight] = useState<string | null>(null);
    const [showCopied, setShowCopied] = useState<boolean>(false);

    function innerRender(row: rendererNode, stylesheet: {
        [key: string]: React.CSSProperties;
    }, key: any): React.ReactNode {

        if (row.type === 'text') {
            const regex = /^[a-zA-Z_][a-zA-Z-_0-9]*$/;
            const canHighlight = row.value !== undefined && regex.test(String(row.value).trim());
            if (!canHighlight) return row.value;
            const shouldHighlight = canHighlight && highlight !== null && String(row.value).includes(highlight);
            return <span
                className={clsx(shouldHighlight && 'bg-gray-300')}
                onClick={() => setHighlight(String(row.value!).trim())}
            >
                {row.value}
            </span>;
        } else if (row.type === 'element') {
            var style: React.CSSProperties = {};
            for (const className of row.properties?.className ?? []) {
                if (stylesheet[className] !== undefined) {
                    style = {
                        ...style,
                        ...stylesheet[className]
                    };
                }
            }
            const tailwindClasses = row.properties?.className.map((className) => classNameOverride[className] ?? null).filter(item => item !== null);
            const className = (tailwindClasses ?? []).join(' ');
            const noClassName = className === undefined || className.length === 0;
            const noKey = row.properties?.key === undefined;
            const noStyle = Object.keys(style).length === 0;
            if (noClassName && noKey && noStyle) {
                return row.children?.map((child, key) => innerRender(child, stylesheet, key))
            }

            return <span
                key={row.properties?.key ?? key}
                className={className}
                style={style}
            >
                {row.children?.map((child, key) => innerRender(child, stylesheet, key))}
            </span>;
        }
    }
    function render({ rows, stylesheet, useInlineStyles }: rendererProps): React.ReactNode {
        return <div className='rounded overflow-hidden bg-white' tabIndex={0} onBlur={() => {
            setHighlight(null);
        }}>
            <div className='flex flex-col items-stretch '>
                {rows.map((row, i) => <span className='px-2 border-y border-transparent hover:border-slate-400 '>
                    {innerRender(row, prism, i)}
                </span>)}
            </div>
            <div className='w-full bg-slate-400 text-slate-700 flex items-stretch justify-between'>
                <div className='flex items-center p-2 py-1 text-xs select-none'>
                    {props.language}
                </div>
                <div className='flex items-stretch'>
                    <p className={clsx(
                        'flex items-center text-xs px-1 select-none',
                        showCopied ? 'opacity-100' : 'opacity-0',
                        'transition-all duration-200 ease-in-out'
                    )}>Copied to clipboard.</p>
                    <button
                        className='flex items-center bg-slate-500 p-1 hover:bg-slate-600 text-slate-800'
                        onClick={() => {
                            setShowCopied(true);
                            setTimeout(() => {
                                setShowCopied(false);
                            }, 2000);
                            navigator.clipboard.writeText(props.content);
                        }}
                    >
                        <FaRegClipboard />
                    </button>
                </div>
            </div>
        </div>;
    }

    return <SyntaxHighlighter
        showLineNumbers={true}
        language={props.language}
        renderer={render}
        style={{}}
        PreTag={"a"}
    >
        {props.content}
    </SyntaxHighlighter>;
}