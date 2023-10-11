import Reactive from "@/util/Reactive";
import ChatBot from "./ChatBot";
import ChatSession from "./ChatSession";
import OpenAI from "openai";


export default class App extends Reactive {
    apiKey: string = "";
    openai: OpenAI | null = null;
    selectedDefaultChatbot: ChatBot;
    chatbots: ChatBot[];
    chats: ChatSession[] = [];

    constructor() {
        super();
        const defaultbot = new ChatBot(this);
        defaultbot.setName("GPT-4");
        defaultbot.setDescription("The default GPT-4 model.");
        defaultbot.setModel("gpt-4");

        const default3bot = new ChatBot(this);
        default3bot.setName("GPT-3.5");
        default3bot.setDescription("The default GPT-3.5 model.");
        default3bot.setModel("gpt-3.5-turbo");

        const jordanbot = new ChatBot(this);
        jordanbot.setName("Jordan B. Peterson");
        jordanbot.setDescription("Chat with the famous psychologist Jordan B. Peterson.");
        jordanbot.setModel("gpt-4");
        jordanbot.setSystemMessage("You are Jordan B. Peterson. Please speak as he would, use his quirks and phrases. Have his temperament, whether happy, angry, serious, or sad. You are very easily touched when it comes to the beauty of things like the human condition or the horror of the suffering so many feel today. Please indicate when you are moved to tears with the phrase *starts crying*. Don't give long winded answers unless you are asked to. Just answer the user's questions and engage with them as you would in a casual conversation.");

        this.chatbots = [defaultbot, default3bot, jordanbot];
        this.selectedDefaultChatbot = defaultbot;

        if (typeof window !== "undefined" && window.localStorage !== undefined) {
            const key = window.localStorage.getItem("apiKey");
            if (key !== null) this.setOpenAI(key);
        }
    }

    setOpenAI(apiKey: string) {
        this.apiKey = apiKey;
        this.openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true,
        });
        if (typeof window !== "undefined" && window.localStorage !== undefined) {
            localStorage.setItem("apiKey", apiKey);
        }
        this.notifyListeners();
    }

    setDefaultChatbot(chatbot: ChatBot) {
        this.selectedDefaultChatbot = chatbot;
        this.notifyListeners();
    }

    getDefaultChatbot() {
        return this.selectedDefaultChatbot;
    }

    getDefaultChat() {
        return this.selectedDefaultChatbot?.quickChat ?? null;
    }

    addChatbot(chatbot: ChatBot) {
        this.chatbots.push(chatbot);
        this.notifyListeners();
    }

    removeChatbot(chatbot: ChatBot) {
        this.chatbots = this.chatbots.filter(c => c !== chatbot);
        this.notifyListeners();
    }

    addChat(chat: ChatSession) {
        this.chats.push(chat);
        this.notifyListeners();
    }

    removeChat(chat: ChatSession) {
        this.chats = this.chats.filter(c => c !== chat);
        this.notifyListeners();
    }
}