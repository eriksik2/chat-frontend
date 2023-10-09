import Reactive from '@/util/Reactive';
import OpenAI from 'openai';
import ToolbarItems, { Tool, newTool } from './ToolbarItems';
import ChatState from './ChatState';

const tools: Tool<ChatMessageState>[] = [
    newTool({
        name: 'Summarize',
        tooltip: 'summarize this message',
        invoke: (items) => {
            items.forEach(item => item.setMessage({
                role: 'assistant',
                content: "summary",
            }));
        },
    }),
    newTool({
        name: "Delete",
        tooltip: "delete this message",
        invoke: (items) => {
            items.forEach(item => item.chat.removeMessage(item));
        }
    })
];

export default class ChatMessageState extends Reactive implements ToolbarItems<ChatMessageState> {
    chat: ChatState;
    message: OpenAI.Chat.ChatCompletionMessage;
    selected: boolean = false;

    constructor(chat: ChatState, message: OpenAI.Chat.ChatCompletionMessage) {
        super();
        this.chat = chat;
        this.message = message;
    }

    setSelected(value: boolean) {
        this.selected = value;
        this.notifyListeners();
    }

    setMessage(message: OpenAI.Chat.ChatCompletionMessage) {
        this.message = message;
        this.notifyListeners();
    }

    getToolbarItems() {
        return tools;
    }
};
