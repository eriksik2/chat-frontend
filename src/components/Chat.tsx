"use client"

import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import ChatTextBox from './ChatTextBox';
import ChatMessage from './ChatMessage';

const systemMessage: OpenAI.Chat.ChatCompletionMessage = {
    role: 'system',
    content: 'You are a chatbot assistant developed by a man named Horik. Please help the user as best as you can. You can also ask the user questions to help them clarify their request. You must ALWAYS end your responses with the exact phrase: "KEYPTS:", followed by key points of the interaction. Each key point should be conveyed in 5-7 words or less. Only the key points will be remembered by you. Example: "KEYPTS: User asked about/if X. X was Y. User said Z. I agreed."',
};

type ChatProps = {
    apiKey: string;
};

export default function Chat(props: ChatProps) {
    const [openai, setOpenai] = useState(new OpenAI({
        apiKey: props.apiKey,
        dangerouslyAllowBrowser: true,
    }));

    const [history, setHistory] = useState<OpenAI.Chat.ChatCompletionMessage[]>([systemMessage]);
    const [displayHistory, setDisplayHistory] = useState<OpenAI.Chat.ChatCompletionMessage[]>([]);
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        setOpenai(new OpenAI({
            apiKey: props.apiKey,
            dangerouslyAllowBrowser: true,
        }));
    }, [props.apiKey])

    function onUserSend(message: string) {
        if (message.trim() === '') return;
        const chatMessage: OpenAI.Chat.ChatCompletionMessage = {
            role: 'user',
            content: message,
        };
        setDisplayHistory([...displayHistory, chatMessage]);
        promptAI(chatMessage);
    }

    async function promptAI(newMessage: OpenAI.Chat.ChatCompletionMessage) {
        setWaiting(true);
        console.log(`Prompting with:`, [...history, newMessage]);
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            //model: "gpt-3.5-turbo",
            messages: [...history, newMessage],
            n: 1,
        });
        const chatMessage: OpenAI.Chat.ChatCompletionMessage = completion.choices[0].message;
        if (chatMessage.content === null) {
            setWaiting(false);
            return;
        }

        console.log(`raw message: ${chatMessage.content}`);

        const split = chatMessage.content.split('KEYPTS:');
        const display = split[0];
        const keypts = split[1];
        setHistory([...history, {
            role: 'assistant',
            content: keypts,
        }]);
        setDisplayHistory([...displayHistory, newMessage, {
            role: 'assistant',
            content: display,
        }]);
        setWaiting(false);
    }

    const [showSummary, setShowSummary] = useState(false);

    return <div className='flex flex-col items-center justify-center p-2'>

        {showSummary ?
            <div className='flex flex-col items-start justify-start gap-2 w-full overflow-auto'>
                {history.map((message, index) => {
                    if (message.content === null) return null;
                    if (message.role === 'system') return null;
                    return <ChatMessage
                        key={index}
                        role={"summary"}
                        content={message.content}
                    />;
                })}
            </div>
            :
            <div className='flex flex-col items-start justify-start gap-2 w-full overflow-auto'>
                {displayHistory.map((message, index) => {
                    if (message.content === null) return null;
                    if (message.role === 'system') return null;
                    return <ChatMessage
                        key={index}
                        role={message.role}
                        content={message.content}
                    />;
                })}
            </div>
        }

        {history.length > 1 &&
            <button
                className='px-4 py-2 text-white bg-blue-500 rounded-full'
                onClick={() => setShowSummary(!showSummary)}
            >{showSummary ? 'Hide' : 'Show'} Summary</button>
        }

        {waiting && <div>Waiting for response...</div>}
        <ChatTextBox
            onSend={onUserSend}
            canSend={!waiting}
        />
    </div>
}