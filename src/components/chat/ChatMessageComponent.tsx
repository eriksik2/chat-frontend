import clsx from 'clsx';
import ChatMarkdown from './ChatMarkdown';
import Completion from '@/state/Completion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaAngleDown, FaCircleNotch } from 'react-icons/fa6';
import ChatFunctionCall from './ChatFunctionCall';


export type ChatMessageContent = {
    type: "md";
    content: string;
} | {
    type: "function";
    name: string;
    arguments: string;
    result?: string;
};

type ChatMessageComponentProps = {
    content: ChatMessageContent[];
    author: string;
    streaming: boolean;
};

export default function ChatMessageComponent(props: ChatMessageComponentProps) {
    return <div
        className={clsx(
            'overflow-hidden',
            'flex flex-row justify-stretch flex-grow min-h-[4rem]',
        )}
    >
        <div className='px-2 my-4 w-[20%] text-black text-lg flex-none border-r border-slate-400'>
            <p className='text-end'>{props.author}</p>
        </div>
        <div className='p-4 pb-2 flex-shrink w-[80%]'>
            {props.content.map((cont, index) => {
                if (cont.type === "md") {
                    return <ChatMarkdown
                        key={index}
                        content={cont.content}
                        loading={props.streaming}
                    />;
                } else if (cont.type === "function") {
                    return <ChatFunctionCall
                        key={index}
                        name={cont.name}
                        arguments={cont.arguments}
                        result={cont.result}
                    />;
                }
            })}
        </div>
    </div>;
}

type ChatMessageStreamingComponentProps = {
    onComplete: (message: ChatMessageContent[]) => void;
    completion: Completion;
    author: string;
};

export function ChatMessageStreamingComponent(props: ChatMessageStreamingComponentProps) {
    const msgRef = useRef<typeof message | null>(null);
    const cntRef = useRef<typeof content | null>(null);

    const [content, setContent] = useState<ChatMessageContent[]>([]);
    cntRef.current = content;

    useEffect(() => {
        props.completion.run(
            (chunk, fn_name, fn_args, fn_res) => {
                const content = new Array(...cntRef.current!);
                if (chunk !== null) {
                    content.push({
                        type: "md" as const,
                        content: chunk,
                    });
                }
                if (fn_name !== null || fn_args !== null) {
                    content.push({
                        type: "function" as const,
                        name: fn_name ?? "",
                        arguments: fn_args ?? "",
                    });
                }
                if (fn_res !== null) {
                    console.log("before fn_res", [...content])
                    const last = content[content.length - 1];
                    if (last.type === "function") {
                        content[content.length - 1] = {
                            type: "function",
                            name: last.name,
                            arguments: last.arguments,
                            result: fn_res,
                        };
                        console.log("after fn_res", [...content])
                    } else console.error("fn_res but last was not function");
                    console.log("after2 fn_res", [...content])
                }

                setContent(content);
                cntRef.current = content;

            },
            () => {
                //const content = new Array(...cntRef.current!);
                const result = msgRef.current!;
                props.onComplete(result);
            }
        );
    }, [props.completion]);

    const message = useMemo(() => {
        return content.reduce<typeof content>((acc, item) => {
            if (acc.length === 0) {
                return [item];
            }
            const last = acc[acc.length - 1];
            const notLast = acc.slice(0, acc.length - 1);
            if (last.type === "md" && item.type === "md") {
                return [...notLast, {
                    type: "md",
                    content: last.content + item.content,
                }];
            } else if (last.type === "function" && item.type === "function" && last.result === undefined) {
                return [...notLast, {
                    type: "function",
                    name: last.name + item.name,
                    arguments: last.arguments + item.arguments,
                    result: item.result,
                }];
            } else {
                return [...acc, item];
            }
        }, []);
    }, [content]);
    msgRef.current = message;

    return <ChatMessageComponent
        content={message}
        author={props.author}
        streaming={true}
    />;
}
