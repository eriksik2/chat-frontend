import React from "react";
import { LegacyRef } from "react";
import Markdown from "react-markdown";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import ChatCode from "./ChatCode";

type ChatMarkdownProps = {
    content: string;
    loading: boolean;
};

export default function ChatMarkdown(props: ChatMarkdownProps) {
    const text = `${props.content}${props.loading ? ' ...' : ''}`;
    return <Markdown
        children={text}
        components={{
            h1(props) {
                return <h1 className='text-2xl' {...props} />;
            },
            h2(props) {
                return <h2 className='text-xl' {...props} />;
            },
            h3(props) {
                return <h3 className='text-lg' {...props} />;
            },
            h4(props) {
                return <h4 className='text-base' {...props} />;
            },

            code({ children, className }) {
                const text = String(children).replace(/\n$/, '');
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : undefined;
                return <ChatCode
                    language={language}
                    content={text}
                />;
            }
        }}
    />;
}