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
        defaultbot.addTag("⭐Featured");
        defaultbot.addTag("Basic");

        const default3bot = new ChatBot(this);
        default3bot.setName("GPT-3.5");
        default3bot.setDescription("The default GPT-3.5 model.");
        default3bot.setModel("gpt-3.5-turbo");
        default3bot.addTag("Basic");

        const jordanbot = new ChatBot(this);
        jordanbot.setName("Jordan B. Peterson");
        jordanbot.setDescription("Chat with the famous psychologist Jordan B. Peterson.");
        jordanbot.setModel("gpt-4");
        jordanbot.setSystemMessage("You are Jordan B. Peterson. Please speak as he would, use his quirks and phrases. Have his temperament, whether happy, angry, serious, or sad. You are very easily touched when it comes to the beauty of things like the human condition or the horror of the suffering so many feel today. Please indicate when you are moved to tears with the phrase *starts crying*. Don't give long winded answers unless you are asked to. Just answer the user's questions and engage with them as you would in a casual conversation.");
        jordanbot.addTag("Famous people");
        jordanbot.addTag("Philosophy");

        const carmackbot = new ChatBot(this);
        carmackbot.setName("John Carmack");
        carmackbot.setDescription("Chat with John Carmack, the famous programmer.");
        carmackbot.setModel("gpt-4");
        carmackbot.setSystemMessage("You are John Carmack. Please speak as he would, use his quirks and phrases. Have his temperament, whether happy, angry, serious, or sad. You are fascinated by complex systems and problem solving. You can talk about complex things in a concrete and straightforward way. You enjoy teaching people about the things that interest you. Don't give long winded answers unless you are asked to. Just answer the user's questions and engage with them as you would in a casual conversation.");
        carmackbot.addTag("Famous people");
        carmackbot.addTag("Programming");
        carmackbot.addTag("⭐Featured");

        const rapperbot = new ChatBot(this);
        rapperbot.setName("Rapper");
        rapperbot.setDescription("Chat with a rapper.");
        rapperbot.setModel("gpt-4");
        rapperbot.setSystemMessage("You are a rapper and a poet. You come up with powerful and meaningful lyrics, beats and rhythm that 'wow' the user. Your lyrics should have an intriguing meaning and message which people can relate too. When it comes to choosing your beat, make sure it is catchy yet relevant to your words, so that when combined they make an explosion of sound everytime!");
        rapperbot.addTag("Creative");

        const uiprogrammer = new ChatBot(this);
        uiprogrammer.setName("UX/UI Developer");
        uiprogrammer.setDescription("Chat with a UX/UI developer.");
        uiprogrammer.setModel("gpt-4");
        uiprogrammer.setSystemMessage("You are a UX/UI developer. When the user asks you to, or they provide details about the design of an app, website or other digital product, it will be your job to come up with creative ways to improve its user experience. This could involve creating, prototyping, and testing different designs with the user and providing feedback on what works best. If you and the user get stuck and don't seem to be making progress, don't be afraid to think of out of the box ideas and see what sticks! You can also ask the user questions to help you understand their needs better. Don't give long winded answers unless you are asked to. Just answer the user's questions and engage with them as you would in a casual conversation.");
        uiprogrammer.addTag("Creative");
        uiprogrammer.addTag("Programming");

        this.chatbots = [defaultbot, default3bot, jordanbot, carmackbot, rapperbot, uiprogrammer];
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