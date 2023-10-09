import Reactive from '@/util/Reactive';
import OpenAI from 'openai';
import ToolbarItems, { Tool, newTool } from './ToolbarItems';
import ChatState from './ChatState';

const tools: Tool<ChatMessageState>[] = [
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
            items[0].setMessage(prompt("Edit message", items[0].message ?? undefined) ?? items[0].message);
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

export default class ChatMessageState extends Reactive implements ToolbarItems<ChatMessageState> {
    chat: ChatState | null = null;
    role: OpenAI.Chat.ChatCompletionRole;
    message: string = "";
    loading: boolean = false;
    selected: boolean = false;

    private constructor(role: OpenAI.Chat.ChatCompletionRole) {
        super();
        this.role = role;
    }

    static fromUser(message: string): ChatMessageState {
        const state = new ChatMessageState('user');
        state.message = message;
        return state;
    }

    static async fromAI(openai: OpenAI, params: Omit<OpenAI.Chat.ChatCompletionCreateParamsStreaming, "stream" | "n">): Promise<ChatMessageState> {
        const state = new ChatMessageState('assistant');
        state.loading = true;
        const stream = await openai.chat.completions.create({
            ...params,
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
                state.setMessage(state.message + content);
            }
            state.loading = false;
            state.notifyListeners();
        });
        return state;
    }

    static async fromAIMock(openai: OpenAI, params: Omit<OpenAI.Chat.ChatCompletionCreateParamsStreaming, "stream" | "n">): Promise<ChatMessageState> {
        const state = new ChatMessageState('assistant');
        state.loading = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        new Promise(async (resolve, reject) => {
            var message = `You wrote: ${params.messages[params.messages.length - 1].content}.`;
            var msgParts = [];
            const partLen = 4;
            while (message.length > 0) {
                const endIdx = message.length < partLen ? message.length : partLen;
                msgParts.push(message.substring(0, endIdx));
                message = message.substring(endIdx);
            }
            for (const msgPart of msgParts) {
                state.setMessage(state.message + msgPart);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            state.loading = false;
            state.notifyListeners();
        });
        return state;
    }

    toChatMessage(): OpenAI.Chat.ChatCompletionMessage {
        return {
            role: this.role,
            content: this.message,
        }
    }

    setSelected(value: boolean) {
        this.selected = value;
        this.notifyListeners();
    }

    setMessage(message: string) {
        this.message = message;
        this.notifyListeners();
    }

    getToolbarItems() {
        return tools;
    }
};
