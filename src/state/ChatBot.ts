
import Reactive from "@/util/Reactive";
import generateUUID from "@/util/generateUUID";
import OpenAI from "openai";

export default class ChatBot extends Reactive {
    id: string;
    name: string = "New chatbot";
    description: string = "A cool chatbot.";
    model: OpenAI.Chat.Completions.ChatCompletionCreateParams["model"] = "gpt-3.5-turbo";
    system_message: string | null = null;
    frequency_penalty: number | null = null;
    presence_penalty: number | null = null;
    temperature: number | null = null;

    constructor() {
        super();
        this.id = generateUUID();
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

    setFrequencyPenalty(penalty: number | null) {
        this.frequency_penalty = penalty;
        this.notifyListeners();
    }

    setPresencePenalty(penalty: number | null) {
        this.presence_penalty = penalty;
        this.notifyListeners();
    }

    setTemperature(temperature: number | null) {
        this.temperature = temperature;
        this.notifyListeners();
    }
}