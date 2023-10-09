import Reactive from '@/util/Reactive';
import ChatMessageState from './ChatMessageState';
import ToolbarItems, { Tool, newTool } from './ToolbarItems';
import OpenAI from 'openai';

const tools: Tool<ChatState>[] = [
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
                combined += msg.message + "\n\n";
            }
            combined += "\n\nPlease summarize the above conversation, mentioning the key points and the key takeaways. Refer to the assistant as 'I' in your summary.";
            console.log("Asking gpt to summarize: ", combined);
            chat.addMessage(ChatMessageState.fromAI(chat.openai!, {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        content: combined,
                        role: "user",
                    }
                ]
            }));
            items[0].clearMessages();
        },
    })
];

export default class ChatState extends Reactive implements ToolbarItems<ChatState> {
    openai: OpenAI | null = null;
    history: ChatMessageState[] = [];
    loading: boolean = false;

    constructor() {
        super();
    }

    addMessage(message: ChatMessageState | Promise<ChatMessageState>) {
        if (message instanceof Promise) {
            this.loading = true;
            this.notifyListeners();
            message.then(message => {
                this.loading = false;
                this.addMessage(message);
                this.notifyListeners();
            });
            return;
        }
        if (message.chat !== null) throw new Error("Message already in chat");
        message.chat = this;
        this.history.push(message);
        message.addReactive(this);
        this.notifyListeners();
    }

    removeMessage(message: ChatMessageState) {
        message.chat = null;
        this.history = this.history.filter(m => m !== message);
        message.removeReactive(this);
        this.notifyListeners();
    }

    clearMessages() {
        for (const message of this.history) {
            message.chat = null;
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
