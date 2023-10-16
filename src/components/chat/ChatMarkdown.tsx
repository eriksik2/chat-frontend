import React from "react";
import { LegacyRef } from "react";
import Markdown from "react-markdown";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import ChatCode from "./ChatCode";
import remarkGfm from "remark-gfm";
import ChatBotCardStatic, { ChatBotCard } from "../chatbot/ChatBotCard";

type ChatMarkdownProps = {
    content: string;
    loading: boolean;
};

export default function ChatMarkdown(props: ChatMarkdownProps) {
    const text = `${props.content}${props.loading ? ' ...' : ''}`;

    return <Markdown
        className="markdown-body"
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
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

            hr(props) {
                return <hr className='border-gray-400' {...props} />;
            },

            blockquote(props) {
                return <blockquote className='border-l-4 border-gray-400 pl-2' {...props} />;
            },

            ul(props) {
                return <ul className='list-disc' {...props} />;
            },

            ol(props) {
                return <ol className='list-decimal' {...props} />;
            },

            li(props) {
                return <li className='ml-7' {...props} />;
            },

            pre({ children, className }) {
                if ((children as any)?.type == undefined || (children as any)?.type.name != 'code') {
                    return <pre className={className}>{children}</pre>;
                }
                const codeTag = children as React.ReactElement;
                const codeChildren = codeTag.props.children as string;
                const codeClassName = codeTag.props.className as string;
                const text = String(codeChildren).replace(/\n$/, '');
                const match = /language-(\w+)/.exec(codeClassName || '')
                const language = match ? match[1].toLowerCase() : undefined;
                return <ChatCode
                    language={language}
                    content={text}
                />;
            },

            code(props) {
                return <code className='bg-gray-400 px-1 rounded' {...props} />;
            },

            img(props) {
                const src = (props.src as string).replaceAll("&amp;", "&")
                return <div className="flex justify-center">
                    <img className='max-h-[70vh] rounded' {...props} src={src} />
                </div>
            },

            table(props) {
                return <table className='border border-gray-400' {...props} />;
            },

            thead(props) {
                return <thead className='border-b border-gray-500 bg-slate-400' {...props} />;
            },

            th(props) {
                return <th className='border border-gray-500 px-2' {...props} />;
            },

            td(props) {
                return <td className='border border-gray-400 px-2' {...props} />;
            },

            a(props) {
                const isBotCardTest = /https:\/\/(?:chat\.eriksik.com|localhost|localhost:3000)\/bots\/([-_0-9a-zA-Z]+)/.exec(props.href as string);
                if (isBotCardTest) {
                    const botId = isBotCardTest[1];
                    return <div className="w-full flex justify-center p-2">
                        <ChatBotCard
                            id={botId}
                        />
                    </div>;
                }
                const href = (props.href as string).replaceAll("&amp;", "&")
                return <a className='text-blue-500 hover:underline visited:text-purple-500' {...props} href={href} />;
            },
        }}
    >
        {text}
    </Markdown>;
}