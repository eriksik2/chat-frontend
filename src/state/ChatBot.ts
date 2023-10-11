
import Reactive from "@/util/Reactive";
import generateUUID from "@/util/generateUUID";
import OpenAI from "openai";
import App from "./App";
import ChatSession from "./ChatSession";

export default class ChatBot extends Reactive {
    app: App;
    quickChat: ChatSession;
    id: string;
    name: string = "New chatbot";
    description: string = "A cool chatbot.";
    model: OpenAI.Chat.Completions.ChatCompletionCreateParams["model"] = "gpt-3.5-turbo";
    system_message: string | null = null;
    frequency_penalty: number = 0;
    presence_penalty: number = 0;
    temperature: number = 0.7;

    constructor(app: App) {
        super();
        this.app = app;
        this.id = generateUUID();
        this.quickChat = new ChatSession(app, this);
    }

    isSelectedDefault() {
        return this.app.selectedDefaultChatbot === this;
    }

    setName(name: string) {
        this.name = name;
        this.notifyListeners();
    }

    setDescription(description: string) {
        this.description = description;
        this.notifyListeners();
    }

    setModel(model: OpenAI.Chat.Completions.ChatCompletionCreateParams["model"]) {
        this.model = model;
        this.notifyListeners();
    }

    setSystemMessage(message: string | null) {
        this.system_message = message;
        this.notifyListeners();
    }

    setFrequencyPenalty(penalty: number) {
        this.frequency_penalty = penalty;
        this.notifyListeners();
    }

    setPresencePenalty(penalty: number) {
        this.presence_penalty = penalty;
        this.notifyListeners();
    }

    setTemperature(temperature: number) {
        this.temperature = temperature;
        this.notifyListeners();
    }
}