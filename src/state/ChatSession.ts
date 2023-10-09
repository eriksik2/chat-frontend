import Reactive from '@/util/Reactive';
import ChatMessage from './ChatMessage';
import ToolbarItems, { Tool, newTool } from '../util/ToolbarItems';
import OpenAI from 'openai';
import ChatBot from './ChatBot';

const tools: Tool<ChatSession>[] = [
    newTool({
        name: 'Summarize all',
        tooltip: 'summarize the entire chat',
        allowMultiple: false,
        invoke: (items) => {
            const chat = items[0];
            var combined = "";
            for (const msg of chat.history) {
                if (msg.role === "system") continue;
                combined += msg.role + " said:\n";
                combined += msg.content + "\n\n";
            }
            combined += "\n\nPlease summarize the above conversation, mentioning the key points and the key takeaways. Refer to the assistant as 'I' in your summary.";
            console.log("Asking gpt to summarize: ", combined);
            chat.addMessage(ChatMessage.fromAI(chat, chat.chatbot, [
                {
                    content: combined,
                    role: "user",
                },
            ]));
            items[0].clearMessages();
        },
    })
];

export default class ChatSession extends Reactive implements ToolbarItems<ChatSession> {
    openai: OpenAI;
    chatbot: ChatBot;
    history: ChatMessage[] = [];
    loading: boolean = false;

    constructor(openai: OpenAI, chatbot: ChatBot) {
        super();
        this.openai = openai;
        this.chatbot = chatbot;
    }

    addMessage(message: ChatMessage | Promise<ChatMessage>) {
        if (message instanceof Promise) {
            this.loading = true;
            this.notifyListeners();
            message.then(message => {
                this.loading = false;
                this.addMessage(message);
            });
            return;
        }
        if (message.chat !== this) throw new Error("Cannot add message from another chat");
        this.history.push(message);
        message.addReactive(this);
        this.notifyListeners();
    }

    removeMessage(message: ChatMessage) {
        this.history = this.history.filter(m => m !== message);
        message.removeReactive(this);
        this.notifyListeners();
    }

    clearMessages() {
        for (const message of this.history) {
            message.removeReactive(this);
        }
        this.history = [];
        this.notifyListeners();
    }

    setOpenAI(openai: OpenAI) {
        this.openai = openai;
        this.notifyListeners();
    }

    getToolbarItems() {
        return tools;
    };

};
