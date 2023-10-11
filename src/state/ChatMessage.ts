import Reactive from '@/util/Reactive';
import OpenAI from 'openai';
import ToolbarItems, { Tool, newTool } from '../util/ToolbarItems';
import ChatSession from './ChatSession';
import ChatBot from './ChatBot';

const tools: Tool<ChatMessage>[] = [
    newTool({
        name: 'Summarize',
        tooltip: 'summarize this message',
        invoke: (items) => {
            items.forEach(item => item.setMessage("summary"));
        },
    }),
    newTool({
        name: "Edit",
        tooltip: "edit this message",
        allowMultiple: false,
        invoke: (items) => {
            items[0].setMessage(prompt("Edit message", items[0].content ?? undefined) ?? items[0].content);
        }
    }),
    newTool({
        name: "Delete",
        tooltip: "delete this message",
        invoke: (items) => {
            items.forEach(item => item.chat!.removeMessage(item));
        }
    })
];

export class NoApiKeyError extends Error {
    constructor() {
        super("OpenAI API key not set");
    }
}

export default class ChatMessage extends Reactive implements ToolbarItems<ChatMessage> {
    chat: ChatSession;
    role: OpenAI.Chat.ChatCompletionRole;
    producer: ChatBot | null = null;
    content: string = "";
    loading: boolean = false;
    selected: boolean = false;

    private constructor(chat: ChatSession, role: OpenAI.Chat.ChatCompletionRole) {
        super();
        this.chat = chat;
        this.role = role;
    }

    static fromUser(chat: ChatSession, message: string): ChatMessage {
        const state = new ChatMessage(chat, 'user');
        state.content = message;
        return state;
    }

    static async fromAI(chat: ChatSession, bot: ChatBot, history: { role: OpenAI.Chat.ChatCompletionRole, content: string }[]): Promise<ChatMessage> {
        if (bot.model === "mock") return ChatMessage.fromAIMock(chat, bot, history);
        const state = new ChatMessage(chat, 'assistant');
        state.producer = bot;
        state.loading = true;
        const messages = bot.system_message !== null ? [
            { role: 'system' as OpenAI.Chat.ChatCompletionRole, content: bot.system_message },
            ...history,
        ] : history;
        console.log(chat);
        const stream = await state.chat.app.openai!.chat.completions.create({
            messages: messages,
            model: bot.model,
            //frequency_penalty: bot.frequency_penalty,
            //presence_penalty: bot.presence_penalty,
            //temperature: bot.temperature,
            stream: true,
            n: 1,
        });
        new Promise(async (resolve, reject) => {
            for await (const message of stream) {
                const choice = message.choices[0];
                const content = choice.delta.content;
                if (choice.finish_reason === "stop") {
                    break;
                }
                if (content === undefined) continue;
                state.setMessage(state.content + content);
            }
            state.loading = false;
            state.notifyListeners();
        });
        return state;
    }

    static async fromAIMock(chat: ChatSession, bot: ChatBot, history: { role: OpenAI.Chat.ChatCompletionRole, content: string }[]): Promise<ChatMessage> {
        const state = new ChatMessage(chat, 'assistant');
        state.producer = bot;
        state.loading = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        new Promise(async (resolve, reject) => {
            var message = `My temperature: ${bot.temperature}. You wrote: ${history[history.length - 1].content}.`;
            var msgParts = [];
            const partLen = 4;
            while (message.length > 0) {
                const endIdx = message.length < partLen ? message.length : partLen;
                msgParts.push(message.substring(0, endIdx));
                message = message.substring(endIdx);
            }
            for (const msgPart of msgParts) {
                state.setMessage(state.content + msgPart);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            state.loading = false;
            state.notifyListeners();
        });
        return state;
    }

    toChatMessage(): { role: OpenAI.Chat.ChatCompletionRole, content: string } {
        return {
            role: this.role,
            content: this.content,
        }
    }

    setSelected(value: boolean) {
        this.selected = value;
        this.notifyListeners();
    }

    setMessage(message: string) {
        this.content = message;
        this.notifyListeners();
    }

    getToolbarItems() {
        return tools;
    }
};
