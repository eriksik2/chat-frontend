import Reactive from '@/util/Reactive';
import ChatMessage from './ChatMessage';
import ToolbarItems, { Tool, newTool } from '../util/ToolbarItems';
import OpenAI from 'openai';
import ChatBot from './ChatBot';
import App from './App';

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
    app: App;
    chatbot: ChatBot;
    history: ChatMessage[] = [];
    loading: boolean = false;

    constructor(app: App, chatbot: ChatBot) {
        super();
        this.app = app;
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
        this.notifyListeners();
    }

    removeMessage(message: ChatMessage) {
        this.history = this.history.filter(m => m !== message);
        this.notifyListeners();
    }

    clearMessages() {
        for (const message of this.history) {
        }
        this.history = [];
        this.notifyListeners();
    }

    getToolbarItems() {
        return tools;
    };

};
