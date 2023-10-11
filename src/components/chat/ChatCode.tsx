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
    linenumber: clsx("pr-3"),
};

export default function ChatCode(props: ChatCodeProps) {
    const classNameOverride = props.classNameOverride ?? defaultClassNameOverride;

    const [showCopied, setShowCopied] = useState(false);

    function innerRender(row: rendererNode, stylesheet: {
        [key: string]: React.CSSProperties;
    }): React.ReactNode {

        if (row.type === 'text') {
            return row.value;
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
            const className = row.properties?.className.map((className) => classNameOverride[className] ?? null).filter(item => item !== null).join(' ');
            const noClassName = className === undefined || className.length === 0;
            const noKey = row.properties?.key === undefined;
            const noStyle = Object.keys(style).length === 0;
            if (noClassName && noKey && noStyle) {
                return row.children?.map((child) => innerRender(child, stylesheet))
            }
            return <span
                key={row.properties?.key}
                className={(className?.length ?? 0) === 0 ? undefined : className}
                style={style}
            >
                {row.children?.map((child) => innerRender(child, stylesheet))}
            </span>;
        }
    }
    function render({ rows, stylesheet, useInlineStyles }: rendererProps): React.ReactNode {
        return <div className='rounded overflow-hidden bg-white'>
            <div className='p-2'>
                {rows.map((row) => innerRender(row, prism))}
            </div>
            <div className='w-full bg-slate-400 text-slate-700 flex items-stretch justify-between'>
                <div className='flex items-center p-2 py-1 text-xs'>
                    {props.language}
                </div>
                <div className='flex items-stretch'>
                    <p className='flex items-center text-xs px-1'>Copied to clipboard.</p>
                    <button
                        className='flex items-center bg-slate-500 p-1 hover:bg-slate-600 text-slate-800'
                        onClick={() => {
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
        children={props.content}
        language={props.language}
        renderer={render}
        style={{}}
        PreTag={"a"}
    />;
}